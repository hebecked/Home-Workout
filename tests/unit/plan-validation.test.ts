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

  it('accepts reviewed or pending machine-translation provenance without requiring it on old plans', () => {
    const plan = clonePlan();
    plan.translationMetadata = {
      hi: {
        sourceLanguage: 'fr',
        origin: 'machine',
        reviewStatus: 'needs-review',
        provider: 'cloudflare-m2m100-1.2b',
        translatedAt: '2026-09-01T12:00:00.000Z'
      }
    };

    expect(validateWorkoutPlan(plan)).toStrictEqual(plan);
    plan.translationMetadata.hi!.reviewStatus = 'reviewed';
    expect(validateWorkoutPlan(plan)).toStrictEqual(plan);
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
    }],
    ['translation metadata for an unknown language', (plan: ReturnType<typeof clonePlan>) => {
      plan.translationMetadata = { es: { sourceLanguage: 'fr', origin: 'machine', reviewStatus: 'reviewed', provider: 'cloudflare', translatedAt: '2026-09-01T12:00:00.000Z' } };
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

  it.each([
    ['non-object language entries', 'languages.0', (plan: ReturnType<typeof clonePlan>) => {
      Reflect.set(plan, 'languages', [null]);
    }],
    ['unexpected language metadata', 'languages.0', (plan: ReturnType<typeof clonePlan>) => {
      Reflect.set(plan.languages[0]!, 'direction', 'ltr');
    }],
    ['unsafe language labels', 'languages.0.label', (plan: ReturnType<typeof clonePlan>) => {
      plan.languages[0]!.label = '<b>French</b>';
    }],
    ['unknown plan-name translations', 'name', (plan: ReturnType<typeof clonePlan>) => {
      plan.name.es = 'Plan';
    }],
    ['non-object exercise entries', 'exercises.0', (plan: ReturnType<typeof clonePlan>) => {
      Reflect.set(plan.exercises, 0, null);
    }],
    ['unexpected exercise fields', 'exercises.0', (plan: ReturnType<typeof clonePlan>) => {
      Reflect.set(plan.exercises[0]!, 'html', '<b>unsafe</b>');
    }],
    ['blank exercise slot ids', 'exercises.0.id', (plan: ReturnType<typeof clonePlan>) => {
      plan.exercises[0]!.id = ' ';
    }],
    ['blank library exercise ids', 'exercises.0.exerciseId', (plan: ReturnType<typeof clonePlan>) => {
      plan.exercises[0]!.exerciseId = '';
    }],
    ['unknown exercise types', 'exercises.0.type', (plan: ReturnType<typeof clonePlan>) => {
      Reflect.set(plan.exercises[0]!, 'type', 'distance');
    }],
    ['non-object targets', 'exercises.0.target', (plan: ReturnType<typeof clonePlan>) => {
      Reflect.set(plan.exercises[0]!, 'target', null);
    }],
    ['non-object translations', 'exercises.0.translations.fr', (plan: ReturnType<typeof clonePlan>) => {
      Reflect.set(plan.exercises[0]!, 'translations', null);
    }],
    ['unknown exercise-translation languages', 'exercises.0.translations', (plan: ReturnType<typeof clonePlan>) => {
      plan.exercises[0]!.translations.es = { name: 'Sentadilla', instructions: 'Baja.' };
    }],
    ['non-array alternative ids', 'exercises.0.alternativeExerciseIds', (plan: ReturnType<typeof clonePlan>) => {
      Reflect.set(plan.exercises[0]!, 'alternativeExerciseIds', 'wall-sit');
    }],
    ['unsafe alternative ids', 'exercises.0.alternativeExerciseIds', (plan: ReturnType<typeof clonePlan>) => {
      plan.exercises[0]!.alternativeExerciseIds = ['<script>'];
    }]
  ])('rejects structurally invalid nested data: %s', (_label, expectedPath, mutate) => {
    const plan = clonePlan();
    mutate(plan);

    try {
      validateWorkoutPlan(plan);
      throw new Error('Expected validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(PlanValidationError);
      expect((error as PlanValidationError).issues.map(({ path }) => path)).toContain(expectedPath);
    }
  });

  it('accepts inclusive numeric boundaries used by one-round and zero-rest plans', () => {
    const plan = clonePlan();
    plan.rounds = 1;
    plan.restBetweenExercises = 0;
    plan.restBetweenRounds = 0;
    plan.exercises[0]!.target = { min: 1, max: 1, unit: 'repetitions' };
    plan.exercises[1]!.target = { seconds: 1 };

    expect(validateWorkoutPlan(plan)).toStrictEqual(plan);
  });

  it.each([
    ['id', 'must be non-empty safe text', (plan: ReturnType<typeof clonePlan>) => { plan.id = ' '; }],
    ['languages.0.label', 'must be non-empty safe text', (plan: ReturnType<typeof clonePlan>) => {
      plan.languages[0]!.label = 'Français > French';
    }],
    ['name.fr', 'is required and must be safe text', (plan: ReturnType<typeof clonePlan>) => {
      plan.name.fr = ' ';
    }],
    ['exercises.0.target', 'requires a valid repetition range', (plan: ReturnType<typeof clonePlan>) => {
      plan.exercises[0]!.target = { min: 0, max: 1, unit: 'repetitions' };
    }],
    ['exercises.1.target', 'requires positive seconds', (plan: ReturnType<typeof clonePlan>) => {
      plan.exercises[1]!.target = { seconds: Number.POSITIVE_INFINITY };
    }],
    ['exercises.0.translations.fr', 'requires safe name and instructions', (plan: ReturnType<typeof clonePlan>) => {
      plan.exercises[0]!.translations.fr!.name = 'Squat < unsafe';
    }],
    ['exercises.0.alternativeExerciseIds', 'must be an array of exercise ids', (plan: ReturnType<typeof clonePlan>) => {
      plan.exercises[0]!.alternativeExerciseIds = [' '];
    }]
  ])('returns an exact actionable issue for the isolated %s boundary', (path, message, mutate) => {
    const plan = clonePlan();
    mutate(plan);

    try {
      validateWorkoutPlan(plan);
      throw new Error('Expected validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(PlanValidationError);
      const validationError = error as PlanValidationError;
      expect(validationError.name).toBe('PlanValidationError');
      expect(validationError.issues).toStrictEqual([{ path, message }]);
      expect(validationError.message).toBe(`Invalid workout plan: ${path}: ${message}`);
    }
  });

  it('reports the deterministic cascade caused by an invalid configured language code', () => {
    const plan = clonePlan();
    plan.languages[0]!.code = 'f';

    try {
      validateWorkoutPlan(plan);
      throw new Error('Expected validation to fail');
    } catch (error) {
      expect((error as PlanValidationError).issues).toStrictEqual([
        { path: 'languages.0.code', message: 'must be a BCP-47-like language code' },
        { path: 'name', message: 'contains an unknown language' },
        { path: 'displayLanguages', message: 'contains duplicate or unknown languages' },
        { path: 'exercises.0.translations', message: 'contains an unknown language' },
        { path: 'exercises.1.translations', message: 'contains an unknown language' }
      ]);
    }
  });
});
