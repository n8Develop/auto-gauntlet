import type { GameState } from './types'

const HERO_BAR_WIDTH = 80
const HERO_BAR_HEIGHT = 8
const WAVE_ANNOUNCE_DURATION = 2000  // ms: total display time for wave announcement

export function drawHUD(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { arena, wave, score, status } = state

  // Wave number — top left
  ctx.font = 'bold 16px monospace'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`Wave ${wave}`, 12, 24)

  // Score — top right
  ctx.textAlign = 'right'
  ctx.fillText(`Score: ${score}`, arena.width - 12, 24)

  // Hero health bars near bottom
  const heroes = state.entities.filter(e => e.team === 'hero' && e.type !== 'pickup')
  const barAreaWidth = heroes.length * (HERO_BAR_WIDTH + 16) - 16
  let barX = (arena.width - barAreaWidth) / 2
  const barY = arena.height - 36

  ctx.font = '10px monospace'
  for (const hero of heroes) {
    // Label
    ctx.textAlign = 'left'
    ctx.fillStyle = hero.alive ? hero.color : '#555555'
    ctx.fillText(hero.type, barX, barY - 4)

    // Bar background
    ctx.fillStyle = '#333333'
    ctx.fillRect(barX, barY, HERO_BAR_WIDTH, HERO_BAR_HEIGHT)

    // Bar foreground
    const ratio = hero.alive ? Math.max(0, hero.health / hero.maxHealth) : 0
    ctx.fillStyle = hero.alive ? hero.color : '#444444'
    ctx.fillRect(barX, barY, HERO_BAR_WIDTH * ratio, HERO_BAR_HEIGHT)

    barX += HERO_BAR_WIDTH + 16
  }

  // Wave announcement: large centered text that fades out over last 500ms
  if (state.waveAnnouncement) {
    const { text, remaining } = state.waveAnnouncement
    const alpha = Math.min(1, remaining / 500)  // fades out when remaining < 500ms
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.font = 'bold 52px monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(text, arena.width / 2, arena.height / 2 - 40)
    ctx.restore()
  }

  if (status === 'game_over') {
    drawGameOver(ctx, state)
  }
}

function drawGameOver(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { arena, score, transitionTimer } = state
  const cx = arena.width / 2
  const cy = arena.height / 2

  // Dim overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)'
  ctx.fillRect(0, 0, arena.width, arena.height)

  ctx.textAlign = 'center'

  // GAME OVER
  ctx.font = 'bold 52px monospace'
  ctx.fillStyle = '#ff4444'
  ctx.fillText('GAME OVER', cx, cy - 24)

  // Final score
  ctx.font = 'bold 22px monospace'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`Final Score: ${score}`, cx, cy + 16)

  // Countdown
  const seconds = Math.max(1, Math.ceil(transitionTimer / 1000))
  ctx.font = '16px monospace'
  ctx.fillStyle = '#aaaaaa'
  ctx.fillText(`Restarting in ${seconds}...`, cx, cy + 46)
}
