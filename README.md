# Auto-Gauntlet

A fully autonomous browser game where three heroes battle endless waves of enemies — no input required. Just open it and watch.

Three heroes (a warrior, an archer, and a healer) fight waves of increasingly powerful enemies across an endless arena. The warrior charges into melee, the archer kites from range and targets low-HP enemies, and the healer chases wounded allies. Enemies spawn from the edges in growing numbers, get tougher every wave, and will eventually overwhelm the team. How far can they get?

## How to Run

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`) in any modern browser.

## Game Mechanics

**Heroes**
- **Warrior** — High HP tank. Charges the nearest enemy and attacks in melee.
- **Archer** — Ranged attacker. Targets lowest-HP enemies and maintains a safe distance.
- **Healer** — No offense. Chases wounded allies and heals them. Follows the warrior when no one needs healing.

**Enemies**
- **Grunt** — Fast and numerous. Low HP but swarms the heroes.
- **Brute** — Slow, tough, hard-hitting. Appears more frequently in later waves.

Enemies spawn from the arena edges and march toward the nearest hero. Killing an enemy has a 30% chance to drop a pickup that heals the first hero to walk over it.

**Waves**
Each cleared wave awards a score bonus and starts a 2-second intermission before the next wave spawns. Enemy count, HP, and damage scale up each wave. Expect to survive roughly 8–12 waves before the team is overwhelmed.

**Scoring**
- +10 per enemy kill
- +50 per wave cleared
- Game restarts automatically 3 seconds after all heroes die.

## Tech Stack

- **TypeScript** — strict mode, no classes (factory functions + plain data objects)
- **Vite 7** — dev server and build
- **Canvas 2D API** — rectangle art, no libraries or WebGL

---

Built as a test project for [Shepherd](https://github.com/n8Develop/shepherd) — exercising phased CLI agent dispatch for multi-phase game development.
