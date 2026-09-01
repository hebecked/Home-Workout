import { assertMachineTranslationsReviewed, PlanValidationError, validateWorkoutPlan, type WorkoutPlan } from './plan-schema';

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
    const plan = validateWorkoutPlan(parsed);
    assertMachineTranslationsReviewed(plan);
    return plan;
  } catch (error) {
    if (error instanceof PlanImportError) throw error;
    const detail = error instanceof PlanValidationError && error.issues[0] ? ` (${error.issues[0].path})` : '';
    throw new PlanImportError(`The workout plan is invalid${detail}. Please check the JSON file.`, { cause: error });
  }
}

export function exportPlanJson(plan: WorkoutPlan): string {
  validateWorkoutPlan(plan);
  assertMachineTranslationsReviewed(plan);
  return JSON.stringify(plan, null, 2);
}

const MAX_URL_PAYLOAD_LENGTH = 32_768;

export function encodePlanUrlPayload(plan: WorkoutPlan): string {
  const bytes = new TextEncoder().encode(exportPlanJson(plan));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function importPlanUrlPayload(payload: string): WorkoutPlan {
  try {
    if (!payload || payload.length > MAX_URL_PAYLOAD_LENGTH || !/^[A-Za-z0-9_-]+$/.test(payload)) {
      throw new Error('Invalid URL payload');
    }
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - payload.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return importPlanJson(new TextDecoder().decode(bytes));
  } catch (error) {
    if (error instanceof PlanImportError) throw error;
    throw new PlanImportError('The workout link is invalid. Ask the AI for a JSON config file instead.', { cause: error });
  }
}
