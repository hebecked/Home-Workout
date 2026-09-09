import type { WorkoutPlan } from './plan-schema';
import { createTimer, getRemainingMs, isTimerComplete, pauseTimer, resumeTimer, type TimestampTimer } from './timer';

export type WorkoutPhase = 'exercise' | 'exercise-rest' | 'round-rest' | 'phase-transition' | 'completed';
export type WorkoutAction =
  | { type: 'NEXT' }
  | { type: 'PREVIOUS' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'TICK' }
  | { type: 'SET_REPETITIONS'; value: number };

export interface WorkoutSession {
  persistenceVersion: 2;
  planId: string;
  phase: WorkoutPhase;
  phaseIndex: number;
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
  phaseIndex: number;
  roundIndex: number;
  exerciseIndex: number;
  repetitions: number | null;
  paused: boolean;
  elapsedWorkoutMs: number;
  remainingMs?: number;
}

const durationFor = (plan: WorkoutPlan, phaseIndex: number, exerciseIndex: number): number | null => {
  const exercise = plan.phases[phaseIndex]!.exercises[exerciseIndex]!;
  return exercise.type === 'duration' && 'seconds' in exercise.target ? exercise.target.seconds * 1000 : null;
};

const startExercise = (
  session: WorkoutSession,
  plan: WorkoutPlan,
  phaseIndex: number,
  roundIndex: number,
  exerciseIndex: number,
  atMs: number
): WorkoutSession => {
  const exercise = plan.phases[phaseIndex]!.exercises[exerciseIndex]!;
  const duration = durationFor(plan, phaseIndex, exerciseIndex);
  return {
    ...session,
    phase: 'exercise',
    phaseIndex,
    roundIndex,
    exerciseIndex,
    repetitions: exercise.type === 'repetitions' ? 0 : null,
    phaseTimer: duration === null ? null : createTimer(duration, atMs)
  };
};

const timedPause = (seconds: number, atMs: number): TimestampTimer => createTimer(seconds * 1000 || 1, atMs);

const completeExercise = (session: WorkoutSession, plan: WorkoutPlan, atMs: number): WorkoutSession => {
  const block = plan.phases[session.phaseIndex]!;
  const lastExercise = session.exerciseIndex === block.exercises.length - 1;
  const lastRound = session.roundIndex === block.rounds - 1;
  const lastPhase = session.phaseIndex === plan.phases.length - 1;
  if (!lastExercise) return { ...session, phase: 'exercise-rest', phaseTimer: timedPause(block.restBetweenExercises, atMs), repetitions: null };
  if (!lastRound) return { ...session, phase: 'round-rest', phaseTimer: timedPause(block.restBetweenRounds, atMs), repetitions: null };
  if (lastPhase) return { ...session, phase: 'completed', phaseTimer: null, repetitions: null };
  return { ...session, phase: 'phase-transition', phaseTimer: timedPause(block.restAfterPhase, atMs), repetitions: null };
};

const timerCompletionAt = (timer: TimestampTimer): number => timer.startedAtMs + timer.accumulatedPausedMs + timer.durationMs;
const transitionBudget = (plan: WorkoutPlan): number =>
  plan.phases.reduce((total, phase) => total + phase.exercises.length * phase.rounds * 3 + 1, 3);

function settle(initial: WorkoutSession, plan: WorkoutPlan, nowMs: number): WorkoutSession {
  let session = initial;
  if (session.workoutPausedAtMs !== null || session.phase === 'completed') return session;
  for (let guard = 0; guard < transitionBudget(plan); guard += 1) {
    const timer = session.phaseTimer;
    if (!timer || !isTimerComplete(timer, nowMs)) break;
    const transitionAt = timerCompletionAt(timer);
    if (session.phase === 'exercise-rest') {
      session = startExercise(session, plan, session.phaseIndex, session.roundIndex, session.exerciseIndex + 1, transitionAt);
    } else if (session.phase === 'round-rest') {
      session = startExercise(session, plan, session.phaseIndex, session.roundIndex + 1, 0, transitionAt);
    } else if (session.phase === 'phase-transition') {
      session = startExercise(session, plan, session.phaseIndex + 1, 0, 0, transitionAt);
    } else if (session.phase === 'exercise') {
      session = completeExercise(session, plan, transitionAt);
    } else break;
    if (session.phase === 'exercise' && session.phaseTimer === null) break;
  }
  return session;
}

export function createWorkoutSession(plan: WorkoutPlan, nowMs: number): WorkoutSession {
  const base: WorkoutSession = {
    persistenceVersion: 2,
    planId: plan.id,
    phase: 'exercise',
    phaseIndex: 0,
    roundIndex: 0,
    exerciseIndex: 0,
    repetitions: null,
    workoutStartedAtMs: nowMs,
    workoutPausedAtMs: null,
    workoutAccumulatedPausedMs: 0,
    phaseTimer: null
  };
  return startExercise(base, plan, 0, 0, 0, nowMs);
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
    const exercise = plan.phases[session.phaseIndex]!.exercises[session.exerciseIndex]!;
    if (session.phase !== 'exercise' || exercise.type !== 'repetitions' || !Number.isInteger(action.value) || action.value < 0) throw new RangeError('Repetitions can only be set for repetition exercises.');
    return { ...session, repetitions: action.value };
  }
  if (action.type === 'PREVIOUS') {
    const block = plan.phases[session.phaseIndex]!;
    if (session.phase === 'phase-transition') return startExercise(session, plan, session.phaseIndex, block.rounds - 1, block.exercises.length - 1, nowMs);
    if (session.phase !== 'exercise') return startExercise(session, plan, session.phaseIndex, session.roundIndex, session.exerciseIndex, nowMs);
    if (session.exerciseIndex > 0) return startExercise(session, plan, session.phaseIndex, session.roundIndex, session.exerciseIndex - 1, nowMs);
    if (session.roundIndex > 0) return startExercise(session, plan, session.phaseIndex, session.roundIndex - 1, block.exercises.length - 1, nowMs);
    if (session.phaseIndex > 0) {
      const previous = plan.phases[session.phaseIndex - 1]!;
      return startExercise(session, plan, session.phaseIndex - 1, previous.rounds - 1, previous.exercises.length - 1, nowMs);
    }
    return session;
  }
  if (action.type === 'NEXT') {
    if (session.phase === 'exercise') return completeExercise(session, plan, nowMs);
    if (session.phase === 'exercise-rest') return startExercise(session, plan, session.phaseIndex, session.roundIndex, session.exerciseIndex + 1, nowMs);
    if (session.phase === 'round-rest') return startExercise(session, plan, session.phaseIndex, session.roundIndex + 1, 0, nowMs);
    if (session.phase === 'phase-transition') return startExercise(session, plan, session.phaseIndex + 1, 0, 0, nowMs);
  }
  return session;
}

export function getWorkoutSnapshot(input: WorkoutSession, plan: WorkoutPlan, nowMs: number): WorkoutSnapshot {
  const session = settle(input, plan, nowMs);
  const effectiveNow = session.workoutPausedAtMs ?? nowMs;
  const snapshot: WorkoutSnapshot = {
    phase: session.phase,
    phaseIndex: session.phaseIndex,
    roundIndex: session.roundIndex,
    exerciseIndex: session.exerciseIndex,
    repetitions: session.repetitions,
    paused: session.workoutPausedAtMs !== null,
    elapsedWorkoutMs: Math.max(0, effectiveNow - session.workoutStartedAtMs - session.workoutAccumulatedPausedMs)
  };
  if (session.phaseTimer) snapshot.remainingMs = getRemainingMs(session.phaseTimer, nowMs);
  return snapshot;
}
