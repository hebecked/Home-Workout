# Product status and roadmap

Last updated: 2026-09-11

## Implemented in the current release

- Six permanent, validated bundled routines. They are source-controlled app data and are never read from or written to browser plan storage.
- A keyboard-accessible home-screen plan list with a right-aligned duration on every option, plus a dedicated library page.
- Separate local storage for user-created and imported plans.
- Direct editing of local plans while preserving their stable plan ID.
- Safe customization of a bundled routine as a new local copy; the bundled source remains unchanged.
- Complete movement-specific local SVG coverage for all 58 exercise-library entries with category colors: legs blue, arms orange, core purple, cardio/full body red, warm-up gold, and stretching teal.
- The Plan Studio exercise picker is grouped by bilingual category and alphabetized within each group.
- Small motion arrows, same-scale overlays for most two-position movements, separated numbered poses for the Burpee sequence, single-pose static holds, and corrected floor contact for easily confused movements.
- AI plan guide, strict direct-link validation, import preview, and JSON-file fallback.
- Stable workout controls, reload-safe timing, skippable rests, and a confirmed abort flow.
- The optional repetition tap counter is intentionally disabled in the UI. Repetition targets remain visible, and duration/rest/total timers remain active.
- Per-round `Exercise X / Y · Übung X / Y` progress and a visible alternative-exercise chooser during workouts.
- Per-exercise target editing plus duplicate and confirmed-delete actions for local plans.
- Schema version 2 plans with warm-up, one or more training phases, optional active recovery, cool-down, and phase-specific timing rules.
- Lossless, non-mutating migration of stored, imported, and linked schema version 1 plans while retaining the public v1 reader and schema.
- A directly translated 16-locale interface, including Arabic right-to-left layout, independent from user-authored workout languages.
- Optional consent-based Cloudflare pre-translation with visible provenance and mandatory manual review before use.
- Opt-in, locally synthesized timer-end signals with a compact stateful button immediately right of the wide Start workout action, fixed moderate output governed by device volume, and in-workout mute immediately left of End workout; spoken names remain deferred for offline, privacy, language-coverage, and screen-reader reasons.
- Screen-reader smoke coverage for semantic plan/audio controls, polite atomic workout announcements, state changes, and focus retention across rerenders.

## Bundled plan catalogue

These presets are for generally healthy adults and are not individualized medical prescriptions.

1. **30 Minute Full Body · 30 Minuten Ganzkörper** — balanced legs, upper body, core, and cardio.
2. **Gentle Start · Sanfter Einstieg** — two low-impact rounds with beginner-friendly alternatives.
3. **Full Body Strength · Ganzkörper Kraftaufbau** — controlled 8–12 repetition ranges with longer rests.
4. **Cardio Base · Ausdauer Basis** — alternating aerobic intervals and lower-intensity recovery work.
5. **Active Circuit · Aktiver Zirkel** — short transitions between large-muscle strength and aerobic exercises; it makes no weight-loss promise.
6. **Advanced Bodyweight · Fortgeschrittenes Körpergewicht** — demanding movements with an easier alternative stored for each challenging slot.

Evidence basis:

- U.S. physical activity guidance recommends 150–300 minutes of moderate aerobic activity per week plus muscle strengthening on 2 days, while inactive adults should start with small amounts: https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/about-physical-activity-guidelines/questions-answers
- CDC guidance calls for a weekly mix of aerobic work and strength work covering all major muscle groups: https://www.cdc.gov/physical-activity-basics/guidelines/adults.html
- ACSM supports simple home/bodyweight routines, gradual progression, and matching volume or load to the goal: https://acsm.org/effective-resistance-training-program-infographic/
- NHS guidance describes 8–12 repetitions, at least 2 sets, gradual buildup, and work for the major muscle groups: https://www.nhs.uk/live-well/exercise/how-to-improve-strength-flexibility/
- CDC notes that physical activity supports healthy weight but nutrition and individual needs also matter: https://www.cdc.gov/healthy-weight-growth/physical-activity/

## Remaining work

### Owner decision

- Choose a final Cloudflare hostname: attach a custom domain or create a new globally unique Pages project name. The generated `-65g` suffix cannot simply be edited on the existing `pages.dev` hostname.

### Completed illustration status

- All 58 SVG files contain a movement-specific pose, the category palette, and file-level contract tests. Moving exercises use a bounded motion arrow; static holds and stretches intentionally do not.
- Pull-up, Assisted Pull-up, Chin-up, and Pike Push-up use same-scale overlaid positions so no sideways travel is implied. Side Plank uses one static figure.
- All 58 exercises have movement-specific German and English instructions, reliable-source assignment, and completed text and pose sign-off in `docs/exercise-audit.md`.
- Source notes and the meaning of the translucent pose are recorded in `docs/exercise-sources.md`.

### Later enhancements

- Optional workout history and progression tracking, stored locally and opt-in only.
- A richer native install prompt and offline/update feedback; device-specific installation instructions are already visible on the guide page.
- Physical-Safari offline verification; native Windows WebKit is covered, while local native Firefox remains blocked at process launch.
- Decide whether a chosen easier alternative should persist across reloads during an active session.

The concise authoritative checklist is [`../BACKLOG.md`](../BACKLOG.md). Every unfinished task must be added there before work stops.
