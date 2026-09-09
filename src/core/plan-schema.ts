export type LanguageDefinition = { code: string; label: string };
export type Translation = { name: string; instructions: string };
export type TranslationMetadata = {
  sourceLanguage: string; origin: 'machine'; reviewStatus: 'needs-review' | 'reviewed';
  provider: string; translatedAt: string;
};
export type RepetitionTarget = { min: number; max: number; unit: 'repetitions' | 'per-side' };
export type DurationTarget = { seconds: number };
export type UntimedTarget = Record<string, never>;
export type ExerciseTarget = RepetitionTarget | DurationTarget | UntimedTarget;

export interface PlanExercise {
  id: string;
  exerciseId: string;
  type: 'repetitions' | 'duration' | 'untimed';
  target: ExerciseTarget;
  translations: Record<string, Translation>;
  alternativeExerciseIds: string[];
}

interface WorkoutPlanBase {
  id: string;
  languages: LanguageDefinition[];
  name: Record<string, string>;
  displayLanguages: string[];
  translationMetadata?: Record<string, TranslationMetadata>;
}

export interface WorkoutPlanV1 extends WorkoutPlanBase {
  schemaVersion: 1;
  rounds: number;
  restBetweenExercises: number;
  restBetweenRounds: number;
  exercises: PlanExercise[];
}

export type WorkoutPhaseKind = 'warm-up' | 'training' | 'active-recovery' | 'cool-down';

export interface WorkoutPlanPhase {
  id: string;
  kind: WorkoutPhaseKind;
  rounds: number;
  restBetweenExercises: number;
  restBetweenRounds: number;
  restAfterPhase: number;
  exercises: PlanExercise[];
}

export interface WorkoutPlan extends WorkoutPlanBase {
  schemaVersion: 2;
  phases: WorkoutPlanPhase[];
}

export type AnyWorkoutPlan = WorkoutPlanV1 | WorkoutPlan;
export interface ValidationIssue { path: string; message: string }

export class PlanValidationError extends Error {
  constructor(public readonly issues: ValidationIssue[]) {
    super(`Invalid workout plan: ${issues.map((item) => `${item.path}: ${item.message}`).join('; ')}`);
    this.name = 'PlanValidationError';
  }
}

export function assertMachineTranslationsReviewed(plan: AnyWorkoutPlan): void {
  const pending = Object.entries(plan.translationMetadata ?? {}).find(([, metadata]) => metadata.reviewStatus === 'needs-review');
  if (pending) throw new PlanValidationError([{
    path: `translationMetadata.${pending[0]}.reviewStatus`,
    message: 'must be reviewed before saving, exporting, or starting'
  }]);
}

const languagePattern = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
const safeText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0 && !/[<>]/.test(value);
const exactKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean =>
  Object.keys(value).every((key) => keys.includes(key));

function validateExercise(
  entry: unknown,
  path: string,
  languageCodes: Set<string>,
  slotIds: Set<string>,
  issue: (path: string, message: string) => void,
  allowUntimed = true
): void {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) { issue(path, 'must be an object'); return; }
  const exercise = entry as Record<string, unknown>;
  const keys = ['id', 'exerciseId', 'type', 'target', 'translations', 'alternativeExerciseIds'];
  if (!exactKeys(exercise, keys) || Object.keys(exercise).length !== keys.length) issue(path, 'contains missing or unexpected fields');
  if (!safeText(exercise.id)) issue(`${path}.id`, 'must be non-empty safe text');
  else if (slotIds.has(exercise.id)) issue(`${path}.id`, 'must be unique across the plan'); else slotIds.add(exercise.id);
  if (!safeText(exercise.exerciseId)) issue(`${path}.exerciseId`, 'must be non-empty safe text');
  const supportedTypes = allowUntimed ? ['repetitions', 'duration', 'untimed'] : ['repetitions', 'duration'];
  if (!supportedTypes.includes(String(exercise.type))) issue(`${path}.type`, allowUntimed ? 'must be repetitions, duration, or untimed' : 'must be repetitions or duration');
  const target = exercise.target && typeof exercise.target === 'object' && !Array.isArray(exercise.target) ? exercise.target as Record<string, unknown> : {};
  if (exercise.type === 'duration') {
    if (!exactKeys(target, ['seconds']) || Object.keys(target).length !== 1 || !Number.isFinite(target.seconds) || (target.seconds as number) <= 0) issue(`${path}.target`, 'requires positive seconds');
  } else if (exercise.type === 'repetitions') {
    const validUnit = target.unit === 'repetitions' || target.unit === 'per-side';
    if (!exactKeys(target, ['min', 'max', 'unit']) || Object.keys(target).length !== 3 || !Number.isFinite(target.min) || !Number.isFinite(target.max) || (target.min as number) <= 0 || (target.max as number) < (target.min as number) || !validUnit) issue(`${path}.target`, 'requires a valid repetition range');
  } else if (exercise.type === 'untimed' && Object.keys(target).length !== 0) issue(`${path}.target`, 'must be empty for untimed exercises');
  const translations = exercise.translations && typeof exercise.translations === 'object' && !Array.isArray(exercise.translations) ? exercise.translations as Record<string, unknown> : {};
  for (const code of languageCodes) {
    const value = translations[code];
    if (!value || typeof value !== 'object' || Array.isArray(value)) { issue(`${path}.translations.${code}`, 'is required'); continue; }
    const copy = value as Record<string, unknown>;
    if (!exactKeys(copy, ['name', 'instructions']) || Object.keys(copy).length !== 2 || !safeText(copy.name) || !safeText(copy.instructions)) issue(`${path}.translations.${code}`, 'requires safe name and instructions');
  }
  if (Object.keys(translations).some((code) => !languageCodes.has(code))) issue(`${path}.translations`, 'contains an unknown language');
  if (!Array.isArray(exercise.alternativeExerciseIds) || exercise.alternativeExerciseIds.some((id) => !safeText(id))) issue(`${path}.alternativeExerciseIds`, 'must be an array of exercise ids');
}

export function validateWorkoutPlan(input: unknown): AnyWorkoutPlan {
  const issues: ValidationIssue[] = [];
  const issue = (path: string, message: string): void => { issues.push({ path, message }); };
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new PlanValidationError([{ path: '$', message: 'must be an object' }]);
  const plan = input as Record<string, unknown>;
  const versionKeys = plan.schemaVersion === 1
    ? ['rounds', 'restBetweenExercises', 'restBetweenRounds', 'exercises']
    : plan.schemaVersion === 2 ? ['phases'] : [];
  const requiredKeys = ['schemaVersion', 'id', 'languages', 'name', 'displayLanguages', ...versionKeys];
  const allowedKeys = [...requiredKeys, 'translationMetadata'];
  if (!exactKeys(plan, allowedKeys) || requiredKeys.some((key) => !(key in plan))) issue('$', 'contains missing or unexpected fields');
  if (plan.schemaVersion !== 1 && plan.schemaVersion !== 2) issue('schemaVersion', 'must equal 1 or 2');
  if (!safeText(plan.id)) issue('id', 'must be non-empty safe text');

  const languages = Array.isArray(plan.languages) ? plan.languages : [];
  if (languages.length === 0) issue('languages', 'requires at least one language');
  const languageCodes = new Set<string>();
  languages.forEach((entry, index) => {
    const path = `languages.${index}`;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) { issue(path, 'must be an object'); return; }
    const language = entry as Record<string, unknown>;
    if (!exactKeys(language, ['code', 'label']) || Object.keys(language).length !== 2) issue(path, 'contains unexpected fields');
    if (typeof language.code !== 'string' || !languagePattern.test(language.code)) issue(`${path}.code`, 'must be a BCP-47-like language code');
    else if (languageCodes.has(language.code)) issue(`${path}.code`, 'must be unique'); else languageCodes.add(language.code);
    if (!safeText(language.label)) issue(`${path}.label`, 'must be non-empty safe text');
  });
  const names = plan.name && typeof plan.name === 'object' && !Array.isArray(plan.name) ? plan.name as Record<string, unknown> : {};
  for (const code of languageCodes) if (!safeText(names[code])) issue(`name.${code}`, 'is required and must be safe text');
  if (Object.keys(names).some((code) => !languageCodes.has(code))) issue('name', 'contains an unknown language');
  const display = Array.isArray(plan.displayLanguages) ? plan.displayLanguages : [];
  if (display.length < 1 || display.length > 2) issue('displayLanguages', 'must contain one or two languages');
  if (new Set(display).size !== display.length || display.some((code) => typeof code !== 'string' || !languageCodes.has(code))) issue('displayLanguages', 'contains duplicate or unknown languages');

  const slotIds = new Set<string>();
  if (plan.schemaVersion === 1) {
    if (!Number.isInteger(plan.rounds) || (plan.rounds as number) < 1) issue('rounds', 'must be a positive integer');
    for (const key of ['restBetweenExercises', 'restBetweenRounds'] as const) if (!Number.isFinite(plan[key]) || (plan[key] as number) < 0) issue(key, 'must be a non-negative number');
    const exercises = Array.isArray(plan.exercises) ? plan.exercises : [];
    if (exercises.length === 0) issue('exercises', 'requires at least one exercise');
    exercises.forEach((entry, index) => validateExercise(entry, `exercises.${index}`, languageCodes, slotIds, issue, false));
  } else if (plan.schemaVersion === 2) {
    const phases = Array.isArray(plan.phases) ? plan.phases : [];
    if (phases.length === 0) issue('phases', 'requires at least one phase');
    const phaseIds = new Set<string>();
    let trainingCount = 0;
    let seenTraining = false;
    let seenCoolDown = false;
    phases.forEach((entry, index) => {
      const path = `phases.${index}`;
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) { issue(path, 'must be an object'); return; }
      const phase = entry as Record<string, unknown>;
      const keys = ['id', 'kind', 'rounds', 'restBetweenExercises', 'restBetweenRounds', 'restAfterPhase', 'exercises'];
      if (!exactKeys(phase, keys) || Object.keys(phase).length !== keys.length) issue(path, 'contains missing or unexpected fields');
      if (!safeText(phase.id)) issue(`${path}.id`, 'must be non-empty safe text');
      else if (phaseIds.has(phase.id)) issue(`${path}.id`, 'must be unique'); else phaseIds.add(phase.id);
      if (!['warm-up', 'training', 'active-recovery', 'cool-down'].includes(String(phase.kind))) issue(`${path}.kind`, 'must be a supported phase kind');
      if (phase.kind === 'training') { trainingCount += 1; seenTraining = true; }
      if (phase.kind === 'warm-up' && seenTraining) issue(`${path}.kind`, 'warm-up must come before training');
      if (phase.kind === 'cool-down') { if (!seenTraining) issue(`${path}.kind`, 'cool-down must come after training'); seenCoolDown = true; }
      if (seenCoolDown && phase.kind !== 'cool-down') issue(`${path}.kind`, 'no phase may follow cool-down');
      if (!Number.isInteger(phase.rounds) || (phase.rounds as number) < 1) issue(`${path}.rounds`, 'must be a positive integer');
      for (const key of ['restBetweenExercises', 'restBetweenRounds', 'restAfterPhase'] as const) if (!Number.isFinite(phase[key]) || (phase[key] as number) < 0) issue(`${path}.${key}`, 'must be a non-negative number');
      const exercises = Array.isArray(phase.exercises) ? phase.exercises : [];
      if (exercises.length === 0) issue(`${path}.exercises`, 'requires at least one exercise');
      if (phase.kind === 'active-recovery' && exercises.some((exercise) => exercise && typeof exercise === 'object' && (exercise as Record<string, unknown>).type === 'repetitions')) issue(`${path}.exercises`, 'active recovery requires duration or untimed exercises');
      exercises.forEach((exercise, exerciseIndex) => validateExercise(exercise, `${path}.exercises.${exerciseIndex}`, languageCodes, slotIds, issue));
    });
    if (trainingCount === 0) issue('phases', 'requires at least one training phase');
  }

  if (plan.translationMetadata !== undefined) {
    const metadata = plan.translationMetadata && typeof plan.translationMetadata === 'object' && !Array.isArray(plan.translationMetadata) ? plan.translationMetadata as Record<string, unknown> : null;
    if (!metadata) issue('translationMetadata', 'must be an object');
    else for (const [code, entry] of Object.entries(metadata)) {
      const path = `translationMetadata.${code}`;
      if (!languageCodes.has(code)) { issue(path, 'references an unknown language'); continue; }
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) { issue(path, 'must be an object'); continue; }
      const record = entry as Record<string, unknown>;
      const keys = ['sourceLanguage', 'origin', 'reviewStatus', 'provider', 'translatedAt'];
      if (!exactKeys(record, keys) || Object.keys(record).length !== keys.length) issue(path, 'contains missing or unexpected fields');
      if (typeof record.sourceLanguage !== 'string' || !languageCodes.has(record.sourceLanguage) || record.sourceLanguage === code) issue(`${path}.sourceLanguage`, 'must reference a different configured language');
      if (record.origin !== 'machine') issue(`${path}.origin`, 'must equal machine');
      if (record.reviewStatus !== 'needs-review' && record.reviewStatus !== 'reviewed') issue(`${path}.reviewStatus`, 'must be needs-review or reviewed');
      if (!safeText(record.provider)) issue(`${path}.provider`, 'must be non-empty safe text');
      if (typeof record.translatedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(record.translatedAt)) issue(`${path}.translatedAt`, 'must be an ISO UTC timestamp');
    }
  }
  if (issues.length) throw new PlanValidationError(issues);
  return input as AnyWorkoutPlan;
}

/** Converts v1 into one equivalent training phase without mutating or persisting the input. */
export function migrateWorkoutPlan(input: unknown): WorkoutPlan {
  const validated = validateWorkoutPlan(input);
  if (validated.schemaVersion === 2) return structuredClone(validated);
  const { rounds, restBetweenExercises, restBetweenRounds, exercises, ...base } = validated;
  const migrated: WorkoutPlan = {
    ...structuredClone(base),
    schemaVersion: 2,
    phases: [{
      id: 'training',
      kind: 'training',
      rounds,
      restBetweenExercises,
      restBetweenRounds,
      restAfterPhase: 0,
      exercises: structuredClone(exercises)
    }]
  };
  return validateWorkoutPlan(migrated) as WorkoutPlan;
}

export const planExercises = (plan: WorkoutPlan): PlanExercise[] => plan.phases.flatMap((phase) => phase.exercises);
