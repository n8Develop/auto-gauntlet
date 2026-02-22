import type { GameState, Entity, DamageNumber } from './types'
import { createPickup } from './entities'

const HEALER_HEAL_AMOUNT = 15

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

export function updateCombat(state: GameState, _dt: number): GameState {
  const now = performance.now()

  // Shallow-copy all entities so we can mutate freely without touching originals
  const entities = state.entities.map(e => ({ ...e }))
  const newDamageNumbers: DamageNumber[] = []

  // Process attacks
  for (const attacker of entities) {
    if (!attacker.alive || attacker.type === 'pickup') continue
    if (now - attacker.lastAttackTime < attacker.attackCooldown) continue

    if (attacker.type === 'healer') {
      const wounded = entities.filter(e =>
        e.alive && e.team === 'hero' && e.type !== 'pickup' &&
        e.id !== attacker.id && e.health < e.maxHealth
      )
      const target = nearest(attacker, wounded)
      if (!target || dist(attacker, target) > attacker.attackRange) continue
      target.health = Math.min(target.health + HEALER_HEAL_AMOUNT, target.maxHealth)
      attacker.lastAttackTime = now
    } else {
      const opponents = entities.filter(e =>
        e.alive && e.team !== attacker.team && e.type !== 'pickup'
      )
      const target = nearest(attacker, opponents)
      if (!target || dist(attacker, target) > attacker.attackRange) continue
      target.health -= attacker.attackDamage
      if (target.health <= 0) target.alive = false
      attacker.lastAttackTime = now

      // Emit floating damage number at target position
      newDamageNumbers.push({
        pos: {
          x: target.pos.x + (Math.random() * 12 - 6),
          y: target.pos.y,
        },
        text: `-${Math.round(attacker.attackDamage)}`,
        age: 0,
      })
    }
  }

  // Pickup collection: hero walks over pickup -> heal 20hp (capped), pickup disappears
  const livingHeroes = entities.filter(e => e.alive && e.team === 'hero' && e.type !== 'pickup')
  for (const pickup of entities.filter(e => e.alive && e.type === 'pickup')) {
    for (const hero of livingHeroes) {
      if (dist(hero, pickup) < hero.size) {
        hero.health = Math.min(hero.health + 20, hero.maxHealth)
        pickup.alive = false
        break // each pickup can only be collected once
      }
    }
  }

  // Before filtering, spawn a pickup at each newly dead enemy's position (30% chance)
  const newPickups: Entity[] = []
  for (const e of entities) {
    if (!e.alive && e.team === 'enemy' && e.type !== 'pickup') {
      if (Math.random() < 0.3) {
        newPickups.push(createPickup({ x: e.pos.x, y: e.pos.y }))
      }
    }
  }

  return {
    ...state,
    entities: [...entities.filter(e => e.alive), ...newPickups],
    damageNumbers: [...state.damageNumbers, ...newDamageNumbers],
  }
}
