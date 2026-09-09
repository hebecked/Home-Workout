import { describe, expect, it } from 'vitest';
import {
  addPlanExercise,
  addPlanPhase,
  movePlanExercise,
  movePlanPhase,
  removePlanExercise,
  removePlanPhase,
  setDisplayLanguages,
  updatePlanExerciseTarget
} from '../../src/core/plan-transformations';
import { clonePlan } from '../fixtures/plans';

describe('immutable plan transformations', () => {
  it('adds an exercise at a requested position without mutating the plan', () => {
    const original = clonePlan();
    const newExercise = {
      ...structuredClone(original.phases[0]!.exercises[0]!),
      id: 'new-slot',
      exerciseId: 'reverse-lunge'
    };

    const changed = addPlanExercise(original, newExercise, 1);

    expect(changed.phases[0]!.exercises.map(({ id }) => id)).toEqual([
      'plan-exercise-squat', 'new-slot', 'plan-exercise-plank'
    ]);
    expect(original.phases[0]!.exercises).toHaveLength(2);
    expect(changed).not.toBe(original);
  });

  it.each([-1, 0.5, 3])('rejects invalid add positions (%s)', (index) => {
    const original = clonePlan();
    const exercise = { ...structuredClone(original.phases[0]!.exercises[0]!), id: 'new-slot' };

    expect(() => addPlanExercise(original, exercise, index)).toThrow(RangeError);
  });

  it('removes by slot id and refuses to create an empty workout', () => {
    const original = clonePlan();
    const changed = removePlanExercise(original, 'plan-exercise-squat');

    expect(changed.phases[0]!.exercises.map(({ id }) => id)).toEqual(['plan-exercise-plank']);
    expect(() => removePlanExercise(changed, 'plan-exercise-plank')).toThrow();
    expect(() => removePlanExercise(original, 'unknown')).toThrow();
  });

  it('moves exercises with well-defined zero-based indices', () => {
    const original = clonePlan();
    const third = { ...structuredClone(original.phases[0]!.exercises[0]!), id: 'third' };
    const withThird = addPlanExercise(original, third, 2);

    expect(movePlanExercise(withThird, 'third', 0).phases[0]!.exercises.map(({ id }) => id)).toEqual([
      'third', 'plan-exercise-squat', 'plan-exercise-plank'
    ]);
    expect(movePlanExercise(withThird, 'plan-exercise-squat', 2).phases[0]!.exercises.map(({ id }) => id)).toEqual([
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

    expect(duration.phases[0]!.exercises[0]!.target).toStrictEqual({ min: 10, max: 15, unit: 'per-side' });
    expect(duration.phases[0]!.exercises[1]!.target).toStrictEqual({ seconds: 45 });
    expect(original.phases[0]!.exercises[0]!.target).toStrictEqual({ min: 8, max: 12, unit: 'repetitions' });
  });

  it('refuses to update a target for an unknown exercise slot', () => {
    expect(() => updatePlanExerciseTarget(
      clonePlan(),
      'missing-slot',
      { seconds: 30 }
    )).toThrow(/not found/i);
  });

  it('allows either language to be hidden and preserves caller order', () => {
    const original = clonePlan();

    expect(setDisplayLanguages(original, ['hi']).displayLanguages).toEqual(['hi']);
    expect(setDisplayLanguages(original, ['hi', 'fr']).displayLanguages).toEqual(['hi', 'fr']);
    expect(() => setDisplayLanguages(original, [])).toThrow();
    expect(() => setDisplayLanguages(original, ['de'])).toThrow();
  });

  it('adds, moves, and removes independently configured phases immutably', () => {
    const original = clonePlan();
    const recovery = {
      id: 'recovery', kind: 'active-recovery' as const, rounds: 1,
      restBetweenExercises: 0, restBetweenRounds: 0, restAfterPhase: 5,
      exercises: [{ ...structuredClone(original.phases[0]!.exercises[1]!), id: 'recovery-slot' }]
    };
    const added = addPlanPhase(original, recovery, 1);
    expect(added.phases.map(({ id }) => id)).toEqual(['training', 'recovery']);
    expect(original.phases).toHaveLength(1);
    expect(movePlanPhase(added, 'recovery', 0).phases.map(({ id }) => id)).toEqual(['recovery', 'training']);
    expect(removePlanPhase(added, 'recovery').phases).toStrictEqual(original.phases);
  });

  it('rejects invalid phase transformations and preserves the final training phase', () => {
    const plan = clonePlan();
    const phase = structuredClone(plan.phases[0]!);
    phase.id = 'other';
    phase.exercises = phase.exercises.map((exercise) => ({ ...exercise, id: `other-${exercise.id}` }));
    expect(() => addPlanPhase(plan, phase, -1)).toThrow(RangeError);
    expect(() => addPlanPhase(plan, phase, 2)).toThrow(RangeError);
    expect(() => movePlanPhase(plan, 'missing', 0)).toThrow(RangeError);
    expect(() => movePlanPhase(plan, 'training', 1)).toThrow(RangeError);
    expect(() => removePlanPhase(plan, 'missing')).toThrow();
    expect(() => removePlanPhase(plan, 'training')).toThrow();
  });

  it('targets exercises in a named non-first phase', () => {
    const plan = clonePlan();
    const second = structuredClone(plan.phases[0]!);
    second.id = 'second';
    second.exercises = second.exercises.map((exercise) => ({ ...exercise, id: `second-${exercise.id}` }));
    plan.phases.push(second);
    const addedExercise = { ...structuredClone(second.exercises[0]!), id: 'second-extra' };
    const added = addPlanExercise(plan, addedExercise, 2, 'second');
    expect(added.phases[1]!.exercises).toHaveLength(3);
    expect(movePlanExercise(added, 'second-extra', 0, 'second').phases[1]!.exercises[0]!.id).toBe('second-extra');
    expect(removePlanExercise(added, 'second-extra', 'second').phases[1]!.exercises).toHaveLength(2);
    expect(() => addPlanExercise(plan, addedExercise, 0, 'missing')).toThrow(/Phase not found/);
  });
});
