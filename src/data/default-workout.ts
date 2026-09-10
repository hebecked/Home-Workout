import type { PlanExercise, WorkoutPlan } from '../core/plan-schema';
import { EXERCISES_BY_ID } from './exercises';

function slot(planId: string, exerciseId: string, target?: PlanExercise['target'], alternatives?: string[]): PlanExercise {
  const exercise = EXERCISES_BY_ID.get(exerciseId);
  if (!exercise) throw new Error(`Unknown built-in exercise: ${exerciseId}`);
  return {
    id: `${planId}-${exerciseId}`,
    exerciseId,
    type: exercise.type,
    target: target ?? structuredClone(exercise.defaultTarget),
    translations: structuredClone(exercise.translations),
    alternativeExerciseIds: alternatives ?? [...exercise.variants.easier]
  };
}

const languages = [{ code: 'de', label: 'Deutsch' }, { code: 'en', label: 'English' }];
type PhaseExercise = readonly [string, PlanExercise['target']?, string[]?];
type Preparation = Readonly<{ warmUp: PhaseExercise[]; coolDown: PhaseExercise[] }>;

const plan = (
  id: string,
  name: WorkoutPlan['name'],
  rounds: number,
  restBetweenExercises: number,
  restBetweenRounds: number,
  preparation: Preparation,
  exercises: PhaseExercise[]
): WorkoutPlan => ({
  schemaVersion: 2,
  id,
  languages: structuredClone(languages),
  name,
  displayLanguages: ['de', 'en'],
  phases: [
    {
      id: 'warm-up', kind: 'warm-up', rounds: 1,
      restBetweenExercises: 0, restBetweenRounds: 0, restAfterPhase: 20,
      exercises: preparation.warmUp.map(([exerciseId, target, alternatives]) =>
        slot(`${id}-warm-up`, exerciseId, target, alternatives))
    },
    {
      id: 'training', kind: 'training', rounds,
      restBetweenExercises, restBetweenRounds, restAfterPhase: 30,
      exercises: exercises.map(([exerciseId, target, alternatives]) =>
        slot(`${id}-training`, exerciseId, target, alternatives))
    },
    {
      id: 'cool-down', kind: 'cool-down', rounds: 1,
      restBetweenExercises: 0, restBetweenRounds: 0, restAfterPhase: 0,
      exercises: preparation.coolDown.map(([exerciseId, target, alternatives]) =>
        slot(`${id}-cool-down`, exerciseId, target, alternatives))
    }
  ]
});

const PREPARATIONS: Readonly<Record<string, Preparation>> = {
  '30-minute-full-body': {
    warmUp: [
      ['marching-in-place', { seconds: 30 }],
      ['torso-rotations', { seconds: 30 }],
      ['bodyweight-good-morning', { min: 8, max: 10, unit: 'repetitions' }],
      ['dynamic-lunge-reach', { min: 6, max: 6, unit: 'per-side' }]
    ],
    coolDown: [
      ['active-recovery', { seconds: 60 }],
      ['hamstring-stretch', { seconds: 30 }],
      ['hip-flexor-stretch', { seconds: 30 }],
      ['chest-stretch', { seconds: 30 }],
      ['shoulder-upper-back-stretch', { seconds: 30 }]
    ]
  },
  'gentle-start': {
    warmUp: [
      ['heel-dig', { seconds: 30 }],
      ['shoulder-roll', { seconds: 30 }],
      ['ankle-rocks', { seconds: 30 }],
      ['hip-circles', { seconds: 30 }]
    ],
    coolDown: [
      ['active-recovery', { seconds: 60 }],
      ['calf-stretch', { seconds: 30 }],
      ['hip-flexor-stretch', { seconds: 30 }],
      ['shoulder-upper-back-stretch', { seconds: 30 }]
    ]
  },
  'full-body-strength': {
    warmUp: [
      ['marching-in-place', { seconds: 30 }],
      ['arm-circle', { seconds: 30 }],
      ['bodyweight-good-morning', { min: 8, max: 10, unit: 'repetitions' }],
      ['dynamic-lunge-reach', { min: 6, max: 6, unit: 'per-side' }]
    ],
    coolDown: [
      ['hamstring-stretch', { seconds: 30 }],
      ['quadriceps-stretch', { seconds: 30 }],
      ['chest-stretch', { seconds: 30 }],
      ['shoulder-upper-back-stretch', { seconds: 30 }]
    ]
  },
  'cardio-base': {
    warmUp: [
      ['marching-in-place', { seconds: 45 }],
      ['heel-dig', { seconds: 30 }],
      ['arm-circle', { seconds: 30 }],
      ['dynamic-lunge-reach', { min: 6, max: 6, unit: 'per-side' }]
    ],
    coolDown: [
      ['active-recovery', { seconds: 60 }],
      ['calf-stretch', { seconds: 30 }],
      ['quadriceps-stretch', { seconds: 30 }],
      ['hip-flexor-stretch', { seconds: 30 }]
    ]
  },
  'active-circuit': {
    warmUp: [
      ['heel-dig', { seconds: 30 }],
      ['torso-rotations', { seconds: 30 }],
      ['bodyweight-good-morning', { min: 8, max: 10, unit: 'repetitions' }],
      ['dynamic-lunge-reach', { min: 6, max: 6, unit: 'per-side' }]
    ],
    coolDown: [
      ['active-recovery', { seconds: 60 }],
      ['quadriceps-stretch', { seconds: 30 }],
      ['chest-stretch', { seconds: 30 }],
      ['child-pose', { seconds: 30 }]
    ]
  },
  'advanced-bodyweight': {
    warmUp: [
      ['jumping-jack', { seconds: 30 }, ['step-jack']],
      ['dynamic-lunge-reach', { min: 8, max: 8, unit: 'per-side' }],
      ['inchworm', { min: 5, max: 5, unit: 'repetitions' }],
      ['scapular-push-up', { min: 8, max: 10, unit: 'repetitions' }]
    ],
    coolDown: [
      ['active-recovery', { seconds: 60 }],
      ['hamstring-stretch', { seconds: 30 }],
      ['hip-flexor-stretch', { seconds: 30 }],
      ['chest-stretch', { seconds: 30 }],
      ['child-pose', { seconds: 30 }]
    ]
  }
};

export const DEFAULT_WORKOUT: WorkoutPlan = plan(
  '30-minute-full-body',
  { de: '30 Minuten Ganzkörper', en: '30 Minute Full Body' },
  3,
  20,
  60,
  PREPARATIONS['30-minute-full-body']!,
  [
    ['squat', { min: 12, max: 15, unit: 'repetitions' }],
    ['push-up', { min: 6, max: 15, unit: 'repetitions' }, ['incline-push-up', 'knee-push-up']],
    ['reverse-lunge', { min: 8, max: 12, unit: 'per-side' }],
    ['pull-up', { min: 5, max: 10, unit: 'repetitions' }, ['assisted-pull-up', 'resistance-band-row']],
    ['glute-bridge', { min: 12, max: 20, unit: 'repetitions' }],
    ['dead-bug', { min: 6, max: 10, unit: 'per-side' }],
    ['jumping-jack', { seconds: 30 }, ['step-jack']],
    ['lying-leg-raise', { min: 8, max: 12, unit: 'repetitions' }, ['dead-bug']]
  ]
);

export const BUILT_IN_WORKOUTS: WorkoutPlan[] = [
  DEFAULT_WORKOUT,
  plan(
    'gentle-start',
    { de: 'Sanfter Einstieg', en: 'Gentle Start' },
    2,
    30,
    60,
    PREPARATIONS['gentle-start']!,
    [
      ['marching-in-place', { seconds: 30 }],
      ['squat', { min: 8, max: 10, unit: 'repetitions' }, ['wall-sit']],
      ['incline-push-up', { min: 6, max: 10, unit: 'repetitions' }, ['knee-push-up']],
      ['glute-bridge', { min: 10, max: 12, unit: 'repetitions' }],
      ['bird-dog', { min: 6, max: 8, unit: 'per-side' }, ['dead-bug']],
      ['step-jack', { seconds: 30 }, ['marching-in-place']]
    ]
  ),
  plan(
    'full-body-strength',
    { de: 'Ganzkörper Kraftaufbau', en: 'Full Body Strength' },
    3,
    45,
    75,
    PREPARATIONS['full-body-strength']!,
    [
      ['squat', { min: 8, max: 12, unit: 'repetitions' }],
      ['push-up', { min: 8, max: 12, unit: 'repetitions' }, ['incline-push-up', 'knee-push-up']],
      ['reverse-lunge', { min: 8, max: 12, unit: 'per-side' }],
      ['resistance-band-row', { min: 8, max: 12, unit: 'repetitions' }, ['resistance-band-pull-apart']],
      ['glute-bridge', { min: 10, max: 15, unit: 'repetitions' }],
      ['pike-push-up', { min: 6, max: 10, unit: 'repetitions' }, ['push-up']],
      ['dead-bug', { min: 8, max: 12, unit: 'per-side' }],
      ['pull-up', { min: 5, max: 8, unit: 'repetitions' }, ['assisted-pull-up', 'resistance-band-row']]
    ]
  ),
  plan(
    'cardio-base',
    { de: 'Ausdauer Basis', en: 'Cardio Base' },
    3,
    20,
    60,
    PREPARATIONS['cardio-base']!,
    [
      ['step-jack', { seconds: 40 }, ['marching-in-place']],
      ['squat-to-reach', { min: 10, max: 15, unit: 'repetitions' }, ['squat']],
      ['high-knees', { seconds: 30 }, ['marching-in-place']],
      ['dead-bug', { min: 6, max: 10, unit: 'per-side' }],
      ['mountain-climber', { seconds: 30 }, ['marching-in-place']],
      ['marching-in-place', { seconds: 45 }]
    ]
  ),
  plan(
    'active-circuit',
    { de: 'Aktiver Zirkel', en: 'Active Circuit' },
    3,
    15,
    45,
    PREPARATIONS['active-circuit']!,
    [
      ['jumping-jack', { seconds: 40 }, ['step-jack']],
      ['squat', { min: 12, max: 15, unit: 'repetitions' }],
      ['push-up', { min: 8, max: 12, unit: 'repetitions' }, ['incline-push-up', 'knee-push-up']],
      ['reverse-lunge', { min: 8, max: 12, unit: 'per-side' }],
      ['mountain-climber', { seconds: 30 }, ['marching-in-place']],
      ['dead-bug', { min: 8, max: 12, unit: 'per-side' }]
    ]
  ),
  plan(
    'advanced-bodyweight',
    { de: 'Fortgeschrittenes Körpergewicht', en: 'Advanced Bodyweight' },
    4,
    30,
    90,
    PREPARATIONS['advanced-bodyweight']!,
    [
      ['burpee', { min: 6, max: 10, unit: 'repetitions' }, ['squat-to-reach']],
      ['split-squat', { min: 8, max: 12, unit: 'per-side' }, ['reverse-lunge']],
      ['pull-up', { min: 5, max: 8, unit: 'repetitions' }, ['assisted-pull-up', 'resistance-band-row']],
      ['side-plank', { seconds: 30 }, ['plank']],
      ['pike-push-up', { min: 6, max: 10, unit: 'repetitions' }, ['push-up']],
      ['single-leg-glute-bridge', { min: 8, max: 12, unit: 'per-side' }, ['glute-bridge']],
      ['hollow-hold', { seconds: 30 }, ['dead-bug']],
      ['lying-leg-raise', { min: 10, max: 15, unit: 'repetitions' }, ['dead-bug']]
    ]
  )
];

export const BUILT_IN_WORKOUTS_BY_ID = new Map(BUILT_IN_WORKOUTS.map((workout) => [workout.id, workout]));
export const isBuiltInWorkout = (planId: string): boolean => BUILT_IN_WORKOUTS_BY_ID.has(planId);
