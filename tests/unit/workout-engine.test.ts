import { describe, expect, it } from 'vitest';
import {
  createWorkoutSession,
  dispatchWorkout,
  getWorkoutSnapshot
} from '../../src/core/workout-engine';
import { makeMultilingualPlan } from '../fixtures/plans';

describe('workout state machine', () => {
  it('moves through exercise rest, next exercise, round rest and completion', () => {
    const plan = makeMultilingualPlan();
    let session = createWorkoutSession(plan, 0);

    expect(getWorkoutSnapshot(session, plan, 0)).toMatchObject({
      phase: 'exercise', roundIndex: 0, exerciseIndex: 0
    });

    session = dispatchWorkout(session, plan, { type: 'NEXT' }, 5_000);
    expect(getWorkoutSnapshot(session, plan, 5_000)).toMatchObject({
      phase: 'exercise-rest', roundIndex: 0, exerciseIndex: 0, remainingMs: 20_000
    });

    session = dispatchWorkout(session, plan, { type: 'TICK' }, 25_000);
    expect(getWorkoutSnapshot(session, plan, 25_000)).toMatchObject({
      phase: 'exercise', roundIndex: 0, exerciseIndex: 1, remainingMs: 30_000
    });

    session = dispatchWorkout(session, plan, { type: 'TICK' }, 55_000);
    expect(getWorkoutSnapshot(session, plan, 55_000)).toMatchObject({
      phase: 'round-rest', roundIndex: 0, exerciseIndex: 1, remainingMs: 60_000
    });

    session = dispatchWorkout(session, plan, { type: 'TICK' }, 115_000);
    expect(getWorkoutSnapshot(session, plan, 115_000)).toMatchObject({
      phase: 'exercise', roundIndex: 1, exerciseIndex: 0
    });

    session = dispatchWorkout(session, plan, { type: 'NEXT' }, 116_000);
    session = dispatchWorkout(session, plan, { type: 'TICK' }, 136_000);
    session = dispatchWorkout(session, plan, { type: 'TICK' }, 166_000);
    expect(getWorkoutSnapshot(session, plan, 166_000)).toMatchObject({
      phase: 'completed', roundIndex: 1, exerciseIndex: 1
    });
  });

  it('does not auto-advance a repetition exercise and the optional counter is non-blocking', () => {
    const plan = makeMultilingualPlan();
    let session = createWorkoutSession(plan, 0);

    session = dispatchWorkout(session, plan, { type: 'TICK' }, 600_000);
    expect(getWorkoutSnapshot(session, plan, 600_000).phase).toBe('exercise');

    session = dispatchWorkout(session, plan, { type: 'SET_REPETITIONS', value: 9 }, 600_000);
    expect(getWorkoutSnapshot(session, plan, 600_000)).toMatchObject({
      phase: 'exercise', repetitions: 9
    });

    session = dispatchWorkout(session, plan, { type: 'NEXT' }, 600_001);
    expect(getWorkoutSnapshot(session, plan, 600_001).phase).toBe('exercise-rest');
  });

  it('pauses workout, duration exercise and rest clocks together', () => {
    const plan = makeMultilingualPlan();
    let session = createWorkoutSession(plan, 0);
    session = dispatchWorkout(session, plan, { type: 'NEXT' }, 1_000);
    session = dispatchWorkout(session, plan, { type: 'PAUSE' }, 6_000);

    const paused = getWorkoutSnapshot(session, plan, 106_000);
    expect(paused).toMatchObject({ phase: 'exercise-rest', paused: true, remainingMs: 15_000 });
    expect(paused.elapsedWorkoutMs).toBe(6_000);

    session = dispatchWorkout(session, plan, { type: 'RESUME' }, 106_000);
    session = dispatchWorkout(session, plan, { type: 'TICK' }, 121_000);
    expect(getWorkoutSnapshot(session, plan, 121_000)).toMatchObject({
      phase: 'exercise', exerciseIndex: 1, paused: false, remainingMs: 30_000
    });
  });

  it('uses timestamps to catch up after browser backgrounding across multiple phases', () => {
    const plan = makeMultilingualPlan();
    let session = createWorkoutSession(plan, 0);
    session = dispatchWorkout(session, plan, { type: 'NEXT' }, 1_000);

    // 20 s exercise rest + 30 s duration + 60 s round rest + 10 s into next round.
    session = dispatchWorkout(session, plan, { type: 'TICK' }, 121_000);
    expect(getWorkoutSnapshot(session, plan, 121_000)).toMatchObject({
      phase: 'exercise', roundIndex: 1, exerciseIndex: 0
    });
  });

  it('supports going back from exercise and rest without invalid indices', () => {
    const plan = makeMultilingualPlan();
    let session = createWorkoutSession(plan, 0);

    expect(dispatchWorkout(session, plan, { type: 'PREVIOUS' }, 10)).toStrictEqual(session);

    session = dispatchWorkout(session, plan, { type: 'NEXT' }, 1_000);
    session = dispatchWorkout(session, plan, { type: 'TICK' }, 21_000);
    session = dispatchWorkout(session, plan, { type: 'PREVIOUS' }, 22_000);
    expect(getWorkoutSnapshot(session, plan, 22_000)).toMatchObject({
      phase: 'exercise', roundIndex: 0, exerciseIndex: 0
    });
  });

  it('rejects counter changes outside repetition exercises and ignores actions after completion', () => {
    const plan = makeMultilingualPlan();
    let session = createWorkoutSession(plan, 0);
    expect(() => dispatchWorkout(session, plan, { type: 'SET_REPETITIONS', value: -1 }, 0)).toThrow();

    session = dispatchWorkout(session, plan, { type: 'NEXT' }, 0);
    session = dispatchWorkout(session, plan, { type: 'TICK' }, 20_000);
    expect(() => dispatchWorkout(session, plan, { type: 'SET_REPETITIONS', value: 8 }, 20_000)).toThrow();

    // Complete by explicitly progressing through the final repetition exercise.
    session = dispatchWorkout(session, plan, { type: 'TICK' }, 200_000);
    session = dispatchWorkout(session, plan, { type: 'NEXT' }, 200_001);
    session = dispatchWorkout(session, plan, { type: 'TICK' }, 220_001);
    const completed = dispatchWorkout(session, plan, { type: 'TICK' }, 250_001);
    expect(getWorkoutSnapshot(completed, plan, 250_001).phase).toBe('completed');
    expect(dispatchWorkout(completed, plan, { type: 'NEXT' }, 401_000)).toStrictEqual(completed);
  });
});
