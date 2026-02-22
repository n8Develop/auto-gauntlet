import type { GameState } from './types'
import { createWarrior, createArcher, createHealer } from './entities'
import { render } from './renderer'
import { updateAI } from './ai'
import { updateCombat } from './combat'
import { generateWaveConfig, spawnWave, isWaveClear } from './waves'
import { drawHUD } from './hud'

const WAVE_TRANSITION_DURATION = 2000 // ms
const GAME_OVER_DURATION = 3000       // ms
const DAMAGE_NUMBER_LIFETIME = 600    // ms — must match renderer constant

function createHeroes(arena: { width: number; height: number }) {
  const cx = arena.width / 2
  const cy = arena.height / 2
  return [
    createWarrior({ x: cx - 40, y: cy }),
    createArcher({ x: cx,       y: cy - 40 }),
    createHealer({ x: cx + 40,  y: cy }),
  ]
}

export function createInitialState(): GameState {
  const arena = { width: 800, height: 600 }
  const wave = 1
  const base: GameState = {
    entities: createHeroes(arena),
    wave,
    score: 0,
    status: 'playing',
    arena,
    transitionTimer: 0,
    damageNumbers: [],
    waveAnnouncement: { text: 'Wave 1', remaining: 2000 },
    cameraShake: null,
  }
  return spawnWave(base, generateWaveConfig(wave))
}

export function updateGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  deltaTime: number,
): GameState {
  // First frame: just render, no logic
  if (deltaTime === 0) {
    render(ctx, state)
    drawHUD(ctx, state)
    return state
  }

  let next = state

  // Age and prune damage numbers every frame (independent of game status)
  next = {
    ...next,
    damageNumbers: next.damageNumbers
      .map(dn => ({ ...dn, age: dn.age + deltaTime }))
      .filter(dn => dn.age < DAMAGE_NUMBER_LIFETIME),
  }

  // Tick wave announcement
  if (next.waveAnnouncement) {
    const remaining = next.waveAnnouncement.remaining - deltaTime
    next = {
      ...next,
      waveAnnouncement: remaining > 0 ? { text: next.waveAnnouncement.text, remaining } : null,
    }
  }

  // Tick camera shake
  if (next.cameraShake) {
    const remaining = next.cameraShake.remaining - deltaTime
    next = { ...next, cameraShake: remaining > 0 ? { remaining } : null }
  }

  if (state.status === 'playing') {
    // Count heroes alive before combat to detect kills/deaths
    const heroesBefore = next.entities.filter(
      e => e.alive && e.team === 'hero' && e.type !== 'pickup'
    ).length
    const enemiesBefore = next.entities.filter(
      e => e.alive && e.team === 'enemy' && e.type !== 'pickup'
    ).length

    // 1. AI — sets velocities
    next = updateAI(next, deltaTime)

    // 2. Movement — apply velocities, clamp to arena
    const dt = deltaTime / 1000
    next = {
      ...next,
      entities: next.entities.map(entity => {
        if (entity.type === 'pickup') return entity
        const half = entity.size / 2
        const x = Math.max(half, Math.min(next.arena.width  - half, entity.pos.x + entity.vel.x * dt))
        const y = Math.max(half, Math.min(next.arena.height - half, entity.pos.y + entity.vel.y * dt))
        return { ...entity, pos: { x, y } }
      }),
    }

    // 3. Combat — attacks, healing, pickups, death, damage numbers
    next = updateCombat(next, deltaTime)

    // 4. Score kills (+10 each)
    const enemiesAfter = next.entities.filter(
      e => e.alive && e.team === 'enemy' && e.type !== 'pickup'
    ).length
    const kills = enemiesBefore - enemiesAfter
    if (kills > 0) next = { ...next, score: next.score + kills * 10 }

    // 5. Detect hero deaths → trigger camera shake
    const heroesAfter = next.entities.filter(
      e => e.alive && e.team === 'hero' && e.type !== 'pickup'
    ).length
    if (heroesAfter < heroesBefore) {
      next = { ...next, cameraShake: { remaining: 300 } }
    }

    // 6. Check game over (all heroes dead) — takes priority over wave clear
    if (heroesAfter === 0) {
      next = { ...next, status: 'game_over', transitionTimer: GAME_OVER_DURATION }
    } else if (isWaveClear(next)) {
      // 7. Wave clear → +50 bonus, begin transition
      next = { ...next, score: next.score + 50, status: 'wave_transition', transitionTimer: WAVE_TRANSITION_DURATION }
    }

  } else if (state.status === 'wave_transition') {
    const timer = next.transitionTimer - deltaTime
    if (timer <= 0) {
      // Advance wave: spawn fresh enemies, keep existing heroes + pickups, show announcement
      const nextWave = state.wave + 1
      next = spawnWave(
        {
          ...next,
          wave: nextWave,
          status: 'playing',
          transitionTimer: 0,
          waveAnnouncement: { text: `Wave ${nextWave}`, remaining: 2000 },
        },
        generateWaveConfig(nextWave),
      )
    } else {
      next = { ...next, transitionTimer: timer }
    }

  } else if (state.status === 'game_over') {
    const timer = next.transitionTimer - deltaTime
    if (timer <= 0) {
      next = createInitialState()
    } else {
      next = { ...next, transitionTimer: timer }
    }
  }

  render(ctx, next)
  drawHUD(ctx, next)
  return next
}
