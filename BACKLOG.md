# Home Workout backlog

Last reviewed: 2026-09-10

This file is the durable hand-off for work that must not exist only in an AI conversation. `docs/product-roadmap.md` contains the fuller product context; this file is the short operational checklist.

## External app-testing findings — historical decisions

The following findings come from `feedback-home-workout-debugging.md` (03.09.2026). All four decisions below were accepted and implemented on 2026-09-07. The native cross-browser rerun remains open because WebKit and Firefox are unavailable on this workstation.

### Resolutions accepted 2026-09-07

- [x] BUG-HW-004: remove the separate checkbox. The button copy now names Cloudflare, the data sent (plan name, exercise names, and instructions), the translation purpose, the replacement of target text, and the need to remove personal/confidential information and review output before saving.
- [x] BUG-HW-003: preserve `0` through editor parsing, reject it in the shared schema validation, show a clear error, and prevent persistence.
- [x] BUG-HW-001: replace the failing primary and category colours with WCAG 2 AA values. The former values and the rollback mapping are in `docs/accessibility-colors.md`.
- [x] BUG-HW-002: render the skip link as the first focusable element and retain a focusable main-content target.
- [ ] Rerun the four cases and manual-translation regression in Chromium and WebKit. Firefox remains a separate local-runner issue.

1. **[x] BUG-HW-004 · Automatic translation consent (high):** Consent gating, no-request behavior, continued translation after consent, and preservation of manual translations are implemented. Report evidence: TC-HW-011/TC-HW-012.
2. **[x] BUG-HW-003 · Zero rounds accepted (high):** Shared validation, clear errors, and prevention of invalid persistence are implemented while values from `1` upward remain valid. Report evidence: TC-HW-018.
3. **[x] BUG-HW-001 · Start-page color contrast (high):** WCAG 2 AA colors and the affected normal, focus, hover, disabled, and workout states are implemented. Report evidence: TC-HW-021 and axe-core output.
4. **[x] BUG-HW-002 · Skip-link focus in WebKit (medium/high):** The focus order, visible focus, main-content target, and keyboard-trap behavior are implemented; native WebKit rerun remains open above. Report evidence: TC-HW-022.

The report also notes that Firefox could not start because of `spawn UNKNOWN`; this is currently a test-environment issue rather than an app finding. Firefox coverage should be considered separately after the local runner problem is resolved, and the four cases above plus the manual-translation regression case should be rerun after any chosen changes.

## Priority 0 — public release hygiene, movement safety, and correctness

- [x] **PRIV-HW-001 · Repository-public-content audit (2026-09-10):** Audited 168 tracked files and reachable Git history for private addresses, credentials, environment files, feedback/reviewer exports, generated reports, and local paths. No private values or sensitive artifacts were found. `docs/private-release-config.md` contains process guidance only; `.env.production.local`, build output, and test artifacts remain ignored.
- [x] Correct **Burpee** to one readable phase with exactly two arms and two legs; avoid limb multiplication caused by overlaid multi-stage poses.
- [x] Make **Side Plank** unambiguously forearm-supported: elbow below the shoulder and forearm visibly grounded.
- [x] Correct **Incline Push-up** so the hands are visibly on the raised support and the feet remain on the floor.
- [x] Correct **Triceps Dip** with a lower support, free space below the hips, and no ambiguous body line below the seat.
- [x] Add sourced DE/EN entries and original SVGs for **Scapular Push-up**, **Active Recovery**, shoulder/upper-back and chest stretches, plus a small yoga-derived mobility set.
- [x] **Audit every bundled exercise instruction and illustration one by one against reliable sources.** All 51 definitions now have an exercise-specific source plus separate DE/EN text and pose sign-off in `docs/exercise-audit.md`. Findings in copy and metadata were corrected, and an automated completeness test guards the checklist.
- [x] Correct **Pull-up, Assisted Pull-up, and Chin-up** with same-scale overlaid poses that show vertical travel rather than two people moving sideways.
- [x] Replace the **Side Plank** illustration with one anatomically clear static forearm-supported pose; no second figure is needed for a hold.
- [x] Redesign the **Pike Push-up** illustration with same-scale overlaid start/lowering poses, fixed hands and feet, and no implied sideways movement.
- [x] Add sourced DE/EN entries and original local SVGs for **Shadowboxing**, **Sumo Squat Hold**, four dynamic warm-ups, and four post-workout stretches.
- [x] Replace every generic exercise sentence with a concise, movement-specific DE/EN setup, action, and key form cue. The complete per-exercise source/pose audit remains open above.
- [x] Run the human illustration review workflow and remove its temporary reviewer and feedback data. The six new dynamic warm-up images were owner-confirmed on 2026-09-10; remaining Burpee approval is tracked in the review item below.

## Priority 1 — multilingual editing and comprehension

- [x] Group the Plan Studio exercise picker by bilingual category and alphabetize exercises inside every group.
- [x] Make the AI workout-plan instructions fully English instead of mixing an English heading with German paragraphs.
- [x] Allow plan and exercise names/instructions to be entered as free text for every added language. Automatic online translation remains optional future work so the offline/private editor does not silently invent fitness instructions.
- [x] Mark the workout variant selector explicitly as **easier alternatives** and explain that the original movement remains selectable.
- [x] Add optional Cloudflare Workers AI pre-translation with explicit user consent, visible source/provider/review status, request limits, and mandatory manual review before saving, exporting, or starting.
- [x] Put repetition targets and duration counters directly below the image and compact the controls without dropping below 44px touch targets. Regression checks cover phone, tablet, desktop and 844×390 landscape layouts.
- [ ] **UI-HW-001 · Plan-selection layout:** Remove the helper text `BEREIT, WENN DU ES BIST` and place the time estimate right-aligned inside the training-plan selector. Verify responsive layout, keyboard focus, and screen-reader labeling.
- [x] Investigate historical `quality` failures and retain future diagnostics. The latest historical failure was the coverage step, already followed by a boundary-test fix and successful runs. Current local coverage passes unchanged 95% thresholds. See `docs/ci-quality.md` for evidence and limitations; a fresh remote run awaits an authorized push.
- [x] Add a footer-linked **Impressum** with the owner-supplied name and address. Email omission relies on the stated private, non-economic character, not absence of data storage. Chromium offline reload passes. See `docs/review-round-2.md` for the legal scope.
- [ ] Verify offline reload on Safari/device or Linux WebKit; Windows WebKit fails internally. Native Firefox also cannot launch on this workstation. These limitations are recorded, not counted as successful browser tests.

### Illustration review, round 2 — 2026-09-07

- [x] Revise all 33 owner-flagged SVGs; preserve the 18 confirmed images byte-for-byte. Add a separate Dynamic Superman exercise.
- [x] Open only the 34 revised/new images in the second review queue; preserve revision-1 feedback, and save blank comments as confirmation.
- [ ] Obtain owner approval for the remaining revision-2 item (**Burpee**), apply any further feedback, and repeat if needed. Agent checks are not owner acceptance.

## Priority 2 — phase-aware workout model

- [x] Implement the phase-aware schema-v2 design in `docs/phased-workout-proposal.md`: warm-up, one or more training blocks, and cool-down/stretching, each with its own rounds and rest rules. Use **rounds / Runden** for repetitions of an exercise sequence and reserve **repetitions / Wiederholungen** for one movement.
- [x] Add **active recovery** as an optional phase kind. It accepts duration or untimed exercises and remains distinct from passive rest.
- [x] Add phase-aware editor controls, import/export migration, progress UI, and validators after schema-v1 plans can be migrated losslessly.
- [x] Add explicit, non-mutating schema-v1 to schema-v2 migration while retaining the v1 reader for stored plans and shared links.

- [ ] **AUDIO-HW-001 · Timer audio options:** Evaluate opt-in sounds when a timer ends and optional spoken exercise names. Check browser support, autoplay/user-gesture restrictions, mute and volume controls, localization, offline behavior, accessibility, and privacy before deciding whether to implement.

## Priority 3 — final public URL (owner decision)

- [ ] **Choose the final public URL.** The existing Cloudflare Pages hostname is `home-workout-65g.pages.dev`. Cloudflare does not let us freely replace only the generated `-65g` part on that existing Pages hostname. Choose either:
  - a custom hostname on a domain already managed in Cloudflare, for example `workout.example.com`; or
  - a new, globally available Pages project name, which creates a different `*.pages.dev` hostname and requires redirect/link migration.

## Priority 4 — later product work

- [ ] Add opt-in local workout history and progression views. No analytics or server-side profile is planned.
- [ ] Add more bundled UI translations beyond German and English.
- [ ] Add a clearer install prompt plus visible offline/update status.
- [ ] Add screen-reader smoke tests to the existing keyboard, focus, contrast, reduced-motion, and touch-target checks.
- [ ] Optionally persist a chosen alternative exercise across a page reload during an active session. The current chooser intentionally affects only the running in-memory session.

## Completed polish, installability, and ownership

- [x] Shorten the waiting/rest message.
- [x] Add visible, device-specific installation help for Android, iPhone/iPad, and desktop browsers.
- [x] Set the copyright holder to **Dr. Dustin Hebecker** for the 2026 release.

## Completed in the 2026-09-01 release

- [x] Show `Exercise X / Y · Übung X / Y` for the current round.
- [x] Allow a stored easier alternative to be selected visibly during a workout.
- [x] Edit repetition ranges, per-side counting, and duration targets in Plan Studio.
- [x] Duplicate and delete local plans with confirmation; bundled plans remain immutable.
- [x] Replace the original generic placeholder set with 33 movement-specific local SVGs; the current sourced library now contains 51.
- [x] Correct Squat, Push-up, Pull-up, Glute Bridge, Dead Bug, and Lying Leg Raises for movement direction and floor contact.
- [x] Prevent browser tests from silently reusing a stale preview server.
