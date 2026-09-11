# Home Workout PWA

A calm, multilingual home-workout companion for phones, tablets, and desktop browsers. The app is static, account-free, tracking-free, and designed to keep working offline after the first load.

The local exercise illustrations show both body position and movement direction. The three most easily confused floor movements—Glute Bridge, Dead Bug, and Lying Leg Raises—are documented in [Exercise sources](docs/exercise-sources.md).

Source available under the PolyForm Perimeter License 1.0.0.

## Purpose

Home Workout makes a structured routine easy to follow without an account or server-stored profile. Workout plans are versioned data, translations are generic BCP-47 language records, and plans and sessions stay in the browser. Only an explicit optional pre-translation action sends the selected text to Cloudflare.

## Features

- Phase-aware workout, duration, transition, and rest timers that tolerate browser backgrounding
- Pause/resume across every logical clock and reload-safe active sessions
- A 16-language interface plus one- or two-language exercise presentation; German and English exercise copy is bundled
- Six permanent bundled routines for general fitness, beginners, strength, cardio, active circuits, and advanced bodyweight training
- A keyboard-accessible routine picker with a right-aligned estimate on every plan row; bundled routines cannot be overwritten, while local plans are stored separately
- Optional, locally synthesized timer-end signals controlled by a compact button beside Start workout and an in-workout mute
- Visual phase editor for warm-up, training blocks, active recovery, and cool-down, with per-phase rounds and rest rules
- Validated AI-plan launch links plus a public machine-readable guide for ChatGPT and other assistants
- 58 extensible exercises with movement-specific original local SVG illustrations, including dedicated warm-up and stretching categories
- `Phase X / Y`, per-round `Exercise X / Y` progress, transition cards, and a visible easier-alternative chooser during workouts
- A clear, confirmed workout-abort action; the Home Workout brand uses the same safe return-to-home flow
- Stable workout controls and automatic timers without a manual repetition tap counter
- Responsive layouts, keyboard focus, live workout announcements, 44 px controls, a calm light-only theme, and reduced-motion support
- Installable PWA with an offline app shell, library, images, and local plans

## Screenshots

![Home screen](docs/screenshots/home.png)

## Installation and development

To install the published site as an app:

- Android Chrome: open the site, choose the browser menu, then **Add to home screen → Install**.
- iPhone/iPad Safari: choose **Share → Add to Home Screen**.
- Desktop Edge or Chrome: use the install icon in the address bar or **Apps → Install this site as an app** in the browser menu.

For local development, Node.js 22 and npm are required.

```bash
npm ci
npx playwright install
npm run dev
```

The app uses Vite, strict Vanilla TypeScript, semantic HTML, and CSS. There are no runtime framework dependencies or external runtime CDNs.

## Tests and coverage

Tests were authored in an independent test context before production code.

```bash
npm run check:licenses
npm run lint
npm run typecheck
npm test
npm run coverage
npm run mutation
npm run e2e
npm run build
```

By default the E2E runner owns a dedicated local preview. To avoid starting any local server and verify an already deployed release instead, set `E2E_BASE_URL=https://your-deployment.example` before `npm run e2e`.

Vitest owns business logic and large input sets. Playwright uses representative phone, desktop, and tablet profiles; Windows defaults to Chromium for all three, while native WebKit and Firefox are opt-in with `PLAYWRIGHT_NATIVE_ENGINES=1`. The current native WebKit run passes, while native Firefox is blocked by a host-level `spawn UNKNOWN` launch failure. CI requires at least 95% for lines, statements, functions, and branches. Exact current results are in [`docs/ci-quality.md`](docs/ci-quality.md).

## Mutation testing

```bash
npm run mutation
```

StrykerJS mutates the engine, timer, validator, persistence, and plan transformations. The configured break threshold is 70%, with 90% classified as high.

The latest local result and survivor review are documented in [`docs/mutation-testing.md`](docs/mutation-testing.md).

## Build

```bash
npm run build
npm run preview
```

The output is a static PWA in `dist/`, ready for the existing Cloudflare Pages project.

## Cloudflare deployment

Production is hosted in the Cloudflare Pages project `home-workout` in the owner's Cloudflare account. The default Pages URL is `https://home-workout-65g.pages.dev`. Changing that generated hostname requires either a custom Cloudflare domain or a new globally available Pages project name; the pending owner choice is tracked in [`BACKLOG.md`](BACKLOG.md).

```bash
npm run build
npm run deploy:cloudflare
```

Wrangler uses the locally authenticated Cloudflare account. Do not commit OAuth credentials, `.wrangler/`, deployment output, or generated archives.

## Plan schema

New and exported plans use strict `schemaVersion: 2`; the machine-readable schema is at [`public/schema/workout-plan-v2.schema.json`](public/schema/workout-plan-v2.schema.json). The v1 reader and [v1 schema](public/schema/workout-plan-v1.schema.json) remain available. Stored plans, files, and launch links using v1 are validated and migrated in memory to one equivalent training phase; loading alone never rewrites the stored source. Runtime validation rejects unexpected properties, invalid language references, unsafe markup, impossible targets, and unsupported versions.

## Languages

The interface ships in 16 directly translated locales: German, English, Dutch, Spanish, French, Russian, Simplified Chinese, Korean, Japanese, Arabic, Portuguese, Italian, Polish, Turkish, Ukrainian, and Hindi. Arabic uses a right-to-left layout. The interface language is stored locally and remains independent from workout content languages.

Plans may use any supported BCP-47-style code and a free-form display label. After adding a language, Plan Studio exposes editable plan names plus exercise names and instructions for that language. German is not a required base language. One or two configured languages can be displayed in caller-defined order.

Plan Studio also offers optional Cloudflare Workers AI pre-translation. It runs only after clicking Translate, with an adjacent notice explaining the transfer to Cloudflare, replaces only the selected target language, and marks the result as machine translated with its source, provider, timestamp, and review state. A generated translation cannot be saved, exported, or started until the user confirms review. Manual editing and all existing offline plan functionality remain available without the online service.

Only `/api/*` invokes a Pages Function; `public/_routes.json` keeps the rest of the site on unlimited static Pages delivery. The production AI binding is declared as `AI` in `wrangler.jsonc`. Translation requests are same-origin, size limited, best-effort rate limited, never cached, and are not stored by this application.

## Exercise library

The library contains 58 stable records across legs, push, pull, core, cardio, full body, warm-up, and stretching. It includes Shadowboxing, Sumo Squat Hold, Scapular Push-up, Active Recovery, six additional dynamic warm-ups, upper-body mobility, and yoga-derived stretches. Every record contains equipment, difficulty, type, target, movement-specific DE/EN copy, variant IDs, and a local SVG. Most two-position movements use same-scale overlays; multi-step sequences such as Burpee use separated numbered poses. Static holds and stretches use one figure without a misleading direction arrow. Plan Studio groups the picker by bilingual category and sorts each group alphabetically. Run `node scripts/generate-exercise-assets.mjs` to regenerate illustrations. Every exercise has a reliable source plus completed text and pose sign-off in [`docs/exercise-audit.md`](docs/exercise-audit.md).

## Optional timer audio

Timer-end signals are off by default. Start workout takes the available width in a shared action row, with a compact sound button immediately to its right. Its accessible name identifies the control, while its icon and `aria-pressed` expose the state; during a workout, an equivalent control sits immediately left of End workout. The app uses a fixed moderate signal level, while the device or operating system controls listening volume. No audio file or speech service is requested. Browser autoplay rules still apply, so the app unlocks audio only from an explicit interaction and treats unavailable or suspended audio as a silent no-op.

Spoken exercise names are not included. Browser voices may be device-dependent or remote, so the app cannot guarantee offline availability, language coverage, privacy, or non-interference with screen readers. The evidence and reconsideration criteria are in [`docs/audio-decision.md`](docs/audio-decision.md).

The implemented multi-phase plan format—warm-up, independently timed training blocks, optional active recovery, and cool-down—is documented in [`docs/phased-workout-proposal.md`](docs/phased-workout-proposal.md). Sequence repeats are called **rounds / Runden**, while **repetitions / Wiederholungen** remain the count for a single movement.

The implemented plan catalogue and architecture are documented in [`docs/project-documentation.md`](docs/project-documentation.md). All open work is durably tracked in [`BACKLOG.md`](BACKLOG.md), with fuller product context in [`docs/product-roadmap.md`](docs/product-roadmap.md).

## Dependency licensing

```bash
npm run check:licenses
```

Allowed production licenses are MIT, BSD-2-Clause, BSD-3-Clause, ISC, Apache-2.0, CC0-1.0, BlueOak-1.0.0, and Python-2.0. The app currently has no production package dependencies.

## License

This project is source available under the [PolyForm Perimeter License 1.0.0](LICENSE). It is not described as open source. Copyright © 2026 Dr. Dustin Hebecker; see [COPYRIGHT_NOTICE.md](COPYRIGHT_NOTICE.md).

## Contribution policy

Issues and feature requests are welcome. Until a CLA exists, external code contributions are not intended for integration. External code contributions must not be merged without an appropriate CLA or explicit copyright/relicensing grant. See [CONTRIBUTING.md](CONTRIBUTING.md).
