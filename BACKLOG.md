# Home Workout backlog

Last reviewed: 2026-09-01

This file is the durable hand-off for work that must not exist only in an AI conversation. `docs/product-roadmap.md` contains the fuller product context; this file is the short operational checklist.

## Needs an owner decision

- [ ] **Choose the final public URL.** The existing Cloudflare Pages hostname is `home-workout-65g.pages.dev`. Cloudflare does not let us freely replace only the generated `-65g` part on that existing Pages hostname. Choose either:
  - a custom hostname on a domain already managed in Cloudflare, for example `workout.example.com`; or
  - a new, globally available Pages project name, which creates a different `*.pages.dev` hostname and requires redirect/link migration.
- [ ] **Provide the legal copyright holder and year** for `COPYRIGHT_NOTICE.md`. Do not infer the legal identity from GitHub, email, or Cloudflare account metadata.

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

