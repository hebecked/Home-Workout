# CI quality diagnostics

## Workout languages, concrete instructions, and PWA lifecycle — 2026-09-12

The language, exercise-copy, installation, update, and screen-reader follow-up passed the complete local release matrix:

- Production dependency licensing, ESLint, strict TypeScript, and the Vite production build passed; the build transformed 42 modules.
- Vitest passed 22 files and 212 tests.
- V8 coverage passed every configured 95% threshold with 97.06% statements (595/613), 95.60% branches (565/591), 99.01% functions (101/102), and 99.07% lines (427/431).
- The complete Windows fallback phone, desktop, and tablet profile matrix passed 84 tests with 48 intentional project-specific skips. The run used an operating-system-assigned free port. These named profiles use Chromium on this workstation and are not reported as native Firefox or WebKit coverage.
- Language tests cover exact and base BCP 47 matching, interface-first rendering, automatic/off/explicit second-language behavior, invalid stored preferences, reload persistence, unchanged schema-v1/v2 plan data, per-block `lang` metadata, localized status announcements, and focus restoration inside the compact language menu.
- Catalogue and browser regressions verify that bundled German and English exercise instructions come from the audited movement-specific library rather than the former generic safety template.
- PWA tests cover conditional install-prompt exposure, one-time prompt consumption, rejected prompts, installed state, waiting-worker detection, explicit `SKIP_WAITING`, and reload only after `controllerchange`. Unsupported or rejected paths remain silent and non-blocking.
- Screen-reader smoke tests cover the two language selects and their retained selection/focus in addition to plan, audio, tooltip, workout-state, phase, round, and pause announcements.
- Stryker passed its 70% break threshold with a 74.79% total score and 76.69% covered score: 1,092 killed, 332 survived, 36 without coverage, and no timeouts or errors across 1,460 mutants. The four-worker run completed in 2 minutes 45 seconds.
- The 1440×1600 README screenshot was regenerated from the final production build on an operating-system-assigned free port.
- Release commit `7f1b6e3` was pushed to `main` and deployed to the existing Cloudflare Pages project. The immutable deployment is `https://889122e8.home-workout-65g.pages.dev`; the canonical `https://home-workout-65g.pages.dev` URL passed 18 targeted Chromium phone smoke tests with 3 intentional device-specific skips.

## Countdown audio and screen wake lock — 2026-09-11

The louder 3-2-1-0 cue pattern and best-effort Screen Wake Lock passed the following local checks:

- ESLint, strict TypeScript, and the Vite production build passed; the build transformed 39 modules.
- Vitest passed 20 files and 202 tests.
- V8 coverage passed every configured 95% threshold with 99.26% statements, 95.67% branches, 98.52% functions, and 99.26% lines.
- The complete Windows fallback phone, desktop, and tablet profile matrix passed 77 tests with 46 intentional project-specific skips. This matrix uses Chromium for the three responsive profiles and is not reported as native Firefox/WebKit coverage.
- A deterministic browser audio double confirms exactly three short 880Hz cues at 3, 2, and 1 seconds, a longer 1046.5Hz completion cue at 0, and the raised output gains. A Screen Wake Lock double confirms acquisition on workout start, release on pause, reacquisition on resume, and release on confirmed exit.
- Unit tests cover unsupported, rejected, automatically released, visibility-restored, and late-resolving wake-lock requests without making workout progress depend on the API.
- The configured Stryker targets do not include the changed audio or UI modules. The 2026-09-10 result remains applicable to the unchanged mutation scope.

## Phase-grouped exercise overview — 2026-09-11

The phase grouping and instruction-popover follow-up passed the following local checks:

- ESLint, strict TypeScript, and the Vite production build passed; the build transformed 38 modules.
- Vitest passed 19 files and 199 tests.
- V8 coverage passed every configured 95% threshold with 99.26% statements, 95.62% branches, 98.52% functions, and 99.26% lines.
- The complete phone, desktop, and tablet profile matrix passed 75 tests with 42 intentional project-specific skips.
- Browser assertions cover localized phase grouping, 17 preview cards, pointer hover, keyboard focus, touch/click, Escape with retained focus, `aria-expanded`, `aria-controls`, `aria-describedby`, tooltip roles, content-language metadata, right-to-left layout, horizontal overflow, and 44px tablet touch targets. A separate custom-plan regression covers long instructions and the same custom exercise in warm-up and training sections at a 390px viewport.
- The README screenshot was regenerated at 1440×1600 from a production preview on a dynamically allocated free port so the new phase sections are visible.
- The configured mutation targets remain unchanged core plan/timer files. This UI-only change does not enter the Stryker scope, so the 2026-09-10 mutation result remains applicable.

## Audio UI follow-up — 2026-09-11

The compact-button audio follow-up passed the following local checks:

- ESLint and strict TypeScript: passed.
- Vitest: 19 files and 199 tests passed.
- V8 coverage: 99.26% statements, 95.61% branches, 98.52% functions, and 99.26% lines; every configured 95% threshold passed.
- Vite production build: 38 modules transformed successfully.
- Relevant phone, desktop, and tablet profile tests: 33 passed and 12 intentionally project-specific skips.
- Dedicated regressions confirm that Start workout and the compact audio button share one row, the primary action takes most of the available width, and the audio button remains physically right of Start workout in the Arabic right-to-left layout.
- Screen-reader smoke coverage confirms a labeled `aria-pressed` button with no checkbox or slider and retains the in-workout toggle behavior.
- The configured mutation targets are unchanged core plan/timer files; the 2026-09-10 mutation result therefore remains applicable to that scope. Audio and UI files are not included in the current Stryker configuration.

## Release verification — 2026-09-10

The final local release checks completed with Node.js on Windows:

- ESLint and strict TypeScript: passed.
- Vitest: 19 files and 201 tests passed.
- V8 coverage: 99.26% statements, 95.67% branches, 98.52% functions, and 99.26% lines; every configured 95% threshold passed.
- Stryker: 1,460 mutants, 74.79% total mutation score, 76.69% covered score, 1,092 killed, 332 survived, 36 without coverage, and no timeouts or errors. The four-worker run completed in 4 minutes 3 seconds.
- Vite production build: 38 modules transformed successfully.
- Windows fallback browser matrix: 74 passed and 40 intentionally project-specific skips across the phone, desktop, and tablet profiles. This run uses Chromium for all three profiles and is not reported as native Firefox/WebKit coverage.
- Native Windows WebKit: 20 passed and 18 intentionally project-specific skips, including the isolated-origin offline case. This Playwright WebKit build exposes no `AudioContext`, so the optional control is disabled and its non-interference path passes.
- Native Windows Firefox: blocked before app load by `browserType.launch: spawn UNKNOWN`; CI on Ubuntu remains the native Firefox verification environment.

Browser coverage includes routine-option time alignment, responsive layouts, keyboard operation and focus, translated labels, audio opt-in/mute behavior, touch targets, offline reload, and accessibility-tree/live-region smoke tests.

The public [CI run 34527897023](https://github.com/hebecked/Home-Workout/actions/runs/34527897023) completed successfully for release commit `3a4f502`. After Cloudflare Pages deployment, the canonical `https://home-workout-65g.pages.dev` URL also passed the Chromium phone suite with seven tests and one intentional tablet-only skip. The immutable deployment preview is `https://55bd8242.home-workout-65g.pages.dev`.

## Historical diagnostic context

The latest failed historical quality run located on 2026-09-07 was [33551809454](https://github.com/hebecked/Home-Workout/actions/runs/33551809454), commit `31d3d80`. Its public job metadata identifies `npm run coverage` as the failed step; mutation succeeded. Raw log download requires authentication and was not available in the local unauthenticated GitHub CLI.

The subsequent commit `98ea0d5` adds translation validation boundary tests; its run and the five most recent runs were successful. This is consistent with a coverage failure already repaired in the repository, rather than a currently broken build. The exact historical threshold message is not established by job metadata alone. Do not lower the 95% coverage thresholds or treat mutation success as a replacement for the quality job.

The workflow now uploads coverage and browser reports even after failure (`quality-diagnostics`, seven-day retention). `production-dist` remains available only after preceding quality steps succeed.

Reproduce with Node 22 and a clean `npm ci`, then `npm run check:licenses`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run coverage`, `npx playwright install --with-deps`, `npm run build`, and `npm run e2e`. Use a free `E2E_PORT` locally; never reuse another preview server accidentally.

On this Windows workstation, native Firefox fails before loading the app with `browserType.launch: spawn UNKNOWN`. Default Windows fallback projects use Chromium even when their names say Firefox or WebKit. Set `PLAYWRIGHT_NATIVE_ENGINES=1` to test the named engines; do not report fallback runs as native browser coverage. CI on Ubuntu uses the native engines.

The 2026-09-08 CI attachment shows native Firefox layout overflow and WebKit's internal navigation error after `context.setOffline(true)`. The workout shell now uses the actual header height via CSS Grid instead of subtracting an assumed fixed height.

Offline verification now starts an isolated origin on an OS-assigned free port, waits for service-worker control and cached assets, shuts down that origin, then reloads. This tests actual origin unavailability, without browser-specific offline emulation. The native Windows WebKit test now passes, with no skip or swallowed error. Chromium and Firefox run the same test in CI. Safari on a physical device remains a separate verification step.
