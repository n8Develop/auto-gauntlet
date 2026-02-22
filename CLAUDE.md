# Auto-Gauntlet

## Current Priority

**Phase 0: Foundation** — scaffold Vite + TypeScript project, shared types, game loop, Canvas renderer.

## Project Overview

Auto-play gauntlet game. Fully hands-off, endless waves, browser Canvas, rectangle art. Three heroes fight waves of enemies autonomously. No user input — pure spectator game.

**Tech Stack:** TypeScript, Vite 7, Canvas 2D API
**Platform:** Browser (any modern browser with Canvas support)

## Architecture

### Core Loop
```
requestAnimationFrame →
  1. Update AI (pick targets, set velocities)
  2. Update movement (apply velocity, arena bounds)
  3. Update combat (range check, apply damage, remove dead)
  4. Update waves (check wave clear, spawn next)
  5. Update game state (check game over, track score)
  6. Render (clear canvas, draw entities, draw HUD)
```

### Key Patterns
- All game entities share the `Entity` interface from `src/types.ts` — this is the contract
- Systems are pure functions: `(state, deltaTime) => state` where practical
- No classes — factory functions + data objects
- Canvas 2D only — no libraries, no WebGL

### File Structure
```
src/
├── main.ts        — Entry point: create canvas, start game loop
├── types.ts       — Shared types (Vec2, Entity, GameState, WaveConfig)
├── renderer.ts    — Canvas 2D renderer (entities as colored rectangles)
├── entities.ts    — Entity factory functions
├── combat.ts      — Range detection, auto-attack, damage, death
├── ai.ts          — Hero AI + enemy AI (target selection, movement)
├── waves.ts       — Wave spawner, difficulty scaling
├── hud.ts         — Score, wave number, health bars
└── game.ts        — Game state machine
```

## Conventions

- Entity types and teams are string literals, not enums
- All positions in pixels, all times in milliseconds
- Entity IDs are `crypto.randomUUID()`
- Colors are CSS color strings
- No mutation of entity arrays during iteration — filter to new array

## Key Commands

```bash
# Install
npm install

# Dev server
npm run dev

# Build
npm run build

# Type check
npx tsc --noEmit
```

## Development Status

### Completed
- [x] Workspace configuration (CLAUDE.md, settings, rules, code reviewer)
- [x] Shared types contract (`src/types.ts`)

### In Progress
- [ ] Phase 0: Foundation (scaffold, game loop, renderer, entity factories)

### Future
- [ ] Phase 1: Combat + AI
- [ ] Phase 2: Waves + Game Flow
- [ ] Phase 3: Polish

## Compaction Policy

When compacting, always preserve: modified file paths, test/validation commands, current phase, and the types.ts contract.

## Verification Requirement

Every implementation must include verification — tests to run, expected output, or a command to confirm the result works. Never consider a task complete without defining how to verify success.
