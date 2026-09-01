# Phase-aware workout proposal

Last updated: 2026-09-01

## Terminology

The product should use two distinct terms:

- **Repetitions · Wiederholungen**: repeated executions of one movement, for example 10 squats.
- **Rounds · Runden** (or **circuits · Zirkel**): repeated execution of an ordered sequence of exercises.

The user's requested repetition of several exercises in the same order is therefore a **round**, not a repetition.

## Proposed schema version 2

A plan contains ordered phases instead of one global exercise list. Every phase owns its timing and round rules:

```json
{
  "schemaVersion": 2,
  "phases": [
    {
      "id": "warm-up",
      "kind": "warm-up",
      "rounds": 1,
      "restBetweenExercises": 0,
      "restBetweenRounds": 0,
      "restAfterPhase": 30,
      "exercises": ["heel-dig", "shoulder-roll", "arm-circle", "leg-swing"]
    },
    {
      "id": "strength-a",
      "kind": "training",
      "rounds": 3,
      "restBetweenExercises": 20,
      "restBetweenRounds": 60,
      "restAfterPhase": 90,
      "exercises": ["squat", "push-up", "dead-bug"]
    },
    {
      "id": "conditioning",
      "kind": "training",
      "rounds": 2,
      "restBetweenExercises": 10,
      "restBetweenRounds": 45,
      "restAfterPhase": 30,
      "exercises": ["shadow-boxing", "sumo-squat-hold"]
    },
    {
      "id": "cool-down",
      "kind": "cool-down",
      "rounds": 1,
      "restBetweenExercises": 0,
      "restBetweenRounds": 0,
      "restAfterPhase": 0,
      "exercises": ["calf-stretch", "hamstring-stretch", "quadriceps-stretch", "hip-flexor-stretch"]
    }
  ]
}
```

Exercise objects should continue to own a target mode: `repetitions`, `duration`, or a new manually advanced `untimed` mode. Warm-ups and stretches default to duration; `untimed` would cover technique-led movements where the user taps Next when ready.

## Runtime behavior

- Warm-up and cool-down default to one round and no automatic rests between exercises.
- Every training phase can define its own number of rounds and three separate rest values: between exercises, between rounds, and after the phase.
- The workout screen shows `Phase X / Y`, the phase name, and `Exercise X / Y` within the current round.
- Phase boundaries receive a short transition card and may be skipped deliberately.
- Previous/Next works across exercise, rest, round, and phase boundaries without resetting elapsed workout time.
- Duration targets keep counting down; repetition targets show a range but do not require a tap counter.

## Compatibility and implementation order

1. Add a strict schema-v2 validator and fixtures without changing the current UI.
2. Migrate every schema-v1 plan to a single `training` phase with identical rounds, order, and rest values.
3. Add deterministic phase transitions to the workout engine plus unit tests for skip, pause, reload, and boundary cases.
4. Add grouped phase editing and drag/reorder controls to Plan Studio.
5. Extend JSON import/export and the AI plan guide with versioned examples.
6. Preserve the v1 reader until stored plans and shared links have a documented retirement path.

This proposal is intentionally documentation-first. Changing the production schema without migration and engine tests would risk invalidating existing local plans and active sessions.
