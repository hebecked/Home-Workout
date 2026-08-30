import { describe, expect, it } from 'vitest';
import {
  PlanValidationError,
  validateWorkoutPlan
} from '../../src/core/plan-schema';
import { clonePlan, makeMultilingualPlan } from '../fixtures/plans';

describe('validateWorkoutPlan', () => {
  it('accepts a generic BCP-47 multilingual plan without requiring German', () => {
    const plan = makeMultilingualPlan();

    expect(validateWorkoutPlan(plan)).toEqual(plan);
  });

  it('accepts one visible language and a region-specific language code', () => {
    const plan = clonePlan();
    plan.languages = [{ code: 'es-MX', label: 'Español (México)' }];
    plan.name = { 'es-MX': 'Entrenamiento en casa' };
    plan.displayLanguages = ['es-MX'];
    for (const exercise of plan.exercises) {
      exercise.translations = {
        'es-MX': { name: 'Ejercicio', instructions: 'Muévete con control.' }
      };
    }

    expect(validateWorkoutPlan(plan).displayLanguages).toEqual(['es-MX']);
  });

  it.each([
    ['unknown schema', (plan: ReturnType<typeof clonePlan>) => { plan.schemaVersion = 99; }],
    ['zero rounds', (plan: ReturnType<typeof clonePlan>) => { plan.rounds = 0; }],
    ['negative rest', (plan: ReturnType<typeof clonePlan>) => { plan.restBetweenExercises = -1; }],
    ['no exercises', (plan: ReturnType<typeof clonePlan>) => { plan.exercises = []; }],
    ['duplicate language', (plan: ReturnType<typeof clonePlan>) => { plan.languages.push({ code: 'fr', label: 'French' }); }],
    ['invalid language code', (plan: ReturnType<typeof clonePlan>) => { plan.languages[0]!.code = 'not_a_locale'; }],
    ['more than two visible languages', (plan: ReturnType<typeof clonePlan>) => {
      plan.languages.push({ code: 'es', label: 'Español' });
      plan.displayLanguages = ['fr', 'hi', 'es'];
    }],
    ['language without a plan name', (plan: ReturnType<typeof clonePlan>) => { delete plan.name.hi; }],
    ['unknown display language', (plan: ReturnType<typeof clonePlan>) => { plan.displayLanguages = ['fr', 'es']; }],
    ['invalid duration target', (plan: ReturnType<typeof clonePlan>) => {
      plan.exercises[1]!.target = { seconds: 0 };
    }],
    ['inverted repetition range', (plan: ReturnType<typeof clonePlan>) => {
      plan.exercises[0]!.target = { min: 12, max: 8, unit: 'repetitions' };
    }],
    ['missing exercise translation', (plan: ReturnType<typeof clonePlan>) => {
      delete plan.exercises[0]!.translations.hi;
    }],
    ['duplicate exercise slot id', (plan: ReturnType<typeof clonePlan>) => {
      plan.exercises[1]!.id = plan.exercises[0]!.id;
    }],
    ['markup in user-facing text', (plan: ReturnType<typeof clonePlan>) => {
      plan.exercises[0]!.translations.fr!.instructions = '<img src=x onerror=alert(1)>';
    }]
  ])('rejects %s with useful issue paths', (_label, mutate) => {
    const plan = clonePlan();
    mutate(plan);

    expect(() => validateWorkoutPlan(plan)).toThrow(PlanValidationError);
    try {
      validateWorkoutPlan(plan);
    } catch (error) {
      const validationError = error as PlanValidationError;
      expect(validationError.issues.length).toBeGreaterThan(0);
      expect(validationError.issues.every((issue) => issue.path.length > 0)).toBe(true);
      expect(validationError.message).not.toMatch(/undefined|null/);
    }
  });

  it('rejects non-object and unexpected keys instead of silently coercing them', () => {
    expect(() => validateWorkoutPlan(null)).toThrow(PlanValidationError);
    expect(() => validateWorkoutPlan({ ...clonePlan(), surprise: true })).toThrow(PlanValidationError);
    expect(() => validateWorkoutPlan({ ...clonePlan(), rounds: '2' })).toThrow(PlanValidationError);
  });
});
