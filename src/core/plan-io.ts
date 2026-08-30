import { PlanValidationError, validateWorkoutPlan, type WorkoutPlan } from './plan-schema';

export class PlanImportError extends Error {
  constructor(public readonly userMessage: string, options?: ErrorOptions) {
    super(userMessage, options);
    this.name = 'PlanImportError';
  }
}

export function importPlanJson(json: string): WorkoutPlan {
  try {
    const parsed: unknown = JSON.parse(json);
    if (parsed && typeof parsed === 'object' && Object.prototype.hasOwnProperty.call(parsed, '__proto__')) {
      throw new Error('Forbidden key');
    }
    return validateWorkoutPlan(parsed);
  } catch (error) {
    if (error instanceof PlanImportError) throw error;
    const detail = error instanceof PlanValidationError && error.issues[0] ? ` (${error.issues[0].path})` : '';
    throw new PlanImportError(`The workout plan is invalid${detail}. Please check the JSON file.`, { cause: error });
  }
}

export function exportPlanJson(plan: WorkoutPlan): string {
  validateWorkoutPlan(plan);
  return JSON.stringify(plan, null, 2);
}
