import { describe, expect, it } from 'vitest';
import { migrateWorkoutPlan, PlanValidationError, validateWorkoutPlan } from '../../src/core/plan-schema';
import { clonePlan, makeV1Plan } from '../fixtures/plans';

describe('workout-plan schemas', () => {
  it('accepts strict schema v2 with ordered phase kinds and untimed exercises', () => {
    const plan = clonePlan();
    const technique = structuredClone(plan.phases[0]!.exercises[0]!);
    technique.id = 'technique';
    technique.type = 'untimed';
    technique.target = {};
    plan.phases = [
      { id: 'warm', kind: 'warm-up', rounds: 1, restBetweenExercises: 0, restBetweenRounds: 0, restAfterPhase: 10, exercises: [{ ...structuredClone(plan.phases[0]!.exercises[1]!), id: 'warm-slot' }] },
      plan.phases[0]!,
      { id: 'recovery', kind: 'active-recovery', rounds: 1, restBetweenExercises: 0, restBetweenRounds: 0, restAfterPhase: 10, exercises: [technique] },
      { id: 'cool', kind: 'cool-down', rounds: 1, restBetweenExercises: 0, restBetweenRounds: 0, restAfterPhase: 0, exercises: [{ ...structuredClone(plan.phases[0]!.exercises[1]!), id: 'cool-slot' }] }
    ];

    expect(validateWorkoutPlan(plan)).toStrictEqual(plan);
  });

  it('accepts schema v1 unchanged and migrates it without mutating the source', () => {
    const legacy = makeV1Plan();
    const snapshot = structuredClone(legacy);
    expect(validateWorkoutPlan(legacy)).toStrictEqual(legacy);
    expect(migrateWorkoutPlan(legacy)).toMatchObject({
      schemaVersion: 2,
      phases: [{
        id: 'training',
        kind: 'training',
        rounds: legacy.rounds,
        restBetweenExercises: legacy.restBetweenExercises,
        restBetweenRounds: legacy.restBetweenRounds,
        restAfterPhase: 0,
        exercises: legacy.exercises
      }]
    });
    expect(legacy).toStrictEqual(snapshot);
  });

  it.each([
    ['unknown version', (plan: Record<string, unknown>) => { plan.schemaVersion = 99; }, 'schemaVersion'],
    ['missing training phase', (plan: Record<string, unknown>) => { (plan.phases as Array<Record<string, unknown>>)[0]!.kind = 'warm-up'; }, 'phases'],
    ['zero rounds', (plan: Record<string, unknown>) => { (plan.phases as Array<Record<string, unknown>>)[0]!.rounds = 0; }, 'phases.0.rounds'],
    ['negative rest', (plan: Record<string, unknown>) => { (plan.phases as Array<Record<string, unknown>>)[0]!.restAfterPhase = -1; }, 'phases.0.restAfterPhase'],
    ['empty phase', (plan: Record<string, unknown>) => { (plan.phases as Array<Record<string, unknown>>)[0]!.exercises = []; }, 'phases.0.exercises'],
    ['unsafe name', (plan: Record<string, unknown>) => { (plan.name as Record<string, unknown>).fr = '<b>unsafe</b>'; }, 'name.fr'],
    ['unexpected field', (plan: Record<string, unknown>) => { plan.extra = true; }, '$']
  ])('rejects %s', (_label, mutate, path) => {
    const plan = clonePlan() as unknown as Record<string, unknown>;
    mutate(plan);
    try {
      validateWorkoutPlan(plan);
      throw new Error('Expected validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(PlanValidationError);
      expect((error as PlanValidationError).issues.some((issue) => issue.path === path)).toBe(true);
    }
  });

  it('requires duration or untimed exercises in active recovery', () => {
    const plan = clonePlan();
    plan.phases[0]!.kind = 'active-recovery';
    plan.phases.push({
      id: 'training-2', kind: 'training', rounds: 1,
      restBetweenExercises: 0, restBetweenRounds: 0, restAfterPhase: 0,
      exercises: [{ ...structuredClone(plan.phases[0]!.exercises[0]!), id: 'training-slot' }]
    });
    expect(() => validateWorkoutPlan(plan)).toThrow(/active recovery/i);
  });

  it('keeps rounds and repetitions distinct in the validated shape', () => {
    const plan = clonePlan();
    const phase = plan.phases[0]!;
    const movement = phase.exercises[0]!;
    expect(phase.rounds).toBe(2);
    expect(movement.type).toBe('repetitions');
    expect(movement.target).toStrictEqual({ min: 8, max: 12, unit: 'repetitions' });
  });

  it.each([
    ['non-object', () => null],
    ['array root', () => []],
    ['empty languages', () => { const p = clonePlan(); p.languages = []; return p; }],
    ['non-object language', () => { const p = clonePlan() as unknown as Record<string, unknown>; p.languages = [null]; return p; }],
    ['duplicate language', () => { const p = clonePlan(); p.languages.push(structuredClone(p.languages[0]!)); return p; }],
    ['invalid language code', () => { const p = clonePlan(); p.languages[0]!.code = 'x'; return p; }],
    ['unsafe language label', () => { const p = clonePlan(); p.languages[0]!.label = '<fr>'; return p; }],
    ['unknown plan-name language', () => { const p = clonePlan(); p.name.de = 'Plan'; return p; }],
    ['too many display languages', () => { const p = clonePlan(); p.displayLanguages = ['fr', 'hi', 'fr']; return p; }],
    ['unknown display language', () => { const p = clonePlan(); p.displayLanguages = ['de']; return p; }],
    ['non-object phase', () => { const p = clonePlan() as unknown as Record<string, unknown>; p.phases = [null]; return p; }],
    ['duplicate phase id', () => { const p = clonePlan(); const phase = structuredClone(p.phases[0]!); phase.exercises = phase.exercises.map((exercise) => ({ ...exercise, id: `duplicate-${exercise.id}` })); p.phases.push(phase); return p; }],
    ['unknown phase kind', () => { const p = clonePlan(); Reflect.set(p.phases[0]!, 'kind', 'break'); return p; }],
    ['warm-up after training', () => { const p = clonePlan(); p.phases.push({ ...structuredClone(p.phases[0]!), id: 'warm', kind: 'warm-up', exercises: p.phases[0]!.exercises.map((exercise) => ({ ...exercise, id: `warm-${exercise.id}` })) }); return p; }],
    ['cool-down before training', () => { const p = clonePlan(); p.phases[0]!.kind = 'cool-down'; return p; }],
    ['phase after cool-down', () => { const p = clonePlan(); const cool = { ...structuredClone(p.phases[0]!), id: 'cool', kind: 'cool-down' as const, exercises: p.phases[0]!.exercises.map((exercise) => ({ ...exercise, id: `cool-${exercise.id}` })) }; const after = { ...structuredClone(p.phases[0]!), id: 'after', exercises: p.phases[0]!.exercises.map((exercise) => ({ ...exercise, id: `after-${exercise.id}` })) }; p.phases.push(cool, after); return p; }],
    ['non-object exercise', () => { const p = clonePlan() as unknown as Record<string, unknown>; const phases = p.phases as Array<Record<string, unknown>>; phases[0]!.exercises = [null]; return p; }],
    ['duplicate exercise id', () => { const p = clonePlan(); p.phases[0]!.exercises[1]!.id = p.phases[0]!.exercises[0]!.id; return p; }],
    ['unsafe exercise id', () => { const p = clonePlan(); p.phases[0]!.exercises[0]!.exerciseId = '<bad>'; return p; }],
    ['unknown exercise type', () => { const p = clonePlan(); Reflect.set(p.phases[0]!.exercises[0]!, 'type', 'count'); return p; }],
    ['invalid duration target', () => { const p = clonePlan(); p.phases[0]!.exercises[1]!.target = { seconds: 0 }; return p; }],
    ['invalid repetition target', () => { const p = clonePlan(); p.phases[0]!.exercises[0]!.target = { min: 12, max: 8, unit: 'repetitions' }; return p; }],
    ['unknown translation language', () => { const p = clonePlan(); p.phases[0]!.exercises[0]!.translations.de = { name: 'X', instructions: 'Y' }; return p; }],
    ['invalid alternatives', () => { const p = clonePlan(); Reflect.set(p.phases[0]!.exercises[0]!, 'alternativeExerciseIds', [1]); return p; }],
    ['non-object target', () => { const p = clonePlan(); Reflect.set(p.phases[0]!.exercises[0]!, 'target', null); return p; }],
    ['missing translation', () => { const p = clonePlan(); delete p.phases[0]!.exercises[0]!.translations.fr; return p; }],
    ['invalid metadata object', () => { const p = clonePlan(); Reflect.set(p, 'translationMetadata', []); return p; }],
    ['invalid metadata entry', () => { const p = clonePlan(); Reflect.set(p, 'translationMetadata', { hi: null }); return p; }],
    ['metadata unknown language', () => { const p = clonePlan(); p.translationMetadata = { de: { sourceLanguage: 'fr', origin: 'machine', reviewStatus: 'reviewed', provider: 'x', translatedAt: '2026-09-01T00:00:00.000Z' } }; return p; }],
    ['metadata same source', () => { const p = clonePlan(); p.translationMetadata = { hi: { sourceLanguage: 'hi', origin: 'machine', reviewStatus: 'reviewed', provider: 'x', translatedAt: '2026-09-01T00:00:00.000Z' } }; return p; }],
    ['metadata unsafe provider', () => { const p = clonePlan(); p.translationMetadata = { hi: { sourceLanguage: 'fr', origin: 'machine', reviewStatus: 'reviewed', provider: '<x>', translatedAt: '2026-09-01T00:00:00.000Z' } }; return p; }],
    ['metadata invalid timestamp', () => { const p = clonePlan(); p.translationMetadata = { hi: { sourceLanguage: 'fr', origin: 'machine', reviewStatus: 'reviewed', provider: 'x', translatedAt: 'yesterday' } }; return p; }]
  ])('rejects malformed branch: %s', (_label, makeInput) => {
    expect(() => validateWorkoutPlan(makeInput())).toThrow(PlanValidationError);
  });
});
