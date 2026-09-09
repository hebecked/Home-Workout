import { addedExerciseTranslations } from './exercises-added-locales';
import { baseExerciseTranslations, EXERCISE_IDS, type ExerciseId, type ExerciseTranslation } from './exercises';
import type { SupportedLocale } from './locales';

export const exerciseTranslations = Object.fromEntries(EXERCISE_IDS.map((id) => [id, {
  ...baseExerciseTranslations[id],
  ...addedExerciseTranslations[id]
}])) as Readonly<Record<ExerciseId, Readonly<Record<SupportedLocale, ExerciseTranslation>>>>;

export function exerciseTranslation(id: string, locale: SupportedLocale): ExerciseTranslation | undefined {
  return exerciseTranslations[id as ExerciseId]?.[locale];
}
