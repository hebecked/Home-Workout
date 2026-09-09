import { assertMachineTranslationsReviewed, migrateWorkoutPlan, validateWorkoutPlan, type AnyWorkoutPlan, type WorkoutPlan } from './plan-schema';
import type { WorkoutSession } from './workout-engine';

const PLANS_KEY = 'home-workout:plans';
const SESSION_KEY = 'home-workout:active-session';
const sessionKeysV1 = ['persistenceVersion', 'planId', 'phase', 'roundIndex', 'exerciseIndex', 'repetitions', 'workoutStartedAtMs', 'workoutPausedAtMs', 'workoutAccumulatedPausedMs', 'phaseTimer'];
const sessionKeysV2 = [...sessionKeysV1, 'phaseIndex'];
const timerKeys = ['durationMs', 'startedAtMs', 'pausedAtMs', 'accumulatedPausedMs'];
const hasExactKeys = (value: object, keys: string[]): boolean => {
  const actual = Object.keys(value);
  return actual.length === keys.length && actual.every((key) => keys.includes(key));
};
const validTimer = (value: unknown): boolean => {
  if (value === null) return true;
  if (!value || typeof value !== 'object' || !hasExactKeys(value, timerKeys)) return false;
  const timer = value as Record<string, unknown>;
  return typeof timer.durationMs === 'number' && typeof timer.startedAtMs === 'number' &&
    (timer.pausedAtMs === null || typeof timer.pausedAtMs === 'number') && typeof timer.accumulatedPausedMs === 'number';
};

export function loadPlans(storage: Storage): WorkoutPlan[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(PLANS_KEY) ?? '[]');
    if (!Array.isArray(value)) return [];
    return value.map(migrateWorkoutPlan);
  } catch { return []; }
}

const loadRawPlans = (storage: Storage): AnyWorkoutPlan[] => {
  try {
    const value: unknown = JSON.parse(storage.getItem(PLANS_KEY) ?? '[]');
    if (!Array.isArray(value)) return [];
    return value.map(validateWorkoutPlan);
  } catch { return []; }
};

export function savePlan(storage: Storage, plan: WorkoutPlan): void {
  validateWorkoutPlan(plan);
  assertMachineTranslationsReviewed(plan);
  const plans = loadRawPlans(storage);
  const index = plans.findIndex(({ id }) => id === plan.id);
  const next = structuredClone(plans);
  if (index < 0) next.push(structuredClone(plan)); else next[index] = structuredClone(plan);
  try { storage.setItem(PLANS_KEY, JSON.stringify(next)); }
  catch (error) { throw new Error('Unable to save plan to local storage (quota may be full).', { cause: error }); }
}

export function deletePlan(storage: Storage, planId: string): void {
  storage.setItem(PLANS_KEY, JSON.stringify(loadRawPlans(storage).filter(({ id }) => id !== planId)));
}

const isSession = (value: unknown): value is WorkoutSession => {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, sessionKeysV2)) return false;
  const session = value as Partial<WorkoutSession>;
  return session.persistenceVersion === 2 && typeof session.planId === 'string' &&
    Number.isInteger(session.phaseIndex) && (session.phaseIndex ?? -1) >= 0 &&
    Number.isInteger(session.roundIndex) && Number.isInteger(session.exerciseIndex) &&
    (session.repetitions === null || Number.isInteger(session.repetitions)) &&
    typeof session.workoutStartedAtMs === 'number' &&
    (session.workoutPausedAtMs === null || typeof session.workoutPausedAtMs === 'number') &&
    typeof session.workoutAccumulatedPausedMs === 'number' && validTimer(session.phaseTimer) &&
    ['exercise', 'exercise-rest', 'round-rest', 'phase-transition', 'completed'].includes(session.phase ?? '');
};

const migrateSessionV1 = (value: unknown): WorkoutSession | null => {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, sessionKeysV1)) return null;
  const session = value as Record<string, unknown>;
  if (session.persistenceVersion !== 1 || typeof session.planId !== 'string' ||
      !Number.isInteger(session.roundIndex) || !Number.isInteger(session.exerciseIndex) ||
      (session.repetitions !== null && !Number.isInteger(session.repetitions)) ||
      typeof session.workoutStartedAtMs !== 'number' ||
      (session.workoutPausedAtMs !== null && typeof session.workoutPausedAtMs !== 'number') ||
      typeof session.workoutAccumulatedPausedMs !== 'number' || !validTimer(session.phaseTimer) ||
      !['exercise', 'exercise-rest', 'round-rest', 'completed'].includes(String(session.phase))) return null;
  return { ...session, persistenceVersion: 2, phaseIndex: 0 } as WorkoutSession;
};

export function saveWorkoutSession(storage: Storage, session: WorkoutSession): void {
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadWorkoutSession(storage: Storage): WorkoutSession | null {
  try {
    const value: unknown = JSON.parse(storage.getItem(SESSION_KEY) ?? 'null');
    return isSession(value) ? value : migrateSessionV1(value);
  } catch { return null; }
}

export function clearWorkoutSession(storage: Storage): void {
  storage.removeItem(SESSION_KEY);
}
