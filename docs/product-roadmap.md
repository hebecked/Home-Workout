# Product roadmap

## Researched default plan catalogue

These five candidates are product presets for generally healthy adults, not individualized medical prescriptions. The common baseline is gradual progression, whole-body strength work at least twice weekly, and a weekly mix of aerobic and muscle-strengthening activity.

1. **Gentle Start · Einstieg** — 15–20 minutes, 2 rounds, 6 low-impact movements, 8–10 controlled repetitions or 20–30 seconds, 30 seconds between exercises. Use Marching in Place, Squat, Incline Push-up, Glute Bridge, Bird Dog, and Step Jack. This follows the public-health recommendation that inactive adults start small and build gradually.
2. **Full-body Strength · Kraftaufbau** — 30–35 minutes, 3 rounds, 8 movements, generally 8–12 repetitions, 45–75 seconds between exercises. Alternate Squat, Push-up, Reverse Lunge, Resistance Band Row, Glute Bridge, Pike Push-up, Dead Bug, and Pull-up/Assisted Pull-up. Progress via harder variants, more controlled repetitions, or added resistance rather than random complexity.
3. **Cardio Base · Ausdauer** — 25–30 minutes, 3 rounds of 30–45-second work intervals with 15–25-second transitions. Alternate Jumping Jack/Step Jack, High Knees/Marching, Mountain Climber, Squat to Reach, and core recovery movements. Use the talk test to keep the session at the intended moderate or vigorous level.
4. **Active Circuit · Gewichtsmanagement** — 25–30 minutes, 3 rounds, alternating large-muscle strength and aerobic exercises with short, configurable rests. The app must explain that exercise supports weight management but body-weight change also depends strongly on nutrition and individual energy needs; it must not promise weight loss.
5. **Advanced Bodyweight · Fortgeschritten** — 35–40 minutes, 4 rounds, 8 demanding movements such as Pike Push-up, Pull-up/Chin-up, Split Squat, Single-leg Glute Bridge, Burpee, Side Plank, Hollow Hold, and Lying Leg Raise. Provide easier alternatives for every slot and avoid presenting failure training or advanced techniques as mandatory.

Evidence basis:

- U.S. physical activity guidance recommends 150–300 minutes of moderate aerobic activity per week plus muscle strengthening on 2 days, while inactive adults should start with small amounts: https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/about-physical-activity-guidelines/questions-answers
- CDC guidance calls for a weekly mix of aerobic work and strength work covering all major muscle groups: https://www.cdc.gov/physical-activity-basics/guidelines/adults.html
- ACSM's resistance-training guidance supports simple home/bodyweight routines, gradual progression, and matching volume or load to the goal: https://acsm.org/effective-resistance-training-program-infographic/
- NHS guidance describes 8–12 repetitions, at least 2 sets, gradual buildup, and work for the major muscle groups: https://www.nhs.uk/live-well/exercise/how-to-improve-strength-flexibility/
- CDC notes that physical activity supports healthy weight but nutrition and individual needs also matter: https://www.cdc.gov/healthy-weight-growth/physical-activity/

## Editing existing plans

- Add an **Edit** action to saved-plan cards.
- Clone bundled defaults before editing so updates never mutate the shipped reference plan.
- Preserve stable plan IDs when saving an edit; offer **Save as copy** for experimentation.
- Reuse the existing editor validation, ordering, translations, alternatives, import, and export paths.
- Add tests for edit, cancel, overwrite, clone, reload, and schema migration behavior.

## Illustration completion

- Audit every library illustration outside the current default plan against the actual movement and start/end positions.
- Keep the category palette: legs blue, arms orange, core purple, cardio/full body red.
- Use small directional arrows consistently and avoid ambiguous or anatomically implausible lines.
- Review at phone size and add an illustration-contract test for every revised asset.
