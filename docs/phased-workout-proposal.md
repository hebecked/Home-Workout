# Phase-aware workout model

Implemented: 2026-09-08

## Terminology

The product should use two distinct terms:

- **Repetitions · Wiederholungen**: repeated executions of one movement, for example 10 squats.
- **Rounds · Runden** (or **circuits · Zirkel**): repeated execution of an ordered sequence of exercises.

The user's requested repetition of several exercises in the same order is therefore a **round**, not a repetition.

## Schema version 2

A plan contains ordered phases instead of one global exercise list. Every phase owns its timing and round rules. In addition to warm-up, training, and cool-down, an optional `active-recovery` phase can contain deliberately low-intensity duration movements such as gentle marching; it is not the same as passive rest.

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

Exercise objects own a target mode: `repetitions`, `duration`, or manually advanced `untimed`. Warm-ups and stretches default to duration; `untimed` covers technique-led movements where the user taps Next when ready.

## Runtime behavior

- Warm-up and cool-down default to one round and no automatic rests between exercises.
- Active-recovery phases default to one round, duration targets, no mandatory rests, and visibly lower-intensity guidance. The user may still choose complete rest.
- Every training phase can define its own number of rounds and three separate rest values: between exercises, between rounds, and after the phase.
- The workout screen shows `Phase X / Y`, the phase name, and `Exercise X / Y` within the current round.
- Phase boundaries receive a short transition card and may be skipped deliberately.
- Previous/Next works across exercise, rest, round, and phase boundaries without resetting elapsed workout time.
- Duration targets keep counting down; repetition targets show a range but do not require a tap counter.

## Compatibility

Every schema-v1 plan is validated first and then migrated in memory to a single `training` phase with identical rounds, exercise order, exercise targets, translations, alternatives, and rest values. The v1 object is not mutated, and merely loading local storage does not rewrite it. V1 imports and launch links therefore remain usable; a user-triggered save or export writes canonical v2. Persisted v1 workout sessions are upgraded to session persistence v2 at read time and continue in the migrated training phase.

The v1 reader and public schema remain part of the supported compatibility path. They may be retired only after a separately documented migration window and evidence that stored plans and shared links no longer require them.
