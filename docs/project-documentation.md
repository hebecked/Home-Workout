# Project documentation

Last updated: 2026-09-10

## Product overview

Home Workout is a framework-free TypeScript PWA for following multilingual workout routines on phones, tablets, and desktops. It requires no account; plans and workout sessions stay in browser storage. Only an explicit optional pre-translation action sends selected plan text to the same-origin Cloudflare endpoint. After the first successful load, the app shell, bundled plans, exercise copy, and illustrations are available offline.

The default experience is deliberately simple:

1. Select a permanent bundled routine or local plan from the keyboard-accessible list; each option shows its estimate in a right-aligned column.
2. Review its warm-up, training, and cool-down exercises and illustrations.
3. Start the workout.
4. Follow phase, round, and exercise progress; optionally select a stored easier movement; and use Previous, Pause/Resume, Next, or the confirmed Abort action.
5. Duration exercises, transitions, and rests count down automatically; total workout time continues independently.
6. If explicitly enabled, hear a short local tone at automatic timer transitions; mute it at any time without changing workout state.

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
- Opt-in timer-audio settings use `home-workout:timer-audio`; audio settings never enter a workout plan or session schema.

If a session references a bundled plan, it is restored from source-controlled bundled data. If it references a local plan, it is restored from browser storage. Invalid or outdated stored data is rejected safely.

## Bundled routines

| ID | Purpose | Training rounds | Warm-up / training / cool-down slots |
| --- | --- | ---: | ---: |
| `30-minute-full-body` | Balanced full body | 3 | 4 / 8 / 5 |
| `gentle-start` | Beginner / low impact | 2 | 4 / 6 / 4 |
| `full-body-strength` | Strength development | 3 | 4 / 8 / 4 |
| `cardio-base` | Aerobic base | 3 | 4 / 6 / 4 |
| `active-circuit` | Mixed active circuit | 3 | 4 / 6 / 4 |
| `advanced-bodyweight` | Advanced bodyweight | 4 | 4 / 8 / 5 |

The presets are general templates, not medical advice or guaranteed outcome programs. Their research basis is recorded in `docs/product-roadmap.md`.

## Creating, editing, importing, and exporting

Plan Studio supports:

- arbitrary BCP-47-style plan-language records and one or two workout display languages;
- ordered warm-up, training, optional active-recovery, and cool-down phases with their own rounds and rest intervals;
- selecting from the 58-entry exercise library through bilingual category groups sorted alphabetically;
- custom exercise names;
- exercise ordering and removal;
- repetition range, per-side, and duration target editing;
- local save, start, and JSON export.
- optional consent-based Cloudflare pre-translation with explicit source/target selection and mandatory review before save, export, or start.

The plan library adds explicit duplicate and confirmed-delete actions for local plans. These actions are never shown for bundled routines.

Imported JSON and AI links go through strict versioned validation before preview, save, or start. Schema v2 is canonical. Valid v1 input is migrated in memory to one equivalent training phase without mutating or automatically overwriting its source. Unknown properties, unsafe text, invalid languages, impossible targets, unsupported schema versions, and oversized or invalid URL payloads are rejected.

Schema version 1 remains backward compatible: `translationMetadata` is optional, and old plans without it remain valid. Reading stored v1 JSON does not rewrite that stored source; import, export, or a later save uses the canonical migrated v2 shape. When present, translation metadata records the source language, machine origin, provider, UTC timestamp, and `needs-review` or `reviewed` status for a translated target language.

## Optional automatic translation

The editor sends only the selected plan name and exercise names/instructions to the same-origin `/api/translate` endpoint after explicit consent. The Pages Function validates the request, enforces per-item and total-size limits, applies a best-effort per-client rate limit, and calls Cloudflare Workers AI model `@cf/meta/m2m100-1.2b` through the `AI` binding. It returns no-cache JSON and does not persist request or response text.

Translations are drafts, not trusted fitness guidance. The editor displays the source, provider, and review status and blocks save/start/export while a machine translation remains `needs-review`. A failure leaves the existing draft untouched. Manual multilingual editing continues to work offline.

`public/_routes.json` limits Function invocation to `/api/*`, so navigation and static assets do not consume the Workers request allowance. `wrangler.jsonc` is the production source of truth for the Pages output directory and AI binding.

## AI-generated plans

The instruction page exposes the deployed-origin URL `/ai-workout-guide.txt`. A user can give this URL and a natural-language workout request to an AI assistant. The guide asks the assistant to return either:

- a direct `?plan=BASE64URL_UTF8_JSON#import` link, or
- a versioned JSON configuration file for manual upload.

Direct links never start a workout immediately. The app validates the payload, removes it from the visible address bar, and opens a preview that requires an explicit Start action.

## Exercise illustrations

`src/data/exercises.ts` defines 58 exercises. Every entry points to a local SVG in `public/assets/exercises/`. The visual color system is category based:

- legs: blue;
- push/pull/arms: orange;
- core: purple;
- cardio/full body: red.
- warm-up: gold;
- stretching: teal.

Most two-position movement assets use same-scale overlays; multi-step sequences such as Burpee use separated numbered poses. Static holds and stretches use one pose without a false direction arrow. All 58 assets are covered by file, palette, pose-mode, and SVG contract tests. Movement and floor-contact sources are recorded in `docs/exercise-sources.md`; completed per-exercise text and pose review is recorded in `docs/exercise-audit.md`.

The implemented schema-v2 phase model is documented in `docs/phased-workout-proposal.md`. It separates warm-up, independently configured training blocks, optional active recovery, and cool-down, and uses “rounds / Runden” for repeated exercise sequences. Deterministic engine tests cover exercise, round, and phase boundaries, skipping, pausing, and reload persistence.

## Code map
- `src/core/audio.ts`: strict local audio preferences plus user-gesture-safe Web Audio tone synthesis.
- `src/ui/app.ts`: hash routing, rendering, event binding, editor, plan library, imports, instructions, and workout UI.
- `src/data/default-workout.ts`: permanent bundled routine catalogue.
- `src/data/exercises.ts`: exercise metadata, translations, targets, variants, and illustration paths.
- `src/core/translation.ts`: translation request/response validation, batching, immutable draft application, and review metadata.
- `functions/api/translate.ts`: same-origin Cloudflare Workers AI translation endpoint.
- `src/core/plan-schema.ts`: strict runtime validator and plan types.
- `src/core/plan-io.ts`: JSON and base64url import/export.
- `src/core/persistence.ts`: local plan and active-session persistence.
- `src/core/workout-engine.ts`: deterministic workout state transitions.
- `src/core/timer.ts`: pause-aware timestamp timer calculations.
- `public/service-worker.js`: offline app shell caching.
- Cloudflare Pages serves the generated static files from `dist/`; hash routing keeps direct application routes on the root document.

## Optional audio

Timer-end signals are an opt-in enhancement, not part of workout correctness. The compact checkbox is beside the plan summary, the bounded volume control stays in a collapsed disclosure, and the in-workout mute button is immediately left of End workout. The app creates or resumes its `AudioContext` only after an explicit interaction and synthesizes a sub-second oscillator tone without a media file or network request. A blocked, suspended, unsupported, or failed audio context is silent and does not alter the timestamp-based engine.

Spoken exercise names are intentionally not implemented. Browser speech voices may be local or remote and cannot provide guaranteed offline, privacy, or language coverage for the 16 interface locales and arbitrary plan languages. `docs/audio-decision.md` records the decision, sources, accessibility constraints, and criteria for reconsideration.

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

Vitest covers validation, transformations, persistence, timers, audio, the workout engine, the bundled catalogue, and illustration contracts. Playwright covers representative phone, desktop, and tablet journeys, including plan creation/editing, immutable bundled plans, import/AI links, workout controls, fixed action placement, abort/home behavior, reload restoration, touch targets, plan-list keyboard behavior, and responsive time-column alignment.

Audio unit tests cover invalid and valid preferences, bounded persistence, deferred context creation, user-gesture resume behavior, tone scheduling, mute, and failure-safe behavior. Browser tests cover opt-in defaults, accessible controls, volume persistence, and in-workout mute.

The interface catalogue has 16 locales with compile-time and runtime completeness checks. Playwright verifies locale persistence, translated accessible names, Arabic right-to-left layout, keyboard focus, and representative responsive layouts. Chromium accessibility-tree smoke tests also verify the plan/audio controls, the polite atomic workout status, state changes, and retained focus. Stryker mutation testing covers the validator, import/export, persistence, plan transformations, timer, and workout engine. Exact current results and native-engine limitations are recorded in `docs/ci-quality.md`.

The build produces a static client in `dist/`. `npm run deploy:cloudflare` publishes that directory to the existing Cloudflare Pages project `home-workout`. Deployment credentials and generated output must never be committed.

## Privacy, safety, and release constraints

- No analytics, account system, or workout backend is present.
- Plans and sessions stay in the current browser unless the user exports them.
- Exercise guidance is general; users should stop if they feel pain and seek qualified advice when appropriate.
- The source is PolyForm Perimeter 1.0.0 and must not be described as open source.
- The 2026 copyright holder is explicitly recorded as Dr. Dustin Hebecker in `COPYRIGHT_NOTICE.md`.
- The reliable-source review is tracked per exercise in `docs/exercise-audit.md`; source assignment alone does not close the separate text and pose checks.

See the root `BACKLOG.md` for the authoritative checklist of outstanding work and `docs/product-roadmap.md` for the fuller product context.
