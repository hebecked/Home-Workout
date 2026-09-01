# Product status and roadmap

Last updated: 2026-09-01

## Implemented in the current release

- Six permanent, validated bundled routines. They are source-controlled app data and are never read from or written to browser plan storage.
- A home-screen routine picker and a dedicated library page.
- Separate local storage for user-created and imported plans.
- Direct editing of local plans while preserving their stable plan ID.
- Safe customization of a bundled routine as a new local copy; the bundled source remains unchanged.
- Complete movement-specific local SVG coverage for all 51 exercise-library entries with category colors: legs blue, arms orange, core purple, cardio/full body red, warm-up gold, and stretching teal.
- The Plan Studio exercise picker is grouped by bilingual category and alphabetized within each group.
- Small motion arrows, same-scale overlaid movement poses, single-pose static holds, and corrected floor contact for easily confused movements.
- AI plan guide, strict direct-link validation, import preview, and JSON-file fallback.
- Stable workout controls, reload-safe timing, skippable rests, and a confirmed abort flow.
- The optional repetition tap counter is intentionally disabled in the UI. Repetition targets remain visible, and duration/rest/total timers remain active.
- Per-round `Exercise X / Y · Übung X / Y` progress and a visible alternative-exercise chooser during workouts.
- Per-exercise target editing plus duplicate and confirmed-delete actions for local plans.

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

### Owner decisions

- Choose a final Cloudflare hostname: attach a custom domain or create a new globally unique Pages project name. The generated `-65g` suffix cannot simply be edited on the existing `pages.dev` hostname.

### Illustration status

- All 51 SVG files contain a movement-specific pose, the category palette, and file-level contract tests. Moving exercises use a bounded motion arrow; static holds and stretches intentionally do not.
- Pull-up, Assisted Pull-up, Chin-up, and Pike Push-up use same-scale overlaid positions so no sideways travel is implied. Side Plank uses one static figure.
- All 51 exercises have movement-specific German and English instructions. The remaining independent source comparison is tracked row by row in `docs/exercise-audit.md`.
- Source notes and the meaning of the translucent pose are recorded in `docs/exercise-sources.md`.

### Later enhancements

- Optional plan history/migrations if the JSON schema moves beyond version 1.
- Phase-aware schema version 2 with warm-up, multiple training phases, cool-down, per-phase rounds, and independent rest rules; see `docs/phased-workout-proposal.md`.
- Optional workout history and progression tracking, stored locally and opt-in only.
- Optional consent-based automatic translation and translated UI chrome; manual free-text translations already work for every configured plan language.
- A richer native install prompt and offline/update feedback; device-specific installation instructions are already visible on the guide page.
- Accessibility review with screen-reader smoke tests in addition to the current semantic, focus, contrast, motion, and touch-target checks.

The concise authoritative checklist is [`../BACKLOG.md`](../BACKLOG.md). Every unfinished task must be added there before work stops.
