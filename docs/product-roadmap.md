# Product status and roadmap

Last updated: 2026-08-31

## Implemented in the current release

- Six permanent, validated bundled routines. They are source-controlled app data and are never read from or written to browser plan storage.
- A home-screen routine picker and a dedicated library page.
- Separate local storage for user-created and imported plans.
- Direct editing of local plans while preserving their stable plan ID.
- Safe customization of a bundled routine as a new local copy; the bundled source remains unchanged.
- Complete local SVG coverage for all 33 exercise-library entries with category colors: legs blue, arms orange, core purple, cardio/full body red.
- Small motion arrows and dedicated poses for the balanced routine's easily confused movements.
- AI plan guide, strict direct-link validation, import preview, and JSON-file fallback.
- Stable workout controls, reload-safe timing, skippable rests, and a confirmed abort flow.
- The optional repetition tap counter is intentionally disabled in the UI. Repetition targets remain visible, and duration/rest/total timers remain active.

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

### High priority

- Replace the placeholder copyright holder in `COPYRIGHT_NOTICE.md` before changing the hosted site from owner-only to public access.
- Add explicit delete/archive and duplicate actions for local plans, including a confirmation step and tests.
- Add per-exercise target editing in Plan Studio. At present the editor changes plan metadata and ordering, while newly added library exercises use their safe defaults.
- Add a visible alternative-exercise chooser during a workout; alternatives are already carried in the schema.

### Illustration review

- The 33 SVG files, category palette, and file-level contract tests are complete.
- Dedicated researched poses exist for Squat, Push-up, Pull-up, Reverse Lunge, Glute Bridge, Dead Bug, Lying Leg Raises, and Jumping Jack.
- The other library entries currently use the consistent generated figure system. They should receive dedicated start/end poses in small reviewed batches, with phone-size screenshots and movement-specific source notes.

### Later enhancements

- Optional plan history/migrations if the JSON schema moves beyond version 1.
- Optional workout history and progression tracking, stored locally and opt-in only.
- Additional languages and translated UI chrome.
- Install prompts and richer offline/update feedback.
- Accessibility review with screen-reader smoke tests in addition to the current semantic, focus, contrast, motion, and touch-target checks.
