# Hueline

PWA tunnel-runner. Match the hue. Break the wall.

Live: https://nickcason.github.io/hueline/

## Status

v1 game loop. Sound, leaderboards, daily challenges deferred to v2+. See [`docs/superpowers/specs/2026-05-22-hueline-design.md`](docs/superpowers/specs/2026-05-22-hueline-design.md) for the design spec and [`docs/superpowers/plans/2026-05-22-hueline.md`](docs/superpowers/plans/2026-05-22-hueline.md) for the implementation plan.

## Develop

```bash
npm install
npm run dev
```

Open the printed URL on a mobile device on the same network for the real-feel test (tailnet works too).

## Test

```bash
npm run test:unit         # vitest watch
npm run test:unit -- --run  # vitest single run
npm run test:e2e          # playwright smoke
```

## Build

```bash
npm run build       # production bundle, regenerates icons via prebuild hook
npm run preview     # serve the built bundle
```

## Tuning

All gameplay constants live in [`src/game/tuning.ts`](src/game/tuning.ts). Tweak there, restart dev, playtest.

## Deploy

Push to `main` and GitHub Actions deploys to GitHub Pages automatically. The workflow lives at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Adapter is `@sveltejs/adapter-static` with `paths.base = '/hueline'` in production.
