import { createInitialState, updateGame } from './game'

const canvas = document.getElementById('game') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

let state = createInitialState()
let lastTime = 0
let deltaLogged = false

function loop(timestamp: number): void {
  const deltaTime = lastTime === 0 ? 0 : timestamp - lastTime
  lastTime = timestamp

  if (!deltaLogged && deltaTime > 0) {
    console.log(`[auto-gauntlet] game loop running — first delta: ${deltaTime.toFixed(2)}ms`)
    deltaLogged = true
  }

  state = updateGame(ctx, state, deltaTime)
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
