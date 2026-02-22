import type { Entity, GameState, DamageNumber } from './types'

const HEALTH_BAR_HEIGHT = 3
const HEALTH_BAR_GAP = 2
const ATTACK_FLASH_DURATION = 100   // ms: window after lastAttackTime that shows flash
const DAMAGE_NUMBER_LIFETIME = 600  // ms: total lifetime of a floating damage number

export function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, width, height)
}

export function drawEntity(ctx: CanvasRenderingContext2D, entity: Entity, now: number): void {
  const { pos, size, color, health, maxHealth, vel, lastAttackTime } = entity

  const isFlashing = lastAttackTime > 0 && now - lastAttackTime < ATTACK_FLASH_DURATION
  const flashExpand = isFlashing ? 2 : 0
  const drawSize = size + flashExpand * 2
  const half = drawSize / 2
  const x = pos.x - half
  const y = pos.y - half

  // Entity rectangle (expanded on attack flash)
  ctx.fillStyle = color
  ctx.fillRect(x, y, drawSize, drawSize)

  // Attack flash: bright white overlay
  if (isFlashing) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
    ctx.fillRect(x, y, drawSize, drawSize)
  }

  // Facing indicator: 4px line from center in velocity direction
  const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y)
  if (speed > 1) {
    const nx = vel.x / speed
    const ny = vel.y / speed
    const lineEnd = size / 2 + 4
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.lineTo(pos.x + nx * lineEnd, pos.y + ny * lineEnd)
    ctx.stroke()
  }

  // Health bar (anchored to original, un-expanded bounds)
  const origHalf = size / 2
  const barX = pos.x - origHalf
  const barY = pos.y - origHalf - HEALTH_BAR_GAP - HEALTH_BAR_HEIGHT
  ctx.fillStyle = '#660000'
  ctx.fillRect(barX, barY, size, HEALTH_BAR_HEIGHT)
  const healthRatio = Math.max(0, health / maxHealth)
  ctx.fillStyle = '#00cc44'
  ctx.fillRect(barX, barY, size * healthRatio, HEALTH_BAR_HEIGHT)
}

export function drawEntities(ctx: CanvasRenderingContext2D, entities: Entity[], now: number): void {
  for (const entity of entities) {
    if (entity.alive) {
      drawEntity(ctx, entity, now)
    }
  }
}

export function drawDamageNumbers(ctx: CanvasRenderingContext2D, numbers: DamageNumber[]): void {
  ctx.font = 'bold 12px monospace'
  ctx.textAlign = 'center'
  for (const dn of numbers) {
    const alpha = 1 - dn.age / DAMAGE_NUMBER_LIFETIME
    const yOffset = (dn.age / DAMAGE_NUMBER_LIFETIME) * 28  // drift 28px upward over lifetime
    ctx.fillStyle = `rgba(255, 220, 50, ${alpha.toFixed(2)})`
    ctx.fillText(dn.text, dn.pos.x, dn.pos.y - yOffset)
  }
}

export function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  const now = performance.now()

  // Clear canvas first — no transform so full rect is always cleared
  clearCanvas(ctx, state.arena.width, state.arena.height)

  // Camera shake: random offset decaying to zero as remaining → 0
  let shakeX = 0
  let shakeY = 0
  if (state.cameraShake && state.cameraShake.remaining > 0) {
    const intensity = 4 * (state.cameraShake.remaining / 300)
    shakeX = (Math.random() * 2 - 1) * intensity
    shakeY = (Math.random() * 2 - 1) * intensity
  }

  ctx.save()
  ctx.translate(shakeX, shakeY)

  // Arena border
  ctx.strokeStyle = '#444444'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, state.arena.width - 2, state.arena.height - 2)

  drawEntities(ctx, state.entities, now)
  drawDamageNumbers(ctx, state.damageNumbers)

  ctx.restore()
}
