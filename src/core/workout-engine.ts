import type { WorkoutPlan } from './plan-schema';
import { createTimer, getRemainingMs, isTimerComplete, pauseTimer, resumeTimer, type TimestampTimer } from './timer';

export type WorkoutPhase = 'exercise' | 'exercise-rest' | 'round-rest' | 'completed';
export type WorkoutAction =
  | { type: 'NEXT' }
  | { type: 'PREVIOUS' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'TICK' }
  | { type: 'SET_REPETITIONS'; value: number };

export interface WorkoutSession {
  persistenceVersion: 1;
  planId: string;
  phase: WorkoutPhase;
  roundIndex: number;
  exerciseIndex: number;
  repetitions: number | null;
  workoutStartedAtMs: number;
  workoutPausedAtMs: number | null;
  workoutAccumulatedPausedMs: number;
  phaseTimer: TimestampTimer | null;
}

export interface WorkoutSnapshot {
  phase: WorkoutPhase;
  roundIndex: number;
  exerciseIndex: number;
  repetitions: number | null;
  paused: boolean;
  elapsedWorkoutMs: number;
  remainingMs?: number;
}

const durationFor = (plan: WorkoutPlan, index: number): number | null => {
  const exercise = plan.exercises[index]!;
  return exercise.type === 'duration' && 'seconds' in exercise.target ? exercise.target.seconds * 1000 : null;
};

const startExercise = (session: WorkoutSession, plan: WorkoutPlan, round: number, exercise: number, atMs: number): WorkoutSession => {
  const duration = durationFor(plan, exercise);
  return { ...session, phase: 'exercise', roundIndex: round, exerciseIndex: exercise, repetitions: null, phaseTimer: duration === null ? null : createTimer(duration, atMs) };
};

const completeExercise = (session: WorkoutSession, plan: WorkoutPlan, atMs: number): WorkoutSession => {
  const lastExercise = session.exerciseIndex === plan.exercises.length - 1;
  const lastRound = session.roundIndex === plan.rounds - 1;
  if (!lastExercise) return { ...session, phase: 'exercise-rest', phaseTimer: createTimer(plan.restBetweenExercises * 1000 || 1, atMs), repetitions: null };
  if (lastRound) return { ...session, phase: 'completed', phaseTimer: null, repetitions: null };
  return { ...session, phase: 'round-rest', phaseTimer: createTimer(plan.restBetweenRounds * 1000 || 1, atMs), repetitions: null };
};

const timerCompletionAt = (timer: TimestampTimer): number => timer.startedAtMs + timer.accumulatedPausedMs + timer.durationMs;

function settle(initial: WorkoutSession, plan: WorkoutPlan, nowMs: number): WorkoutSession {
  let session = initial;
  if (session.workoutPausedAtMs !== null || session.phase === 'completed') return session;
  for (let guard = 0; guard < plan.exercises.length * plan.rounds * 3 + 3; guard += 1) {
    const timer = session.phaseTimer;
    if (!timer || !isTimerComplete(timer, nowMs)) break;
    const transitionAt = timerCompletionAt(timer);
    if (session.phase === 'exercise-rest') {
      session = startExercise(session, plan, session.roundIndex, session.exerciseIndex + 1, transitionAt);
    } else if (session.phase === 'round-rest') {
      session = startExercise(session, plan, session.roundIndex + 1, 0, transitionAt);
    } else if (session.phase === 'exercise') {
      session = completeExercise(session, plan, transitionAt);
    } else break;
    if (session.phase === 'exercise' && session.phaseTimer === null) break;
  }
  return session;
}

export function createWorkoutSession(plan: WorkoutPlan, nowMs: number): WorkoutSession {
  const base: WorkoutSession = {
    persistenceVersion: 1, planId: plan.id, phase: 'exercise', roundIndex: 0, exerciseIndex: 0,
    repetitions: null, workoutStartedAtMs: nowMs, workoutPausedAtMs: null,
    workoutAccumulatedPausedMs: 0, phaseTimer: null
  };
  return startExercise(base, plan, 0, 0, nowMs);
}

export function dispatchWorkout(input: WorkoutSession, plan: WorkoutPlan, action: WorkoutAction, nowMs: number): WorkoutSession {
  const session = settle(input, plan, nowMs);
  if (session.phase === 'completed') return session;
  if (action.type === 'PAUSE') {
    if (session.workoutPausedAtMs !== null) return session;
    return { ...session, workoutPausedAtMs: nowMs, phaseTimer: session.phaseTimer ? pauseTimer(session.phaseTimer, nowMs) : null };
  }
  if (action.type === 'RESUME') {
    if (session.workoutPausedAtMs === null) return session;
    return {
      ...session,
      workoutAccumulatedPausedMs: session.workoutAccumulatedPausedMs + Math.max(0, nowMs - session.workoutPausedAtMs),
      workoutPausedAtMs: null,
      phaseTimer: session.phaseTimer ? resumeTimer(session.phaseTimer, nowMs) : null
    };
  }
  if (session.workoutPausedAtMs !== null) return session;
  if (action.type === 'TICK') return settle(session, plan, nowMs);
  if (action.type === 'SET_REPETITIONS') {
    const exercise = plan.exercises[session.exerciseIndex]!;
    if (session.phase !== 'exercise' || exercise.type !== 'repetitions' || !Number.isInteger(action.value) || action.value < 0) throw new RangeError('Repetitions can only be set for repetition exercises.');
    return { ...session, repetitions: action.value };
  }
  if (action.type === 'PREVIOUS') {
    if (session.phase === 'exercise' && session.exerciseIndex === 0 && session.roundIndex === 0) return session;
    if (session.phase === 'exercise' && session.exerciseIndex > 0) return startExercise(session, plan, session.roundIndex, session.exerciseIndex - 1, nowMs);
    if (session.phase === 'exercise' && session.roundIndex > 0) return startExercise(session, plan, session.roundIndex - 1, plan.exercises.length - 1, nowMs);
    return startExercise(session, plan, session.roundIndex, session.exerciseIndex, nowMs);
  }
  if (action.type === 'NEXT') {
    if (session.phase !== 'exercise') return session;
    return completeExercise(session, plan, nowMs);
  }
  return session;
}

export function getWorkoutSnapshot(input: WorkoutSession, plan: WorkoutPlan, nowMs: number): WorkoutSnapshot {
  const session = settle(input, plan, nowMs);
  const effectiveNow = session.workoutPausedAtMs ?? nowMs;
  const elapsedWorkoutMs = Math.max(0, effectiveNow - session.workoutStartedAtMs - session.workoutAccumulatedPausedMs);
  const snapshot: WorkoutSnapshot = {
    phase: session.phase, roundIndex: session.roundIndex, exerciseIndex: session.exerciseIndex,
    repetitions: session.repetitions, paused: session.workoutPausedAtMs !== null, elapsedWorkoutMs
  };
  if (session.phaseTimer) snapshot.remainingMs = getRemainingMs(session.phaseTimer, nowMs);
  return snapshot;
}
