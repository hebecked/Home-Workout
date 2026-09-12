# Home Workout backlog

Last reviewed: 2026-09-12

This file is the durable hand-off for work that must not exist only in an AI conversation. `docs/product-roadmap.md` contains the fuller product context; this file is the short operational checklist.

## Release work completed on 2026-09-10 and refined through 2026-09-12

- [x] **DOC-HW-001:** refreshed the README, project documentation, roadmap, audit/review notes, quality reports, and README screenshot; removed stale review and implementation status.
- [x] **UI-HW-001:** removed the helper text. The accessible plan list now shows each routine's estimate right-aligned beside its name, supports pointer and keyboard selection, and retains focus after selection.
- [x] **AUDIO-HW-001:** evaluated signals and speech. Implemented only an opt-in local timer tone; a compact stateful button sits immediately right of Start workout, the device controls volume, and the workout mute button sits immediately left of End workout. Speech remains rejected for this release.
- [x] **A11Y-HW-001:** added accessibility-tree smoke tests for the plan list, optional audio, workout announcements, language preferences, state changes, and focus retention.
- [x] **LANG-HW-001:** made the interface language the primary workout language when matching copy exists and added a compact, global second-language preference inside the existing language menu.
- [x] **PWA-HW-001:** added a contextual install action on supporting browsers plus an accessible update-ready message and user-controlled reload.

The remaining owner URL choice and later product ideas were re-evaluated below. They remain useful but are not release blockers and were not expanded during this release pass.

Release verification on 2026-09-12 passed 212 unit tests, every configured coverage threshold, a 74.79% mutation score against the 70% break threshold, and the complete local browser matrix with 84 passes and 48 intentional profile-specific skips. Commit 7f1b6e3 was pushed to main and deployed to the existing Cloudflare Pages project; the canonical URL then passed 18 targeted Chromium phone smoke tests with 3 intentional device-specific skips.

## External app-testing findings — historical decisions

The following findings came from a private debugging review on 2026-09-03. All four decisions below were accepted and implemented on 2026-09-07. Native Windows WebKit now passes the isolated-origin offline test; Firefox still cannot launch on this workstation. The private source report is not tracked.

### Resolutions accepted 2026-09-07

- [x] BUG-HW-004: remove the separate checkbox. The button copy now names Cloudflare, the data sent (plan name, exercise names, and instructions), the translation purpose, the replacement of target text, and the need to remove personal/confidential information and review output before saving.
- [x] BUG-HW-003: preserve `0` through editor parsing, reject it in the shared schema validation, show a clear error, and prevent persistence.
- [x] BUG-HW-001: replace the failing primary and category colours with WCAG 2 AA values. The former values and the rollback mapping are in `docs/accessibility-colors.md`.
- [x] BUG-HW-002: render the skip link as the first focusable element and retain a focusable main-content target.
- [x] Reran the current browser suite in Chromium profiles and native WebKit, including translation, keyboard, responsive, and isolated-origin offline coverage. Native Firefox still fails at process launch on this workstation before loading the app.

1. **[x] BUG-HW-004 · Automatic translation consent (high):** Consent gating, no-request behavior, continued translation after consent, and preservation of manual translations are implemented. Report evidence: TC-HW-011/TC-HW-012.
2. **[x] BUG-HW-003 · Zero rounds accepted (high):** Shared validation, clear errors, and prevention of invalid persistence are implemented while values from `1` upward remain valid. Report evidence: TC-HW-018.
3. **[x] BUG-HW-001 · Start-page color contrast (high):** WCAG 2 AA colors and the affected normal, focus, hover, disabled, and workout states are implemented. Report evidence: TC-HW-021 and axe-core output.
4. **[x] BUG-HW-002 · Skip-link focus in WebKit (medium/high):** The focus order, visible focus, main-content target, and keyboard-trap behavior are implemented and the native WebKit rerun passes. Report evidence: TC-HW-022.

The report also notes that Firefox could not start because of `spawn UNKNOWN`; this is currently a test-environment issue rather than an app finding. Firefox coverage should be considered separately after the local runner problem is resolved, and the four cases above plus the manual-translation regression case should be rerun after any chosen changes.

## Priority 0 — public release hygiene, movement safety, and correctness

- [x] **DOC-HW-001 · Documentation and README refresh (updated 2026-09-12):** Updated all public project/status documents to the implemented UI, countdown audio, screen wake lock, accessibility, plan, translation, PWA lifecycle, testing, and deployment state. The 1440×1600 README screenshot reflects the compact language control and phase-grouped exercise overview. No private release values, reviewer exports, or generated test artifacts were added.
- [x] **PRIV-HW-001 · Repository-public-content audit (2026-09-10):** Audited tracked public content and reachable Git history for private addresses, credentials, environment files, feedback/reviewer exports, generated reports, and local paths. No private values or sensitive artifacts were found. `docs/private-release-config.md` contains process guidance only; `.env.production.local`, build output, and test artifacts remain ignored.
- [x] Finalize the owner-confirmed **Burpee** as a readable four-step sequence with separated numbered poses and no ambiguous overlaid limbs.
- [x] Make **Side Plank** unambiguously forearm-supported: elbow below the shoulder and forearm visibly grounded.
- [x] Correct **Incline Push-up** so the hands are visibly on the raised support and the feet remain on the floor.
- [x] Correct **Triceps Dip** with a lower support, free space below the hips, and no ambiguous body line below the seat.
- [x] Add sourced DE/EN entries and original SVGs for **Scapular Push-up**, **Active Recovery**, shoulder/upper-back and chest stretches, plus a small yoga-derived mobility set.
- [x] **Audit every bundled exercise instruction and illustration one by one against reliable sources.** All 58 definitions now have an exercise-specific source plus separate DE/EN text and pose sign-off in `docs/exercise-audit.md`. Findings in copy and metadata were corrected, and an automated completeness test guards the checklist.
- [x] Correct **Pull-up, Assisted Pull-up, and Chin-up** with same-scale overlaid poses that show vertical travel rather than two people moving sideways.
- [x] Replace the **Side Plank** illustration with one anatomically clear static forearm-supported pose; no second figure is needed for a hold.
- [x] Redesign the **Pike Push-up** illustration with same-scale overlaid start/lowering poses, fixed hands and feet, and no implied sideways movement.
- [x] Add sourced DE/EN entries and original local SVGs for **Shadowboxing**, **Sumo Squat Hold**, four dynamic warm-ups, and four post-workout stretches.
- [x] Replace every generic exercise sentence with a concise, movement-specific DE/EN setup, action, and key form cue. The per-exercise source and pose audit is complete. On 2026-09-12 the catalogue resolver was also corrected so the interface and tooltips actually use these specific DE/EN texts instead of the generic fallback template.
- [x] Run the human illustration review workflow and remove its temporary reviewer and feedback data. The six new dynamic warm-up images and **Burpee** were owner-confirmed on 2026-09-10; no unapproved image remains in this review round.

## Priority 1 — multilingual editing and comprehension

- [x] Group the Plan Studio exercise picker by bilingual category and alphabetize exercises inside every group.
- [x] Make the AI workout-plan instructions fully English instead of mixing an English heading with German paragraphs.
- [x] Allow plan and exercise names/instructions to be entered as free text for every added language. Optional online pre-translation requires an explicit action and manual review; offline/private editing remains available without it.
- [x] Mark the workout variant selector explicitly as **easier alternatives** and explain that the original movement remains selectable.
- [x] Add optional Cloudflare Workers AI pre-translation with explicit user consent, visible source/provider/review status, request limits, and mandatory manual review before saving, exporting, or starting.
- [x] Put repetition targets and duration counters directly below the image and compact the controls without dropping below 44px touch targets. Regression checks cover phone, tablet, desktop and 844×390 landscape layouts.
- [x] **UI-HW-001 · Plan-selection layout (2026-09-10):** Removed the helper text and its translations. A labeled ARIA combobox/listbox shows each routine's estimated duration right-aligned in the same option row. Tests cover pointer and keyboard selection, focus, accessible state, phone/desktop/tablet layouts, and horizontal overflow.
- [x] **LANG-HW-001 · Workout-language resolution (2026-09-12):** The interface language is now the primary workout language whenever the exercise's plan copy or bundled catalogue provides it. The existing header language control opens a compact menu containing the interface language and one global, separately persisted second-language preference: plan default, off, or an explicit supported language.
  - Schema-v1/v2 plans and their required one- or two-language `displayLanguages` values remain valid and unchanged. They provide deterministic primary and automatic-secondary fallbacks only; changing either setting never rewrites a plan.
  - Resolution checks an exact BCP 47 code before a base-language match. An unavailable interface language falls back to the first available `displayLanguages` entry and then the first available plan language. An unavailable explicit second language is omitted rather than silently replaced.
  - Unit and browser coverage exercises base/exact matching, invalid stored values, automatic/off/explicit behavior, reload persistence, locale switching, unchanged plan storage, accessible labels/status, and `lang` attributes on every rendered exercise-name and instruction block.
- [x] **UI-HW-002 · Phase-aware exercise overview and instructions (2026-09-11):** Grouped home-screen exercise cards inside subtly outlined, localized phase sections. Each card exposes its localized instructions through a compact information button and associated tooltip-style popover. Tests cover pointer hover, keyboard focus, touch/click, Escape, retained focus, expanded state, language metadata, right-to-left and long copy, responsive layouts, repeated exercises in different phases, custom exercises, and screen-reader relationships without relying on a native `title` attribute.
- [x] Investigate historical `quality` failures and retain future diagnostics. The latest historical failure was the coverage step, already followed by a boundary-test fix and successful runs. Current local coverage passes unchanged 95% thresholds, and [CI run 34527897023](https://github.com/hebecked/Home-Workout/actions/runs/34527897023) passed for release commit `3a4f502`. See `docs/ci-quality.md` for evidence and limitations.
- [x] Add a footer-linked **Impressum** with the owner-supplied name and address. Email omission relies on the stated private, non-economic character, not absence of data storage. Chromium offline reload passes. See `docs/review-round-2.md` for the legal scope.
- [ ] Verify offline reload on physical Safari. The isolated-origin offline test passes in native Windows WebKit and the Chromium profile matrix. Native Firefox still cannot launch on this workstation; continuous integration remains the native Firefox verification environment.

### Illustration review, round 2 — 2026-09-07

- [x] Revise every owner-flagged SVG while preserving already accepted images byte-for-byte. Add a separate Dynamic Superman exercise.
- [x] Use a temporary local queue only for revised/new images, then delete its reviewer and feedback data after acceptance.
- [x] Obtain owner approval for the remaining revision-2 item (**Burpee**), apply any further feedback, and repeat if needed. Owner confirmed Burpee on 2026-09-10; no further feedback remains.

## Priority 2 — phase-aware workout model

- [x] Implement the phase-aware schema-v2 design in `docs/phased-workout-proposal.md`: warm-up, one or more training blocks, and cool-down/stretching, each with its own rounds and rest rules. Use **rounds / Runden** for repetitions of an exercise sequence and reserve **repetitions / Wiederholungen** for one movement.
- [x] Add **active recovery** as an optional phase kind. It accepts duration or untimed exercises and remains distinct from passive rest.
- [x] Add phase-aware editor controls, import/export migration, progress UI, and validators after schema-v1 plans can be migrated losslessly.
- [x] Add explicit, non-mutating schema-v1 to schema-v2 migration while retaining the v1 reader for stored plans and shared links.

- [x] **AUDIO-HW-001 · Timer audio options (updated 2026-09-11):** Implemented an opt-in, locally synthesized countdown pattern: short, louder tones as a visible timer enters 3, 2, and 1 seconds, followed by a longer, higher tone at 0. A compact `aria-pressed` button sits immediately right of the wide Start workout action, while the in-workout mute button remains left of End workout. Listening volume follows the device setting; no checkbox or redundant in-app slider is shown. User-gesture unlock, offline synthesis, persistent mute, silent failure, and non-interference with timestamp-based timing are tested. Spoken names remain rejected because browser voices can be missing, device-dependent, or remote. See `docs/audio-decision.md`.
- [x] **WAKE-HW-001 · Keep the screen awake during active workouts (2026-09-11):** Request Screen Wake Lock while a workout is running and visible, release it on pause, completion, abort, or route exit, and reacquire it after returning to a visible workout. Unsupported browsers, power-saving rejection, and automatic revocation remain silent and never interrupt the workout.

## Priority 3 — final public URL (owner decision)

- [ ] **Choose the final public URL.** The existing Cloudflare Pages hostname is `home-workout-65g.pages.dev`. Cloudflare does not let us freely replace only the generated `-65g` part on that existing Pages hostname. Choose either:
  - a custom hostname on a domain already managed in Cloudflare, for example `workout.example.com`; or
  - a new, globally available Pages project name, which creates a different `*.pages.dev` hostname and requires redirect/link migration.

## Priority 4 — later product work

Reassessment on 2026-09-12: the remaining items are optional enhancements. None is required for current workout correctness, backward compatibility, accessibility, or deployment, so no speculative persistence or interface is planned.

- [ ] Add opt-in local workout history and progression views. No analytics or server-side profile is planned.
- [x] Add more bundled UI translations beyond German and English. Owner confirmed this item as implemented on 2026-09-10.
- [x] **PWA-HW-001 · In-app install and update status (2026-09-12):** A compact footer action appears only after a supporting browser emits `beforeinstallprompt`; unsupported browsers keep the existing device-specific help without an inert control. A newly installed service worker waits instead of replacing a running workout, and the footer announces the available update with an explicit reload action. Installation and update failures remain non-blocking.
- [x] **A11Y-HW-001 · Screen-reader smoke tests (updated 2026-09-12):** Added Chromium accessibility-tree and live-region smoke coverage for plan selection, the opt-in audio control, both language preferences, exercise/phase/round announcements, pause state, localized status changes, and focus retention across rerenders.
- [ ] Optionally persist a chosen alternative exercise across a page reload during an active session. Restore the selected alternative without changing the plan, and always keep the original exercise available in the chooser so the user can switch back. The current in-memory chooser already places the original first and clears the override when it is selected.
- [ ] **Optional external illustrations for custom JSON plans — deferred:** Reconsider a schema-v3 field for unknown exercise IDs only; do not expose it in Plan Studio. Any future design must require explicit loading consent, HTTPS, visible source/credit/licence metadata, a local fallback, no offline caching, reduced referrer data, and rejection of credentials, local hosts, and private-network addresses. Public availability alone must not be treated as permission. Obtain a focused legal review before implementation; a creator declaration cannot fully transfer copyright or data-protection liability away from the app operator.

## Completed polish, installability, and ownership

- [x] Shorten the waiting/rest message.
- [x] Add visible, device-specific installation help for Android, iPhone/iPad, and desktop browsers.
- [x] Set the copyright holder to **Dr. Dustin Hebecker** for the 2026 release.

## Completed in the 2026-09-01 release

- [x] Show `Exercise X / Y · Übung X / Y` for the current round.
- [x] Allow a stored easier alternative to be selected visibly during a workout.
- [x] Edit repetition ranges, per-side counting, and duration targets in Plan Studio.
- [x] Duplicate and delete local plans with confirmation; bundled plans remain immutable.
- [x] Replace the original generic placeholder set with movement-specific local SVGs; the current sourced library contains 58.
- [x] Correct Squat, Push-up, Pull-up, Glute Bridge, Dead Bug, and Lying Leg Raises for movement direction and floor contact.
- [x] Prevent browser tests from silently reusing a stale preview server.
