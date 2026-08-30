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
import { makeMultilingualPlan } from '../fixtures/plans';

class MemoryStorage implements Storage {
  readonly #values = new Map<string, string>();
  get length(): number { return this.#values.size; }
  clear(): void { this.#values.clear(); }
  getItem(key: string): string | null { return this.#values.get(key) ?? null; }
  key(index: number): string | null { return [...this.#values.keys()][index] ?? null; }
  removeItem(key: string): void { this.#values.delete(key); }
  setItem(key: string, value: string): void { this.#values.set(key, value); }
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
    savePlan(storage, { ...first, rounds: 4 });

    expect(loadPlans(storage)).toStrictEqual([
      { ...first, rounds: 4 },
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

  it('surfaces quota errors rather than claiming a save succeeded', () => {
    const failingStorage = new MemoryStorage();
    failingStorage.setItem = () => { throw new DOMException('quota', 'QuotaExceededError'); };

    expect(() => savePlan(failingStorage, makeMultilingualPlan())).toThrow(/quota|save|storage/i);
  });
});
