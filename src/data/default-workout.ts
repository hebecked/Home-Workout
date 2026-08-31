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
const plan = (
  id: string,
  name: WorkoutPlan['name'],
  rounds: number,
  restBetweenExercises: number,
  restBetweenRounds: number,
  exercises: Array<[string, PlanExercise['target']?, string[]?]>
): WorkoutPlan => ({
  schemaVersion: 1,
  id,
  languages: structuredClone(languages),
  name,
  displayLanguages: ['de', 'en'],
  rounds,
  restBetweenExercises,
  restBetweenRounds,
  exercises: exercises.map(([exerciseId, target, alternatives]) => slot(id, exerciseId, target, alternatives))
});

export const DEFAULT_WORKOUT: WorkoutPlan = plan(
  '30-minute-full-body',
  { de: '30 Minuten Ganzkörper', en: '30 Minute Full Body' },
  3,
  20,
  60,
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
