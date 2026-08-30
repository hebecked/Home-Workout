import { describe, expect, it } from 'vitest';
import {
  exportPlanJson,
  importPlanJson,
  PlanImportError
} from '../../src/core/plan-io';
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
});
