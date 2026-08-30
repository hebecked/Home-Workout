import type { PlanExercise, WorkoutPlan } from '../core/plan-schema';
import { EXERCISES_BY_ID } from './exercises';

function slot(exerciseId: string, target?: PlanExercise['target'], alternatives?: string[]): PlanExercise {
  const exercise = EXERCISES_BY_ID.get(exerciseId);
  if (!exercise) throw new Error(`Unknown built-in exercise: ${exerciseId}`);
  return {
    id: `default-${exerciseId}`,
    exerciseId,
    type: exercise.type,
    target: target ?? structuredClone(exercise.defaultTarget),
    translations: structuredClone(exercise.translations),
    alternativeExerciseIds: alternatives ?? [...exercise.variants.easier]
  };
}

export const DEFAULT_WORKOUT: WorkoutPlan = {
  schemaVersion: 1,
  id: '30-minute-full-body',
  languages: [{ code: 'de', label: 'Deutsch' }, { code: 'en', label: 'English' }],
  name: { de: '30 Minuten Ganzkörper', en: '30 Minute Full Body' },
  displayLanguages: ['de', 'en'],
  rounds: 3,
  restBetweenExercises: 20,
  restBetweenRounds: 60,
  exercises: [
    slot('squat', { min: 12, max: 15, unit: 'repetitions' }),
    slot('push-up', { min: 6, max: 15, unit: 'repetitions' }, ['incline-push-up', 'knee-push-up']),
    slot('pull-up', { min: 5, max: 10, unit: 'repetitions' }, ['assisted-pull-up', 'resistance-band-row']),
    slot('reverse-lunge', { min: 8, max: 12, unit: 'per-side' }),
    slot('glute-bridge', { min: 12, max: 20, unit: 'repetitions' }),
    slot('dead-bug', { min: 6, max: 10, unit: 'per-side' }),
    slot('jumping-jack', { seconds: 30 }, ['step-jack'])
  ]
};
