# Project documentation

Last updated: 2026-09-01

## Product overview

Home Workout is a framework-free TypeScript PWA for following multilingual workout routines on phones, tablets, and desktops. It requires no account and sends no workout or plan data to an application backend. After the first successful load, the app shell, bundled plans, exercise copy, and illustrations are available offline.

The default experience is deliberately simple:

1. Select a permanent bundled routine or a local plan.
2. Review its exercises and illustrations.
3. Start the workout.
4. Follow `Exercise X / Y` within the current round, optionally select a stored easier movement, and use Previous, Pause/Resume, Next, or the confirmed Abort action.
5. Duration exercises and rests count down automatically; total workout time continues independently.

The manual repetition counter is disabled because it caused unwanted scroll repositioning and offered limited value. Repetition target ranges are still shown. The session model retains its versioned repetition field for backward-compatible restoration of already stored sessions, but the current interface does not expose increment/decrement controls.

## Plan ownership model

Bundled and local plans are intentionally separate:

- `src/data/default-workout.ts` contains six permanent `WorkoutPlan` records.
- Bundled plans are indexed by `BUILT_IN_WORKOUTS_BY_ID` and never written to local storage.
- `home-workout:plans` contains only user-created, imported, or customized copies.
- Starting a bundled routine does not save or mutate it.
- “Customize” assigns a fresh plan ID before opening the editor.
- “Edit” preserves the ID of a local plan so saving updates that plan only.
- Active workout state uses the separate `home-workout:active-session` key.

If a session references a bundled plan, it is restored from source-controlled bundled data. If it references a local plan, it is restored from browser storage. Invalid or outdated stored data is rejected safely.

## Bundled routines

| ID | Purpose | Rounds | Exercises |
| --- | --- | ---: | ---: |
| `30-minute-full-body` | Balanced full body | 3 | 8 |
| `gentle-start` | Beginner / low impact | 2 | 6 |
| `full-body-strength` | Strength development | 3 | 8 |
| `cardio-base` | Aerobic base | 3 | 6 |
| `active-circuit` | Mixed active circuit | 3 | 6 |
| `advanced-bodyweight` | Advanced bodyweight | 4 | 8 |

The presets are general templates, not medical advice or guaranteed outcome programs. Their research basis is recorded in `docs/product-roadmap.md`.

## Creating, editing, importing, and exporting

Plan Studio supports:

- DE/EN plan names and additional BCP-47-style language records;
- one or two display languages;
- rounds and rest intervals;
- selecting from the 33-entry exercise library;
- custom exercise names;
- exercise ordering and removal;
- repetition range, per-side, and duration target editing;
- local save, start, and JSON export.

The plan library adds explicit duplicate and confirmed-delete actions for local plans. These actions are never shown for bundled routines.

Imported JSON and AI links go through the same strict version-1 validator before preview, save, or start. Unknown properties, unsafe text, invalid languages, impossible targets, unsupported schema versions, and oversized/invalid URL payloads are rejected.

## AI-generated plans

The instruction page exposes the deployed-origin URL `/ai-workout-guide.txt`. A user can give this URL and a natural-language workout request to an AI assistant. The guide asks the assistant to return either:

- a direct `?plan=BASE64URL_UTF8_JSON#import` link, or
- a versioned JSON configuration file for manual upload.

Direct links never start a workout immediately. The app validates the payload, removes it from the visible address bar, and opens a preview that requires an explicit Start action.

## Exercise illustrations

`src/data/exercises.ts` defines 33 exercises. Every entry points to a local SVG in `public/assets/exercises/`. The visual color system is category based:

- legs: blue;
- push/pull/arms: orange;
- core: purple;
- cardio/full body: red.

All 33 assets have distinct start/finish poses and are covered by file, palette, and SVG contract tests. Movement and floor-contact sources are recorded in `docs/exercise-sources.md`.

## Code map

- `src/ui/app.ts`: hash routing, rendering, event binding, editor, plan library, imports, instructions, and workout UI.
- `src/data/default-workout.ts`: permanent bundled routine catalogue.
- `src/data/exercises.ts`: exercise metadata, translations, targets, variants, and illustration paths.
- `src/core/plan-schema.ts`: strict runtime validator and plan types.
- `src/core/plan-io.ts`: JSON and base64url import/export.
- `src/core/persistence.ts`: local plan and active-session persistence.
- `src/core/workout-engine.ts`: deterministic workout state transitions.
- `src/core/timer.ts`: pause-aware timestamp timer calculations.
- `public/service-worker.js`: offline app shell caching.
- Cloudflare Pages serves the generated static files from `dist/`; hash routing keeps direct application routes on the root document.

## Development and verification

Use Node.js 22 and npm:

```bash
npm ci
npm run lint
npm test
npm run coverage
npm run e2e
npm run build
```

Vitest covers validation, transformations, persistence, timers, the workout engine, the bundled catalogue, and illustration contracts. Playwright covers representative phone, desktop, and tablet journeys, including plan creation/editing, immutable bundled plans, import/AI links, workout controls, fixed action placement, abort/home behavior, reload restoration, and touch targets.

The build produces a static client in `dist/`. `npm run deploy:cloudflare` publishes that directory to the existing Cloudflare Pages project `home-workout`. Deployment credentials and generated output must never be committed.

## Privacy, safety, and release constraints

- No analytics, account system, or workout backend is present.
- Plans and sessions stay in the current browser unless the user exports them.
- Exercise guidance is general; users should stop if they feel pain and seek qualified advice when appropriate.
- The source is PolyForm Perimeter 1.0.0 and must not be described as open source.
- The 2026 copyright holder is explicitly recorded as Dr. Dustin Hebecker in `COPYRIGHT_NOTICE.md`.
- The reliable-source review is tracked per exercise in `docs/exercise-audit.md`; source assignment alone does not close the separate text and pose checks.

See the root `BACKLOG.md` for the authoritative checklist of outstanding work and `docs/product-roadmap.md` for the fuller product context.
