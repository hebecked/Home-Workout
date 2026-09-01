# Home Workout backlog

Last reviewed: 2026-09-01

This file is the durable hand-off for work that must not exist only in an AI conversation. `docs/product-roadmap.md` contains the fuller product context; this file is the short operational checklist.

## Priority 0 — movement safety and correctness

- [ ] **Audit all 33 exercise instructions and illustrations one by one against reliable sources.** Record the source, the text review, the pose review, and the reviewer status in `docs/exercise-audit.md`; an exercise is not complete until both its DE/EN instructions and its start/finish pose are checked.
- [x] Correct the **Pull-up** illustration: show a clear standing/reaching start reference and a second pose lifting upward, without any body part disappearing below the floor.
- [x] Correct the **Assisted Pull-up** illustration: show the assistance method and an anatomically clear upward movement from a supported start.
- [x] Replace the **Side Plank** illustration with an anatomically clear forearm-supported straight line from head through hips to stacked feet; avoid ambiguous overlapping limbs.
- [x] Redesign the **Pike Push-up** illustration so the inverted-V start, bent-elbow lowering phase, hand/foot floor contact, and head movement are immediately understandable.
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
- [x] Replace every generic placeholder pose with one of 33 movement-specific, local SVG illustrations.
- [x] Correct Squat, Push-up, Pull-up, Glute Bridge, Dead Bug, and Lying Leg Raises for movement direction and floor contact.
- [x] Prevent browser tests from silently reusing a stale preview server.
