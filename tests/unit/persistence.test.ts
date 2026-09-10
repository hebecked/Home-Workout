import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearWorkoutSession,
  deletePlan,
  loadPlans,
  loadWorkoutSession,
  savePlan,
  saveWorkoutSession
} from '../../src/core/persistence';
import { createWorkoutSession, dispatchWorkout, getWorkoutSnapshot } from '../../src/core/workout-engine';
import { makeMultilingualPlan, makeV1Plan } from '../fixtures/plans';

class MemoryStorage implements Storage {
  readonly #values = new Map<string, string>();
  get length(): number { return this.#values.size; }
  clear(): void { this.#values.clear(); }
  getItem(key: string): string | null { return this.#values.get(key) ?? null; }
  key(index: number): string | null { return [...this.#values.keys()][index] ?? null; }
  removeItem(key: string): void { this.#values.delete(key); }
  setItem(key: string, value: string): void { this.#values.set(key, value); }
}

class RecordingStorage extends MemoryStorage {
  readonly gets: string[] = [];
  readonly sets: string[] = [];
  readonly removes: string[] = [];
  override getItem(key: string): string | null { this.gets.push(key); return super.getItem(key); }
  override removeItem(key: string): void { this.removes.push(key); super.removeItem(key); }
  override setItem(key: string, value: string): void { this.sets.push(key); super.setItem(key, value); }
}

describe('local persistence', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('saves and replaces plans by stable id without changing other plans', () => {
    const first = makeMultilingualPlan();
    const second = structuredClone(first);
    second.id = 'second-plan';
    second.name.fr = 'Deuxième plan';

    savePlan(storage, first);
    savePlan(storage, second);
    const changed = structuredClone(first);
    changed.phases[0]!.rounds = 4;
    savePlan(storage, changed);

    expect(loadPlans(storage)).toStrictEqual([
      changed,
      second
    ]);
  });

  it('deletes only the requested plan', () => {
    const first = makeMultilingualPlan();
    const second = { ...structuredClone(first), id: 'second-plan' };
    savePlan(storage, first);
    savePlan(storage, second);

    deletePlan(storage, first.id);
    expect(loadPlans(storage)).toStrictEqual([second]);
  });

  it('persists enough timestamp state to resume after a reload/background interval', () => {
    const plan = makeMultilingualPlan();
    let session = createWorkoutSession(plan, 10_000);
    session = dispatchWorkout(session, plan, { type: 'NEXT' }, 15_000);
    saveWorkoutSession(storage, session);

    const restored = loadWorkoutSession(storage);
    expect(restored).not.toBeNull();
    expect(getWorkoutSnapshot(restored!, plan, 45_000)).toMatchObject({
      phase: 'exercise', exerciseIndex: 1, remainingMs: 20_000
    });
  });

  it('loads stored v1 plans as v2 without silently overwriting the stored JSON', () => {
    const legacy = makeV1Plan();
    const raw = JSON.stringify([legacy]);
    storage.setItem('home-workout:plans', raw);
    const [loaded] = loadPlans(storage);
    expect(loaded).toMatchObject({ schemaVersion: 2, phases: [{ rounds: legacy.rounds, exercises: legacy.exercises }] });
    expect(storage.getItem('home-workout:plans')).toBe(raw);
  });

  it('does not replace or rewrite a stored plan whose id matches a bundled routine', () => {
    const storedPlan = makeMultilingualPlan();
    storedPlan.id = 'gentle-start';
    storedPlan.name.fr = 'Mon programme conservé';
    const raw = JSON.stringify([storedPlan]);
    storage.setItem('home-workout:plans', raw);

    expect(loadPlans(storage)).toStrictEqual([storedPlan]);
    expect(storage.getItem('home-workout:plans')).toBe(raw);
  });

  it('loads legacy session persistence into phase zero without rewriting storage', () => {
    const legacy = {
      persistenceVersion: 1, planId: 'plan-fr-hi', phase: 'exercise', roundIndex: 1, exerciseIndex: 0,
      repetitions: 3, workoutStartedAtMs: 100, workoutPausedAtMs: null,
      workoutAccumulatedPausedMs: 0, phaseTimer: null
    };
    storage.setItem('home-workout:active-session', JSON.stringify(legacy));
    expect(loadWorkoutSession(storage)).toMatchObject({ persistenceVersion: 2, phaseIndex: 0, roundIndex: 1, repetitions: 3 });
    expect(storage.getItem('home-workout:active-session')).toBe(JSON.stringify(legacy));
  });

  it('restores a paused session without counting time spent away', () => {
    const plan = makeMultilingualPlan();
    let session = createWorkoutSession(plan, 0);
    session = dispatchWorkout(session, plan, { type: 'PAUSE' }, 4_000);
    saveWorkoutSession(storage, session);

    const restored = loadWorkoutSession(storage)!;
    expect(getWorkoutSnapshot(restored, plan, 500_000)).toMatchObject({
      paused: true,
      elapsedWorkoutMs: 4_000
    });
  });

  it('clears a saved workout when the user chooses start over', () => {
    const plan = makeMultilingualPlan();
    saveWorkoutSession(storage, createWorkoutSession(plan, 0));

    clearWorkoutSession(storage);
    expect(loadWorkoutSession(storage)).toBeNull();
  });

  it('returns safe empty values for corrupt or wrong-version storage data', () => {
    storage.setItem('home-workout:plans', 'not-json');
    storage.setItem('home-workout:active-session', JSON.stringify({ persistenceVersion: 999 }));

    expect(loadPlans(storage)).toStrictEqual([]);
    expect(loadWorkoutSession(storage)).toBeNull();
  });

  it('rejects valid JSON with the wrong top-level shape for saved plans', () => {
    storage.setItem('home-workout:plans', JSON.stringify({ plan: makeMultilingualPlan() }));

    expect(loadPlans(storage)).toStrictEqual([]);
  });

  it('rejects malformed session JSON and incomplete session objects', () => {
    storage.setItem('home-workout:active-session', '{broken');
    expect(loadWorkoutSession(storage)).toBeNull();

    storage.setItem('home-workout:active-session', JSON.stringify({
      persistenceVersion: 1,
      planId: 'plan-fr-hi',
      roundIndex: 0,
      exerciseIndex: 0,
      workoutStartedAtMs: 0
    }));
    expect(loadWorkoutSession(storage)).toBeNull();
  });

  it('surfaces quota errors rather than claiming a save succeeded', () => {
    const failingStorage = new MemoryStorage();
    const quotaError = new DOMException('quota', 'QuotaExceededError');
    failingStorage.setItem = () => { throw quotaError; };

    try {
      savePlan(failingStorage, makeMultilingualPlan());
      throw new Error('Expected save to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Unable to save plan to local storage (quota may be full).');
      expect((error as Error).cause).toBe(quotaError);
    }
  });

  it.each(['not-json', JSON.stringify({ plan: true })])('recovers from invalid raw plan storage when explicitly saving (%s)', (raw) => {
    storage.setItem('home-workout:plans', raw);
    const plan = makeMultilingualPlan();
    savePlan(storage, plan);
    expect(JSON.parse(storage.getItem('home-workout:plans') ?? '[]')).toStrictEqual([plan]);
  });

  it('rejects a legacy session with an unsupported runtime phase', () => {
    const legacy = {
      persistenceVersion: 1, planId: 'plan-fr-hi', phase: 'phase-transition', roundIndex: 0, exerciseIndex: 0,
      repetitions: null, workoutStartedAtMs: 0, workoutPausedAtMs: null,
      workoutAccumulatedPausedMs: 0, phaseTimer: null
    };
    storage.setItem('home-workout:active-session', JSON.stringify(legacy));
    expect(loadWorkoutSession(storage)).toBeNull();
  });

  it('uses separate stable storage keys for plans and active sessions', () => {
    const recording = new RecordingStorage();
    const plan = makeMultilingualPlan();
    const session = createWorkoutSession(plan, 0);

    savePlan(recording, plan);
    saveWorkoutSession(recording, session);
    loadPlans(recording);
    loadWorkoutSession(recording);
    clearWorkoutSession(recording);

    expect(recording.sets).toEqual([
      'home-workout:plans',
      'home-workout:active-session'
    ]);
    expect(recording.gets).toEqual([
      'home-workout:plans',
      'home-workout:plans',
      'home-workout:active-session'
    ]);
    expect(recording.removes).toEqual(['home-workout:active-session']);
  });

  it.each([
    ['persistenceVersion', 999],
    ['planId', 42],
    ['phaseIndex', -1],
    ['roundIndex', '0'],
    ['exerciseIndex', '0'],
    ['workoutStartedAtMs', '0'],
    ['phase', 'unknown']
  ])('rejects a persisted session with invalid %s', (key, invalidValue) => {
    const session = createWorkoutSession(makeMultilingualPlan(), 0);
    Reflect.set(session, key, invalidValue);
    storage.setItem('home-workout:active-session', JSON.stringify(session));

    expect(loadWorkoutSession(storage)).toBeNull();
  });

  it.each([
    'repetitions',
    'workoutPausedAtMs',
    'workoutAccumulatedPausedMs',
    'phaseTimer'
  ])('rejects a persisted session missing required runtime field %s', (key) => {
    const session = createWorkoutSession(makeMultilingualPlan(), 0);
    Reflect.deleteProperty(session, key);
    storage.setItem('home-workout:active-session', JSON.stringify(session));

    expect(loadWorkoutSession(storage)).toBeNull();
  });

  it('rejects unknown persisted-session fields to keep the versioned shape exact', () => {
    const session = createWorkoutSession(makeMultilingualPlan(), 0);
    Reflect.set(session, 'unversionedField', true);
    storage.setItem('home-workout:active-session', JSON.stringify(session));

    expect(loadWorkoutSession(storage)).toBeNull();
  });
});
