# Lighthouse

A tiny text adventure with four rooms, illustrated scenes, a location map, and gentle room transitions. Start on the Rocks and use the arrow keys or direction buttons to explore.

The Lamp Room door is always unlocked; visiting the Keeper's Kitchen is optional.

The app uses Next.js, TypeScript, and plain CSS, preserving the original prototype's design and game rules. The original standalone prototype remains in `outputs/` as the visual reference.

## Local development

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Use Node.js 22 or later. Room data is in `src/lib/rooms.ts`, movement is in `src/lib/game.ts`, and the interface is in `src/components/lighthouse-game.tsx`. The original styles are in `src/app/globals.css`. Illustrations and their generation prompts are in `public/images/`.

## Checks and Cloudflare preview

```sh
npm run lint
npm test
npm run typecheck
npm run build:worker
npm run preview:built
```

`build:worker` runs the Next.js production build and the OpenNext adapter. `preview:built` serves that build locally in the Workers runtime. For a single build-and-preview command, use `npm run preview`.

`npm test` compiles the plain movement functions and runs the regression tests using Node's built-in test runner, without a browser. The test configuration excludes browser types. Movement and available exits share the same `movePlayer` rules.

The game uses local images without an image-optimization service and has no server data or external cache. No R2, KV, or database provisioning is needed. `.dev.vars.example` documents the optional local environment setting; keep credentials out of tracked files.

## Deployment

The existing Worker name is **lighthouse**, in the account identified by `wrangler.jsonc`. Its URL is **https://lighthouse.ajetomobideji.workers.dev/**. Preserve the Worker name and account to keep the URL unchanged.

`.github/workflows/deploy.yml` installs locked dependencies, checks the app, builds with OpenNext, and deploys on every push to `main`. It reads the Cloudflare Workers API token from the repository Actions secret **LIGHTHOUSE**. The token needs permission to deploy Workers in the configured account. A manual workflow dispatch is also available.

`npm run deploy` builds and deploys; `npm run deploy:built` deploys an existing build. Both affect the live Worker. Review changes locally before committing and pushing to `main`.
