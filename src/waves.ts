// Balance notes (tuned for ~8-12 wave average run):
//
// Original formula was:
//   enemyCount:        3 + floor(N * 1.5)   → W8: 15, W12: 21
//   healthMultiplier:  1 + N * 0.15         → W8: 2.2x, W12: 2.8x
//   damageMultiplier:  1 + N * 0.10         → W8: 1.8x, W12: 2.2x
//
// Problem: damage scaling was too steep. At wave 8 with 15 enemies,
// combined enemy DPS (≈300+) overwhelmed heroes (290 total HP) in under
// 2 seconds once a pack converged.
//
// Changes made:
//   enemyCount:        2 + floor(N * 1.3)   — slightly lower count, ramp feels smoother
//   healthMultiplier:  1 + N * 0.12         — enemies still get tanky, just a bit slower
//   damageMultiplier:  1 + N * 0.07         — primary lever: reduced from 0.10 → 0.07
//     W8 now: 1.56x dmg (was 1.80x) — meaningful reduction per enemy
//     W10 now: 1.70x dmg (was 2.00x)
//     W12 now: 1.84x dmg (was 2.20x)
//
// Hero buffs (entities.ts) also contribute:
//   Warrior: 100 → 140 HP, Archer: 60 → 80 HP, Healer: 50 → 70 HP
//   Healer cooldown: 1500 → 1200ms (12.5 HPS sustain vs 10 HPS)
//
// Expected outcome: heroes clear W1-5 with ease, W6-9 are tense, W10-12 are deadly.

import type { GameState, WaveConfig, Entity, EntityType } from './types'
import { createGrunt, createBrute } from './entities'

export function generateWaveConfig(waveNumber: number): WaveConfig {
  const bruteWeight = Math.min(0.4, 0.1 + waveNumber * 0.03)
  return {
    enemyCount: 2 + Math.floor(waveNumber * 1.3),
    healthMultiplier: 1 + waveNumber * 0.12,
    damageMultiplier: 1 + waveNumber * 0.07,
    types: [
      { type: 'brute', weight: bruteWeight },
      { type: 'grunt', weight: 1 - bruteWeight },
    ],
  }
}

function pickType(config: WaveConfig): EntityType {
  const r = Math.random()
  let cumulative = 0
  for (const t of config.types) {
    cumulative += t.weight
    if (r < cumulative) return t.type
  }
  return config.types[config.types.length - 1].type
}

function randomEdgePos(arena: { width: number; height: number }): { x: number; y: number } {
  const edge = Math.floor(Math.random() * 4) // 0=top, 1=right, 2=bottom, 3=left
  switch (edge) {
    case 0: return { x: 20 + Math.random() * (arena.width  - 40), y: 10 }
    case 1: return { x: arena.width  - 10, y: 20 + Math.random() * (arena.height - 40) }
    case 2: return { x: 20 + Math.random() * (arena.width  - 40), y: arena.height - 10 }
    default: return { x: 10, y: 20 + Math.random() * (arena.height - 40) }
  }
}

export function spawnWave(state: GameState, config: WaveConfig): GameState {
  const newEnemies: Entity[] = []
  for (let i = 0; i < config.enemyCount; i++) {
    const pos = randomEdgePos(state.arena)
    const type = pickType(config)
    const base = type === 'brute' ? createBrute(pos) : createGrunt(pos)
    const scaledHealth = Math.round(base.health * config.healthMultiplier)
    newEnemies.push({
      ...base,
      health: scaledHealth,
      maxHealth: scaledHealth,
      attackDamage: Math.round(base.attackDamage * config.damageMultiplier),
    })
  }
  return { ...state, entities: [...state.entities, ...newEnemies] }
}

export function isWaveClear(state: GameState): boolean {
  return !state.entities.some(e => e.alive && e.team === 'enemy' && e.type !== 'pickup')
}
