import { addedExerciseTranslations } from './exercises-added-locales';
import { EXERCISES_BY_ID } from '../data/exercises';
import { baseExerciseTranslations, EXERCISE_IDS, type ExerciseId, type ExerciseTranslation } from './exercises';
import type { SupportedLocale } from './locales';

export const exerciseTranslations = Object.fromEntries(EXERCISE_IDS.map((id) => [id, {
  ...baseExerciseTranslations[id],
  ...addedExerciseTranslations[id],
  de: EXERCISES_BY_ID.get(id)?.translations.de ?? baseExerciseTranslations[id].de,
  en: EXERCISES_BY_ID.get(id)?.translations.en ?? baseExerciseTranslations[id].en
}])) as Readonly<Record<ExerciseId, Readonly<Record<SupportedLocale, ExerciseTranslation>>>>;

export function exerciseTranslation(id: string, locale: SupportedLocale): ExerciseTranslation | undefined {
  return exerciseTranslations[id as ExerciseId]?.[locale];
}
