# Home Workout backlog

Last reviewed: 2026-09-01

This file is the durable hand-off for work that must not exist only in an AI conversation. `docs/product-roadmap.md` contains the fuller product context; this file is the short operational checklist.

## Priority 0 — movement safety and correctness

- [ ] **Audit every bundled exercise instruction and illustration one by one against reliable sources.** Record the source, the text review, the pose review, and the reviewer status in `docs/exercise-audit.md`; an exercise is not complete until both its DE/EN instructions and its pose are checked.
- [x] Correct **Pull-up, Assisted Pull-up, and Chin-up** with same-scale overlaid poses that show vertical travel rather than two people moving sideways.
- [x] Replace the **Side Plank** illustration with one anatomically clear static forearm-supported pose; no second figure is needed for a hold.
- [x] Redesign the **Pike Push-up** illustration with same-scale overlaid start/lowering poses, fixed hands and feet, and no implied sideways movement.
- [x] Add sourced DE/EN entries and original local SVGs for **Shadowboxing**, **Sumo Squat Hold**, four dynamic warm-ups, and four post-workout stretches.
- [x] Replace every generic exercise sentence with a concise, movement-specific DE/EN setup, action, and key form cue. The complete per-exercise source/pose audit remains open above.

## Priority 1 — multilingual editing and comprehension

- [x] Make the AI workout-plan instructions fully English instead of mixing an English heading with German paragraphs.
- [x] Allow plan and exercise names/instructions to be entered as free text for every added language. Automatic online translation remains optional future work so the offline/private editor does not silently invent fitness instructions.
- [x] Mark the workout variant selector explicitly as **easier alternatives** and explain that the original movement remains selectable.
- [ ] Consider optional automatic translation only with explicit user consent, visible source/quality status, and manual review before saving.

## Priority 2 — polish, installability, and ownership

- [x] Shorten the waiting/rest message.
- [x] Add visible, device-specific installation help for Android, iPhone/iPad, and desktop browsers.
- [x] Set the copyright holder to **Dr. Dustin Hebecker** for the 2026 release.

## Needs an owner decision

- [ ] **Choose the final public URL.** The existing Cloudflare Pages hostname is `home-workout-65g.pages.dev`. Cloudflare does not let us freely replace only the generated `-65g` part on that existing Pages hostname. Choose either:
  - a custom hostname on a domain already managed in Cloudflare, for example `workout.example.com`; or
  - a new, globally available Pages project name, which creates a different `*.pages.dev` hostname and requires redirect/link migration.

## Later product work

- [ ] Implement the phase-aware schema-v2 design in `docs/phased-workout-proposal.md`: warm-up, one or more training blocks, and cool-down/stretching, each with its own rounds and rest rules. Use **rounds / Runden** for repetitions of an exercise sequence and reserve **repetitions / Wiederholungen** for one movement.
- [ ] Add phase-aware editor controls, import/export migration, progress UI, and validators only after schema-v1 plans can be migrated losslessly.
- [ ] Add opt-in local workout history and progression views. No analytics or server-side profile is planned.
- [ ] Add explicit schema migrations before introducing workout-plan schema version 2.
- [ ] Add more bundled UI translations beyond German and English.
- [ ] Add a clearer install prompt plus visible offline/update status.
- [ ] Add screen-reader smoke tests to the existing keyboard, focus, contrast, reduced-motion, and touch-target checks.
- [ ] Optionally persist a chosen alternative exercise across a page reload during an active session. The current chooser intentionally affects only the running in-memory session.

## Completed in the 2026-09-01 release

- [x] Show `Exercise X / Y · Übung X / Y` for the current round.
- [x] Allow a stored easier alternative to be selected visibly during a workout.
- [x] Edit repetition ranges, per-side counting, and duration targets in Plan Studio.
- [x] Duplicate and delete local plans with confirmation; bundled plans remain immutable.
- [x] Replace the original generic placeholder set with 33 movement-specific local SVGs; the current sourced library now contains 43.
- [x] Correct Squat, Push-up, Pull-up, Glute Bridge, Dead Bug, and Lying Leg Raises for movement direction and floor contact.
- [x] Prevent browser tests from silently reusing a stale preview server.
