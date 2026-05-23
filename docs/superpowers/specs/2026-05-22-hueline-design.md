# Hueline — Design Spec

**Date:** 2026-05-22
**Working title:** Hueline (revisit via namestorm before launch)
**Status:** Approved for implementation planning

## Concept

PWA tunnel-runner in the Tempest lineage. The player is a glassy iridescent orb travelling down a three-lane neon tunnel. Barriers slide toward the player with a hue value attached. The player carries a **continuous hue dial** as a second axis of control. To break a barrier the player must:

1. occupy the barrier's lane at impact, and
2. have their dial hue inside the barrier's tolerance band at impact.

A successful break grants points; a miss ends the run. Speed and difficulty climb with elapsed run-time. Mid-run powerups bend the rules (slow-mo, gradient barriers, hue magnet). Between runs, the player banks currency that buys permanent dial upgrades and cosmetic skins.

## Goals & non-goals

### Goals (v1)

- Ship a complete, playable game-loop PWA: title → run → results → currency → upgrade → run.
- Run is portrait-locked, installable, frame-stable (60 fps target on mid-range mobile), gesture-isolated (no accidental browser zoom, scroll, or refresh).
- Touch (mobile) and arrow-key (desktop) input parity.
- All visual assets produced agentically in a single pass — no hand-modeled meshes, no bitmap art.
- Persisted across sessions: high score, currency, dial upgrades, cosmetic unlocks.

### Non-goals (v1)

- Sound effects and music — deferred to v2.
- Online leaderboards, accounts, or social features.
- Daily challenges or seasonal events.
- Landscape orientation.
- Animated or particle-heavy cosmetics beyond what shaders provide for free.

## Core mechanics

### Control axes

- **Lane (discrete):** three lanes — left / centre / right. Input: horizontal swipe (mobile), `←` / `→` (desktop). Snap transitions, no analog drift.
- **Hue dial (continuous):** 360° hue ring. Input: vertical drag (mobile), `↑` / `↓` (desktop). Upward drag and `↑` rotate the dial in the +hue direction (red → yellow → green → cyan → blue → magenta → red); downward and `↓` rotate −hue. Drag distance maps to angular rotation at a calibrated sensitivity. Below the granularity threshold (see Difficulty curve) the dial snaps to the nearest detent — the effective and rendered hue is always exactly a detent value; partial drags between detents do not register until the threshold is crossed.

### Match resolution

When a barrier reaches the player's z-plane:

```
matched = (player.lane == barrier.lane)
       && hueDistance(player.dial, barrier.targetHue) <= barrier.tolerance
```

`hueDistance` is the shortest arc on the colour wheel (handles the 0°/360° seam). `barrier.tolerance` is the half-width of the acceptance band.

For **gradient barriers** (powerup state): `matched` is true if the dial hue falls anywhere within the displayed gradient's span (still respecting lane).

### Difficulty curve

Two knobs ramp together with elapsed run-time:

- **Speed**: barriers travel faster down the tunnel. Linear ramp from `v0` to `vmax` over `T_ramp` seconds, then flat.
- **Dial granularity**: at low difficulty the dial snaps to eight detents (45° apart). After `T_smooth` seconds the detents disappear and the dial becomes fully continuous. After `T_tight` seconds the per-barrier tolerance shrinks by a fixed fraction.

Dial upgrades from the meta-game soften these thresholds (see §Progression).

### Scoring

```
breakScore = basePoints × speedMultiplier × toleranceBonus
toleranceBonus = 1 + (1 - hueDistance / barrier.tolerance) × maxBonusGain
streakBonus = min(streakLength × 0.05, 1.0)
finalScore = breakScore × (1 + streakBonus)
```

Streak resets on miss. End-of-run total = sum of all `finalScore` values. Currency earned = `floor(total / 100)`.

### Powerups (in-run drops only)

| Powerup | Effect | Duration |
|---|---|---|
| Slow-mo | global time scale × 0.4 | 4 s |
| Gradient barrier | next 3 barriers display a hue gradient; any hue in the gradient counts as a match | until 3 barriers consumed |
| Hue magnet | dial auto-snaps within ±10° of incoming barrier hue | 3 s |

Drop rate: each barrier independently has a 5% chance to spawn an adjacent powerup pickup (Bernoulli, mean ≈ 1 per 20). Multiple powerups can stack; effects compose (slow-mo time scale multiplies magnet snap velocity, gradient barriers still respect slow-mo, etc.).

## Architecture

ECS-lite with strict render/state separation. The game state is plain TypeScript; the renderer is a one-way reflection of state. No game logic in the renderer; no three.js types in the game module.

```
src/
  game/                      pure TS, fully unit-testable
    state.ts                 GameState type, initial state factory
    components/
      player-hue.ts          { angle: number, sensitivity: number }
      lane.ts                { index: 0 | 1 | 2 }
      barrier.ts             { z: number, lane, targetHue, tolerance, gradient? }
      powerup.ts             { kind, z, lane }
      run.ts                 { elapsed, speed, score, streak, status }
    systems/
      input.ts               input event → intent → state delta
      spawn.ts               barrier + powerup generation by difficulty
      motion.ts              z-axis advancement, time-scale aware
      collision.ts           barrier-player resolution
      scoring.ts             break/miss handling, streak math
      powerup.ts             effect activation and decay
      difficulty.ts          ramp logic: speed, granularity, tolerance
    loop.ts                  tick(state, dt, input) → state'

  render/                    three.js side; reflects state only
    scene.ts                 scene/camera/renderer init
    layers/
      tunnel.ts              procedural ring geometry, neon edge shader
      barriers.ts            barrier mesh pool, gradient material switch
      player.ts              glassy orb mesh, dial halo
      particles.ts           break/miss bursts via GPU points
    materials/
      glass-iridescent.ts    shared by orb and solid barriers
      neon-edge.ts           bloom-friendly emissive tunnel lines
      barrier-gradient.ts    gradient variant for gradient-powerup barriers
      particle-burst.ts      collision-feedback point sprites
    sync.ts                  reads state, updates Object3D transforms/uniforms

  ui/                        SvelteKit
    routes/
      +layout.svelte         PWA shell, orientation lock, install prompt
      +page.svelte           title / continue
      play/+page.svelte      mounts the game canvas
      results/+page.svelte   post-run summary + currency claim
      shop/+page.svelte      dial upgrades + cosmetics
    components/
      Hud.svelte             score, dial indicator, powerup chips
      DialIndicator.svelte   live hue readout (canvas overlay)
      ResultsCard.svelte
      UpgradeRow.svelte
      CosmeticTile.svelte

  storage/
    progress.ts              localStorage schema + versioned migrations
    schema.ts                Zod schemas for persisted shape

  pwa/
    manifest.json            agentic-generated icons (SVG → rasterised at build)
    sw.ts                    via @vite-pwa/sveltekit
    install-prompt.ts        beforeinstallprompt handling

  app.html                   viewport meta, theme-color, touch-action root
```

### Per-frame data flow

```
rAF tick
  → readInput()  (queues intents since last frame)
  → loop.tick(state, dt, intents)  (pure: state, dt, intents → state')
      systems run in order: input → difficulty → spawn → motion → powerup → collision → scoring
  → renderer.sync(state)  (diff/update Object3D + uniforms)
  → renderer.draw()
```

The renderer never mutates state. Sync is idempotent — calling it twice on the same state is a no-op.

## Asset pipeline (agentic single-pass)

All visuals are code. The agent pass produces exactly:

- **Geometry builders** (`src/render/geometry/*.ts`) — functions that return three.js `BufferGeometry` instances: `makeTunnelSegment(rings, lanes)`, `makeBarrier(lane, gradient?)`, `makeOrb(detail)`.
- **Shaders** (`src/render/materials/*.ts`) — GLSL fragment + vertex shader strings, wrapped in `ShaderMaterial` factories. Four shaders total: glass-iridescent (orb + barriers), neon-edge (tunnel lines), barrier-gradient (powered-up barriers), particle-burst (collision feedback).
- **Tuning constants** (`src/render/tuning.ts`) — bloom intensity, fog density, base palette, lane offsets.
- **App icon** (`static/icon.svg`) — vector. Build step rasterises to PNG sizes via sharp/`@vite-pwa/sveltekit`.

No PNGs, no GLBs, no audio in v1. The constraint is enforced by `.gitignore` and a lint rule.

## PWA frame discipline

- `manifest.json`: `display: standalone`, `orientation: portrait`, `theme_color`, maskable + monochrome icons, `start_url: /`.
- Viewport: `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`.
- Body: `overscroll-behavior: contain; touch-action: none; -webkit-user-select: none`.
- Canvas element: `touch-action: none`, `pointer-events: auto`, captures all gestures.
- `screen.orientation.lock('portrait')` invoked on first user input (lock requires user gesture; ignored on platforms that don't support it).
- Service worker (Vite PWA plugin, generateSW strategy) precaches the app shell, runtime-caches static assets, supports offline play.
- Install prompt: capture `beforeinstallprompt`, show in title route after first successful run.

## Storage

`localStorage` only in v1. Schema versioned with a `version` field; migrations live in `storage/progress.ts`. Zod schemas validate on read; on parse failure, reset to default state and log a console warning (deliberate, non-destructive: no run data exists yet).

```ts
type Progress = {
  version: 1;
  highScore: number;
  currency: number;
  upgrades: {
    toleranceBonus: number;       // 0..N, each level adds +2° base tolerance
    rotationCostReduction: number; // 0..N, each level eases dial sensitivity
    notchedDifficultyDelay: number; // 0..N, each level delays granularity threshold
  };
  cosmetics: {
    unlocked: string[];
    equipped: { orb: string; tunnel: string };
  };
};
```

## Error handling

Three failure surfaces:

1. **WebGL context lost** — listen for `webglcontextlost`, pause the game loop, show a "reconnecting" overlay, attempt restore on `webglcontextrestored`. If unrecoverable, route to `/` with a toast.
2. **Persistence corruption** — Zod parse failure resets to default state; existing currency/upgrades are lost but the app never refuses to boot.
3. **Frame budget breach** — if `dt` exceeds 100 ms (tab backgrounded, GC pause), clamp `dt` to one frame's worth so motion/spawn don't teleport.

No try/catch around the tick function — bugs should crash visibly in dev, not be swallowed.

## Testing strategy

### Unit (Vitest)

Every system is a pure `(state, dt, intent?) → state'` function. Tested directly with no canvas:

- `collision`: lane and tolerance combinations; gradient match; magnet snap; seam-of-the-hue-wheel case.
- `scoring`: tolerance bonus boundaries, streak compounding, currency conversion.
- `difficulty`: speed at t=0, t=T_ramp, t=T_ramp+1; granularity thresholds with upgrade modifiers; tolerance shrink stage.
- `powerup`: activation, stacking, decay; correct re-entry behaviour if same powerup re-drops while active.
- `storage`: schema migration paths, corrupt-data fallback.

Coverage target: 100% of `src/game/systems/*` and `src/storage/*`.

### Integration (Playwright, 1 spec)

App boots → canvas paints a non-blank frame → synthetic keyboard input registers as score after a barrier passes. Verifies the Svelte ↔ three.js seam.

### Visual

No automated visual regression in v1. Manual playtest is the verifier; the shader source is committed and reviewable.

## v1 scope (definition of done)

- [ ] Title route with "play", "shop", install prompt
- [ ] Run loop: spawn → traverse → collide → score → game-over
- [ ] Dial control on touch + keyboard, both axes
- [ ] Three lanes, three powerups (slow-mo, gradient, magnet)
- [ ] Difficulty ramp (speed + granularity + tolerance)
- [ ] Results screen with currency claim
- [ ] Shop with three dial upgrades + two cosmetic options
- [ ] Persisted progress with migration framework
- [ ] PWA installable on iOS Safari and Chromium
- [ ] Portrait-locked, no accidental zoom, gesture-isolated
- [ ] 60 fps target on iPhone 12-era hardware
- [ ] Vitest suite green; Playwright smoke green

## Deferred

Sound, leaderboards, daily challenges, more powerups, more cosmetics, landscape mode, account sync, hand-tuned art.

## Open questions / playtest-driven

The following constants ship with starter values and are exposed in `src/game/tuning.ts` for rapid iteration. None are final.

| Constant | Starter value | What it controls |
|---|---|---|
| `v0` | 8 units/s | Barrier travel speed at run start |
| `vmax` | 22 units/s | Barrier travel speed after ramp |
| `T_ramp` | 60 s | Time to reach `vmax` |
| `T_smooth` | 20 s | When dial detents disappear |
| `T_tight` | 45 s | When barrier tolerance shrinks |
| `toleranceEasy` | 25° | Half-width of acceptance band at low difficulty |
| `toleranceHard` | 8° | Half-width after `T_tight` |
| `basePoints` | 100 | Points per break before multipliers |
| `maxBonusGain` | 0.5 | Maximum tolerance-bonus multiplier (perfect match) |
| `powerupDropP` | 0.05 | Per-barrier independent drop probability |

Other open items:

- Lane count locked to 3 for v1; revisit only if playtest demands more dexterity surface.
- Final name — "Hueline" is a working title; namestorm before public release.
- Cosmetic starter set (two unlocks): proposing one alternate orb tint palette and one alternate tunnel edge colour; confirm during implementation.
