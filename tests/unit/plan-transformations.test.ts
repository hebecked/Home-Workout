import { describe, expect, it } from 'vitest';
import {
  addPlanExercise,
  movePlanExercise,
  removePlanExercise,
  setDisplayLanguages,
  updatePlanExerciseTarget
} from '../../src/core/plan-transformations';
import { clonePlan } from '../fixtures/plans';

describe('immutable plan transformations', () => {
  it('adds an exercise at a requested position without mutating the plan', () => {
    const original = clonePlan();
    const newExercise = {
      ...structuredClone(original.exercises[0]!),
      id: 'new-slot',
      exerciseId: 'reverse-lunge'
    };

    const changed = addPlanExercise(original, newExercise, 1);

    expect(changed.exercises.map(({ id }) => id)).toEqual([
      'plan-exercise-squat', 'new-slot', 'plan-exercise-plank'
    ]);
    expect(original.exercises).toHaveLength(2);
    expect(changed).not.toBe(original);
  });

  it('removes by slot id and refuses to create an empty workout', () => {
    const original = clonePlan();
    const changed = removePlanExercise(original, 'plan-exercise-squat');

    expect(changed.exercises.map(({ id }) => id)).toEqual(['plan-exercise-plank']);
    expect(() => removePlanExercise(changed, 'plan-exercise-plank')).toThrow();
    expect(() => removePlanExercise(original, 'unknown')).toThrow();
  });

  it('moves exercises with well-defined zero-based indices', () => {
    const original = clonePlan();
    const third = { ...structuredClone(original.exercises[0]!), id: 'third' };
    const withThird = addPlanExercise(original, third, 2);

    expect(movePlanExercise(withThird, 'third', 0).exercises.map(({ id }) => id)).toEqual([
      'third', 'plan-exercise-squat', 'plan-exercise-plank'
    ]);
    expect(movePlanExercise(withThird, 'plan-exercise-squat', 2).exercises.map(({ id }) => id)).toEqual([
      'plan-exercise-plank', 'third', 'plan-exercise-squat'
    ]);
    expect(() => movePlanExercise(withThird, 'third', -1)).toThrow();
    expect(() => movePlanExercise(withThird, 'third', 3)).toThrow();
  });

  it('updates repetition and duration targets while preserving all other fields', () => {
    const original = clonePlan();
    const reps = updatePlanExerciseTarget(
      original,
      'plan-exercise-squat',
      { min: 10, max: 15, unit: 'per-side' }
    );
    const duration = updatePlanExerciseTarget(
      reps,
      'plan-exercise-plank',
      { seconds: 45 }
    );

    expect(duration.exercises[0]!.target).toStrictEqual({ min: 10, max: 15, unit: 'per-side' });
    expect(duration.exercises[1]!.target).toStrictEqual({ seconds: 45 });
    expect(original.exercises[0]!.target).toStrictEqual({ min: 8, max: 12, unit: 'repetitions' });
  });

  it('allows either language to be hidden and preserves caller order', () => {
    const original = clonePlan();

    expect(setDisplayLanguages(original, ['hi']).displayLanguages).toEqual(['hi']);
    expect(setDisplayLanguages(original, ['hi', 'fr']).displayLanguages).toEqual(['hi', 'fr']);
    expect(() => setDisplayLanguages(original, [])).toThrow();
    expect(() => setDisplayLanguages(original, ['de'])).toThrow();
  });
});
