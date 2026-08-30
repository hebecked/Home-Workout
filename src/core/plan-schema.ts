export type LanguageDefinition = { code: string; label: string };
export type Translation = { name: string; instructions: string };
export type RepetitionTarget = { min: number; max: number; unit: 'repetitions' | 'per-side' };
export type DurationTarget = { seconds: number };
export type ExerciseTarget = RepetitionTarget | DurationTarget;

export interface PlanExercise {
  id: string;
  exerciseId: string;
  type: 'repetitions' | 'duration';
  target: ExerciseTarget;
  translations: Record<string, Translation>;
  alternativeExerciseIds: string[];
}

export interface WorkoutPlan {
  schemaVersion: number;
  id: string;
  languages: LanguageDefinition[];
  name: Record<string, string>;
  displayLanguages: string[];
  rounds: number;
  restBetweenExercises: number;
  restBetweenRounds: number;
  exercises: PlanExercise[];
}

export interface ValidationIssue { path: string; message: string }

export class PlanValidationError extends Error {
  constructor(public readonly issues: ValidationIssue[]) {
    super(`Invalid workout plan: ${issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ')}`);
    this.name = 'PlanValidationError';
  }
}

const languagePattern = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
const safeText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0 && !/[<>]/.test(value);
const exactKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean =>
  Object.keys(value).every((key) => keys.includes(key));

export function validateWorkoutPlan(input: unknown): WorkoutPlan {
  const issues: ValidationIssue[] = [];
  const issue = (path: string, message: string): void => { issues.push({ path, message }); };
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new PlanValidationError([{ path: '$', message: 'must be an object' }]);
  const plan = input as Record<string, unknown>;
  const keys = ['schemaVersion', 'id', 'languages', 'name', 'displayLanguages', 'rounds', 'restBetweenExercises', 'restBetweenRounds', 'exercises'];
  if (!exactKeys(plan, keys) || Object.keys(plan).length !== keys.length) issue('$', 'contains missing or unexpected fields');
  if (plan.schemaVersion !== 1) issue('schemaVersion', 'must equal 1');
  if (!safeText(plan.id)) issue('id', 'must be non-empty safe text');
  if (!Number.isInteger(plan.rounds) || (plan.rounds as number) < 1) issue('rounds', 'must be a positive integer');
  for (const key of ['restBetweenExercises', 'restBetweenRounds'] as const) {
    if (!Number.isFinite(plan[key]) || (plan[key] as number) < 0) issue(key, 'must be a non-negative number');
  }

  const languages = Array.isArray(plan.languages) ? plan.languages : [];
  if (languages.length === 0) issue('languages', 'requires at least one language');
  const languageCodes = new Set<string>();
  languages.forEach((entry, index) => {
    const path = `languages.${index}`;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) { issue(path, 'must be an object'); return; }
    const language = entry as Record<string, unknown>;
    if (!exactKeys(language, ['code', 'label']) || Object.keys(language).length !== 2) issue(path, 'contains unexpected fields');
    if (typeof language.code !== 'string' || !languagePattern.test(language.code)) issue(`${path}.code`, 'must be a BCP-47-like language code');
    else if (languageCodes.has(language.code)) issue(`${path}.code`, 'must be unique');
    else languageCodes.add(language.code);
    if (!safeText(language.label)) issue(`${path}.label`, 'must be non-empty safe text');
  });

  const names = plan.name && typeof plan.name === 'object' && !Array.isArray(plan.name) ? plan.name as Record<string, unknown> : {};
  for (const code of languageCodes) if (!safeText(names[code])) issue(`name.${code}`, 'is required and must be safe text');
  if (Object.keys(names).some((code) => !languageCodes.has(code))) issue('name', 'contains an unknown language');

  const display = Array.isArray(plan.displayLanguages) ? plan.displayLanguages : [];
  if (display.length < 1 || display.length > 2) issue('displayLanguages', 'must contain one or two languages');
  if (new Set(display).size !== display.length || display.some((code) => typeof code !== 'string' || !languageCodes.has(code))) issue('displayLanguages', 'contains duplicate or unknown languages');

  const exercises = Array.isArray(plan.exercises) ? plan.exercises : [];
  if (exercises.length === 0) issue('exercises', 'requires at least one exercise');
  const slotIds = new Set<string>();
  exercises.forEach((entry, index) => {
    const path = `exercises.${index}`;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) { issue(path, 'must be an object'); return; }
    const exercise = entry as Record<string, unknown>;
    const exerciseKeys = ['id', 'exerciseId', 'type', 'target', 'translations', 'alternativeExerciseIds'];
    if (!exactKeys(exercise, exerciseKeys) || Object.keys(exercise).length !== exerciseKeys.length) issue(path, 'contains missing or unexpected fields');
    if (!safeText(exercise.id)) issue(`${path}.id`, 'must be non-empty safe text');
    else if (slotIds.has(exercise.id)) issue(`${path}.id`, 'must be unique'); else slotIds.add(exercise.id);
    if (!safeText(exercise.exerciseId)) issue(`${path}.exerciseId`, 'must be non-empty safe text');
    if (exercise.type !== 'repetitions' && exercise.type !== 'duration') issue(`${path}.type`, 'must be repetitions or duration');
    const target = exercise.target && typeof exercise.target === 'object' && !Array.isArray(exercise.target) ? exercise.target as Record<string, unknown> : {};
    if (exercise.type === 'duration') {
      if (!exactKeys(target, ['seconds']) || !Number.isFinite(target.seconds) || (target.seconds as number) <= 0) issue(`${path}.target`, 'requires positive seconds');
    } else if (exercise.type === 'repetitions') {
      const validUnit = target.unit === 'repetitions' || target.unit === 'per-side';
      if (!exactKeys(target, ['min', 'max', 'unit']) || !Number.isFinite(target.min) || !Number.isFinite(target.max) || (target.min as number) <= 0 || (target.max as number) < (target.min as number) || !validUnit) issue(`${path}.target`, 'requires a valid repetition range');
    }
    const translations = exercise.translations && typeof exercise.translations === 'object' && !Array.isArray(exercise.translations) ? exercise.translations as Record<string, unknown> : {};
    for (const code of languageCodes) {
      const translation = translations[code];
      if (!translation || typeof translation !== 'object' || Array.isArray(translation)) { issue(`${path}.translations.${code}`, 'is required'); continue; }
      const copy = translation as Record<string, unknown>;
      if (!exactKeys(copy, ['name', 'instructions']) || !safeText(copy.name) || !safeText(copy.instructions)) issue(`${path}.translations.${code}`, 'requires safe name and instructions');
    }
    if (Object.keys(translations).some((code) => !languageCodes.has(code))) issue(`${path}.translations`, 'contains an unknown language');
    if (!Array.isArray(exercise.alternativeExerciseIds) || exercise.alternativeExerciseIds.some((id) => !safeText(id))) issue(`${path}.alternativeExerciseIds`, 'must be an array of exercise ids');
  });

  if (issues.length) throw new PlanValidationError(issues);
  return input as WorkoutPlan;
}
