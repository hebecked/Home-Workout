import { describe, expect, it } from 'vitest';
import {
  exportPlanJson,
  importPlanJson,
  PlanImportError
} from '../../src/core/plan-io';
import { PlanValidationError } from '../../src/core/plan-schema';
import { clonePlan, makeMultilingualPlan } from '../fixtures/plans';

describe('plan JSON import and export', () => {
  it('round-trips every supported field losslessly', () => {
    const original = makeMultilingualPlan();

    const exported = exportPlanJson(original);
    const imported = importPlanJson(exported);

    expect(imported).toStrictEqual(original);
    expect(JSON.parse(exported)).toStrictEqual(original);
  });

  it('produces deterministic, portable JSON', () => {
    const plan = makeMultilingualPlan();
    expect(exportPlanJson(plan)).toBe(exportPlanJson(structuredClone(plan)));
    expect(exportPlanJson(plan)).not.toContain('undefined');
  });

  it.each([
    ['malformed JSON', '{ definitely not json'],
    ['JSON primitive', '42'],
    ['valid JSON with invalid plan data', JSON.stringify({ schemaVersion: 1 })],
    ['prototype-shaped unexpected input', '{"schemaVersion":1,"__proto__":{"polluted":true}}']
  ])('reports %s as a safe, user-presentable import error', (_label, input) => {
    expect(() => importPlanJson(input)).toThrow(PlanImportError);
    try {
      importPlanJson(input);
    } catch (error) {
      const importError = error as PlanImportError;
      expect(importError.userMessage).toEqual(expect.any(String));
      expect(importError.userMessage.length).toBeGreaterThan(4);
      expect(importError.userMessage).not.toContain(input);
    }
  });

  it('validates before export and does not mutate its input', () => {
    const plan = clonePlan();
    const snapshot = structuredClone(plan);
    plan.rounds = 0;

    expect(() => exportPlanJson(plan)).toThrow();
    plan.rounds = snapshot.rounds;
    exportPlanJson(plan);
    expect(plan).toStrictEqual(snapshot);
  });

  it('uses a stable safe error contract and preserves the diagnostic cause', () => {
    const invalid = clonePlan();
    invalid.rounds = 0;

    try {
      importPlanJson(JSON.stringify(invalid));
      throw new Error('Expected import to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(PlanImportError);
      const importError = error as PlanImportError;
      expect(importError.name).toBe('PlanImportError');
      expect(importError.userMessage).toBe(
        'The workout plan is invalid (rounds). Please check the JSON file.'
      );
      expect(importError.message).toBe(importError.userMessage);
      expect(importError.cause).toBeInstanceOf(PlanValidationError);
      expect((importError.cause as PlanValidationError).issues[0]).toStrictEqual({
        path: 'rounds',
        message: 'must be a positive integer'
      });
    }
  });

  it('keeps malformed input out of both the user message and diagnostic message', () => {
    const input = '{"private":"do-not-echo"';

    try {
      importPlanJson(input);
      throw new Error('Expected import to fail');
    } catch (error) {
      const importError = error as PlanImportError;
      expect(importError.userMessage).toBe(
        'The workout plan is invalid. Please check the JSON file.'
      );
      expect(importError.userMessage).not.toContain('do-not-echo');
      expect(importError.message).not.toContain('do-not-echo');
      expect(importError.cause).toBeInstanceOf(SyntaxError);
    }
  });

  it('rejects a forbidden own __proto__ key even when the surrounding plan is valid', () => {
    const planJson = exportPlanJson(makeMultilingualPlan());
    const input = `${planJson.slice(0, -1)},"__proto__":{"polluted":true}}`;

    try {
      importPlanJson(input);
      throw new Error('Expected import to fail');
    } catch (error) {
      const importError = error as PlanImportError;
      expect(importError).toBeInstanceOf(PlanImportError);
      expect(importError.userMessage).toBe(
        'The workout plan is invalid. Please check the JSON file.'
      );
      expect(importError.userMessage).not.toContain('__proto__');
      expect(importError.cause).toBeInstanceOf(Error);
      expect((importError.cause as Error).message).toBe('Forbidden key');
      expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
    }
  });
});
