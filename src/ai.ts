import type { GameState, Entity, Vec2 } from './types'

function dist(a: Entity, b: Entity): number {
  const dx = a.pos.x - b.pos.x
  const dy = a.pos.y - b.pos.y
  return Math.sqrt(dx * dx + dy * dy)
}

function nearest(from: Entity, candidates: Entity[]): Entity | null {
  let best: Entity | null = null
  let bestDist = Infinity
  for (const c of candidates) {
    const d = dist(from, c)
    if (d < bestDist) { bestDist = d; best = c }
  }
  return best
}

function lowestHP(candidates: Entity[]): Entity | null {
  let best: Entity | null = null
  let bestHP = Infinity
  for (const c of candidates) {
    if (c.health < bestHP) { bestHP = c.health; best = c }
  }
  return best
}

function velToward(from: Vec2, to: Vec2, speed: number): Vec2 {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const d = Math.sqrt(dx * dx + dy * dy)
  if (d < 1) return { x: 0, y: 0 }
  return { x: (dx / d) * speed, y: (dy / d) * speed }
}

function velAway(from: Vec2, to: Vec2, speed: number): Vec2 {
  return velToward(to, from, speed)
}

export function updateAI(state: GameState, _dt: number): GameState {
  const living = state.entities.filter(e => e.alive)
  const heroes = living.filter(e => e.team === 'hero' && e.type !== 'pickup')
  const enemies = living.filter(e => e.team === 'enemy')
  const warrior = heroes.find(e => e.type === 'warrior') ?? null

  const entities = state.entities.map(entity => {
    if (!entity.alive || entity.type === 'pickup') return entity

    let vel: Vec2 = { x: 0, y: 0 }

    switch (entity.type) {
      case 'warrior': {
        const target = nearest(entity, enemies)
        if (target) vel = velToward(entity.pos, target.pos, entity.speed)
        break
      }
      case 'archer': {
        const target = lowestHP(enemies)
        if (target) {
          const d = dist(entity, target)
          if (d > 120) vel = velToward(entity.pos, target.pos, entity.speed)
          else if (d < 80) vel = velAway(entity.pos, target.pos, entity.speed)
          // else stay put — vel remains { x: 0, y: 0 }
        }
        break
      }
      case 'healer': {
        const wounded = heroes.filter(h => h.id !== entity.id && h.health < h.maxHealth * 0.8)
        const target = wounded.length > 0 ? nearest(entity, wounded) : warrior
        if (target) vel = velToward(entity.pos, target.pos, entity.speed)
        break
      }
      case 'grunt':
      case 'brute': {
        const target = nearest(entity, heroes)
        if (target) vel = velToward(entity.pos, target.pos, entity.speed)
        break
      }
    }

    return { ...entity, vel }
  })

  return { ...state, entities }
}
