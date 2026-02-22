---
paths:
  - "src/**"
---

# Game Conventions

When working with game source files:

- All entities implement the `Entity` interface from `src/types.ts` — never create ad-hoc entity shapes
- Entity factory functions live in `src/entities.ts` — don't inline entity creation elsewhere
- Systems are pure functions operating on `GameState` — no module-level mutable state
- Never mutate `entities[]` during iteration — build a new filtered array, then assign back
- Positions are in pixels, times in milliseconds, sizes are rectangle side lengths in pixels
- Use `crypto.randomUUID()` for entity IDs
- Canvas rendering uses only `CanvasRenderingContext2D` — no DOM elements overlaid on the canvas
- The game loop uses `requestAnimationFrame` with delta time — never assume fixed frame rate
- Entity colors are CSS color strings (hex or named colors)
