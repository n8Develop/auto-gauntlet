import type { Entity, Vec2 } from './types'

function base(overrides: Partial<Entity> & Pick<Entity, 'type' | 'team' | 'pos' | 'size' | 'color' | 'health' | 'speed' | 'attackRange' | 'attackDamage' | 'attackCooldown'>): Entity {
  return {
    id: crypto.randomUUID(),
    vel: { x: 0, y: 0 },
    maxHealth: overrides.health,
    lastAttackTime: 0,
    alive: true,
    ...overrides,
  }
}

export function createWarrior(pos: Vec2): Entity {
  return base({
    type: 'warrior',
    team: 'hero',
    pos,
    size: 20,
    color: '#4488ff',
    health: 140,   // was 100 — buffed to survive mid-wave pressure
    speed: 80,
    attackRange: 30,
    attackDamage: 15,
    attackCooldown: 800,
  })
}

export function createArcher(pos: Vec2): Entity {
  return base({
    type: 'archer',
    team: 'hero',
    pos,
    size: 16,
    color: '#44ff88',
    health: 80,    // was 60 — archers were dying too quickly to early grunts
    speed: 60,
    attackRange: 150,
    attackDamage: 25,
    attackCooldown: 1200,
  })
}

export function createHealer(pos: Vec2): Entity {
  return base({
    type: 'healer',
    team: 'hero',
    pos,
    size: 16,
    color: '#ffdd44',
    health: 70,    // was 50 — needs to survive long enough to sustain the team
    speed: 70,
    attackRange: 100,
    attackDamage: 0,
    attackCooldown: 1200,  // was 1500 — faster heals (12.5 HPS vs 10 HPS)
  })
}

export function createGrunt(pos: Vec2): Entity {
  return base({
    type: 'grunt',
    team: 'enemy',
    pos,
    size: 16,
    color: '#ff4444',
    health: 40,
    speed: 90,
    attackRange: 25,
    attackDamage: 10,
    attackCooldown: 1000,
  })
}

export function createBrute(pos: Vec2): Entity {
  return base({
    type: 'brute',
    team: 'enemy',
    pos,
    size: 24,
    color: '#aa2222',
    health: 120,
    speed: 40,
    attackRange: 30,
    attackDamage: 25,
    attackCooldown: 1500,
  })
}

export function createPickup(pos: Vec2): Entity {
  return base({
    type: 'pickup',
    team: 'hero',
    pos,
    size: 8,
    color: '#ffffff',
    health: 1,
    speed: 0,
    attackRange: 0,
    attackDamage: 0,
    attackCooldown: 0,
  })
}
