export type Vec2 = { x: number; y: number }
export type Team = 'hero' | 'enemy'
export type EntityType = 'warrior' | 'archer' | 'healer' | 'grunt' | 'brute' | 'pickup'

export interface Entity {
  id: string
  type: EntityType
  team: Team
  pos: Vec2
  vel: Vec2
  size: number          // rectangle side length
  color: string
  health: number
  maxHealth: number
  speed: number
  attackRange: number
  attackDamage: number
  attackCooldown: number  // ms between attacks
  lastAttackTime: number
  alive: boolean
}

export interface GameState {
  entities: Entity[]
  wave: number
  score: number
  status: 'playing' | 'wave_transition' | 'game_over'
  arena: { width: number; height: number }
  transitionTimer: number
}

export interface WaveConfig {
  enemyCount: number
  types: { type: EntityType; weight: number }[]
  healthMultiplier: number
  damageMultiplier: number
}
