# Hueline

PWA tunnel-runner. Match the hue. Break the wall.

Live: https://nickcason.github.io/hueline/

## What it is

Hueline is a portrait-mode arcade game for phones and desktop browsers. You are a glowing orb at the near end of a neon tunnel. Glass-frame barriers slide toward you, each tinted with a target hue. You spin a hue dial to change your own color, and a barrier breaks only if your hue is within its tolerance when it reaches you. A miss ends the run. Speed climbs and the match window narrows as the run goes on.

It is a static single-page app (SvelteKit with the static adapter, drawn with three.js) that installs as a PWA. Progress lives in the browser's localStorage. There is no server.

## What it does

- **Hue matching.** On arrival, the player's hue is compared with the barrier's target by the shortest arc around the color wheel, so 359 and 1 degrees are 2 apart. Inside the tolerance the barrier breaks and scores; outside it the run ends.
- **Controls.** Drag vertically on a touch screen to rotate the dial (up raises the hue, 1.5 degrees per pixel), or use the Up and Down arrow keys (12 degrees a press). A ring-and-needle dial in the corner shows the hue, and the orb takes the same color.
- **Difficulty.** Barrier speed rises from 5 to 20 units per second over 90 seconds. The match window starts at 25 degrees either side of the target and shrinks to 8 after 45 seconds.
- **Scoring.** 100 points per break, scaled by speed and by a closeness bonus of up to 1.5x, then by a streak bonus of 5% per consecutive break (capped at +100%). A run banks one "chroma" per 100 points.
- **Powerups.** About 5% of barriers bring one. Slow-mo runs time at 0.4x for 4 seconds. Hue magnet widens the match window by 10 degrees for 3 seconds. A gradient powerup is defined too (see Status).
- **Shop.** Chroma buys levels in three dial upgrades (10 levels each, 50 chroma for the first, doubling each time) and two cosmetics (200 each). "Wider tolerance" adds 2 degrees per level.
- **Look.** Glass-frame barriers colored by hue, a neon wireframe tunnel, a bloom pass and a 64-particle burst on each break. It is all procedural geometry and GLSL shaders; there are no textures or models.
- **Persistence and PWA.** Progress is stored under one localStorage key and checked with Zod on load; unreadable data falls back to defaults. A generated service worker allows offline play, and the manifest is standalone and portrait.

## How it works

Game rules are plain TypeScript with no three.js types. Each system is a function from state to new state.

- `src/game/loop.ts`: `tick(state, dt, intents)` runs input, spawn, motion, powerup and collision in order, with the time step clamped to 0.1 s. Each system lives in `src/game/systems/` with a Vitest file beside it; `difficulty.ts` holds the speed and tolerance curves.
- `src/render/`: the three.js side. `scene.ts` sets up the renderer, camera, fog and bloom. `sync.ts` copies state into the scene every frame (tunnel, a pool of barrier meshes, the orb, particle bursts). Geometry builders are in `geometry/` and shader materials in `materials/`.
- `src/lib/GameCanvas.svelte` owns the animation loop: it collects input as intents, calls `tick`, syncs and draws, and pauses on WebGL context loss.
- Routes: `/` (title), `/play`, `/results`, `/shop`. When a run ends, `/play` stores the score in sessionStorage and goes to `/results`, which banks chroma and the best score into localStorage.

## How to run it

```bash
npm install
npm run dev          # Vite dev server (add -- --host to reach it from a phone on the same network)
npm test             # vitest, single run (npm run test:unit for watch mode)
npm run test:e2e     # Playwright smoke test; run `npx playwright install` first
npm run check        # svelte-check
npm run lint         # prettier --check and eslint
npm run build        # production bundle in build/; the prebuild hook regenerates the icons
npm run preview      # serve the built bundle
```

## Configuration

- `src/game/tuning.ts` holds the gameplay constants: `v0`, `vmax`, `T_ramp`, `T_smooth`, `T_tight`, `toleranceEasy`, `toleranceHard`, `basePoints`, `maxBonusGain`, `powerupDropP`, `detents` and `powerups`. Spawn distance and gap are in `src/game/systems/spawn.ts`; shop prices are in `src/routes/shop/+page.svelte`.
- `svelte.config.js` sets `paths.base` to `/hueline` when `NODE_ENV` is `production` (the CI build sets it) and to nothing in dev.
- `vite.config.ts` holds the PWA manifest and workbox settings.
- Storage keys: localStorage `hueline.progress`, sessionStorage `hueline.lastRun`.

## Layout

```
src/game/          state, loop, hue maths, tuning, systems/ (with tests)
src/render/        scene, sync, geometry/, layers/, materials/
src/lib/           GameCanvas, Hud, DialIndicator
src/routes/        title, play, results, shop
src/storage/       Zod schema and localStorage adapter
static/, scripts/  icon.svg, generated PNG icons, generate-icons.mjs (sharp)
e2e/               Playwright smoke spec
docs/superpowers/  design spec and implementation plan
.github/workflows/deploy.yml   GitHub Pages deploy
```

## Status

The v1 game loop is playable. A workflow in the repo publishes `main` to GitHub Pages at the URL above. There are 52 commits, 2026-05-22 to 2026-05-23; the last made the controls vertical-only. Sound, leaderboards and daily challenges are deferred to v2.

Not finished, from reading the code:

- The design spec and plan describe three lanes. That mechanic was removed on 2026-05-23; the game is now hue-only on a single track.
- Only the "Wider tolerance" upgrade changes play. "Eased dial" and "Detent grace" can be bought and are saved, but nothing reads them (the dial no longer has detents).
- The cosmetics can be bought and equipped, but the renderer does not read the equipped choice.
- The gradient powerup counts down but never changes a barrier, and pickups are not drawn; they are collected automatically as they reach the player.
- The shop still has a "+100" chroma button added for testing.
- The Playwright smoke test still presses the left and right arrow keys, and passes on either `/play` or `/results`.

Design spec and plan: [spec](docs/superpowers/specs/2026-05-22-hueline-design.md), [plan](docs/superpowers/plans/2026-05-22-hueline.md).
