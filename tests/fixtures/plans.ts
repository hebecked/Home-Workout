import type { WorkoutPlan, WorkoutPlanV1 } from '../../src/core/plan-schema';

/** A valid plan deliberately containing no German translation. */
export function makeMultilingualPlan(): WorkoutPlan {
  return {
    schemaVersion: 2,
    id: 'plan-fr-hi',
    languages: [
      { code: 'fr', label: 'Français' },
      { code: 'hi', label: 'हिन्दी' }
    ],
    name: {
      fr: 'Circuit maison',
      hi: 'घर का व्यायाम'
    },
    displayLanguages: ['fr', 'hi'],
    phases: [{
      id: 'training', kind: 'training', rounds: 2,
      restBetweenExercises: 20, restBetweenRounds: 60, restAfterPhase: 0,
      exercises: [
      {
        id: 'plan-exercise-squat',
        exerciseId: 'squat',
        type: 'repetitions',
        target: { min: 8, max: 12, unit: 'repetitions' },
        translations: {
          fr: { name: 'Squat', instructions: 'Descendez avec le dos droit.' },
          hi: { name: 'स्क्वैट', instructions: 'पीठ सीधी रखकर नीचे जाएँ।' }
        },
        alternativeExerciseIds: ['wall-sit']
      },
      {
        id: 'plan-exercise-plank',
        exerciseId: 'plank',
        type: 'duration',
        target: { seconds: 30 },
        translations: {
          fr: { name: 'Planche', instructions: 'Gardez le corps aligné.' },
          hi: { name: 'प्लैंक', instructions: 'शरीर को सीधा रखें।' }
        },
        alternativeExerciseIds: ['dead-bug']
      }
      ]
    }]
  };
}

export function clonePlan(): WorkoutPlan {
  return structuredClone(makeMultilingualPlan());
}

export function makeV1Plan(): WorkoutPlanV1 {
  const plan = makeMultilingualPlan();
  const training = plan.phases[0]!;
  return {
    schemaVersion: 1,
    id: plan.id,
    languages: structuredClone(plan.languages),
    name: structuredClone(plan.name),
    displayLanguages: [...plan.displayLanguages],
    rounds: training.rounds,
    restBetweenExercises: training.restBetweenExercises,
    restBetweenRounds: training.restBetweenRounds,
    exercises: structuredClone(training.exercises)
  };
}
