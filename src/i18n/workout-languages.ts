import { isSupportedLocale, type SupportedLocale } from './locales';

export const SECOND_WORKOUT_LANGUAGE_STORAGE_KEY = 'home-workout:second-workout-language';
export type SecondWorkoutLanguagePreference = 'auto' | 'off' | SupportedLocale;

export function readSecondWorkoutLanguage(storage: Pick<Storage, 'getItem'>): SecondWorkoutLanguagePreference {
  const stored = storage.getItem(SECOND_WORKOUT_LANGUAGE_STORAGE_KEY);
  return stored === 'off' || stored === 'auto' || isSupportedLocale(stored) ? stored : 'auto';
}

export function persistSecondWorkoutLanguage(
  storage: Pick<Storage, 'setItem'>,
  preference: SecondWorkoutLanguagePreference
): void {
  storage.setItem(SECOND_WORKOUT_LANGUAGE_STORAGE_KEY, preference);
}

const languageBase = (code: string): string => code.trim().toLowerCase().split('-')[0] ?? '';

export function matchLanguageCode(requested: string, available: readonly string[]): string | undefined {
  const exact = available.find((code) => code.toLowerCase() === requested.toLowerCase());
  if (exact) return exact;
  const base = languageBase(requested);
  return available.find((code) => languageBase(code) === base);
}

interface WorkoutLanguageOptions {
  interfaceLanguage: string;
  displayLanguages: readonly string[];
  availableLanguages: readonly string[];
  secondLanguage: SecondWorkoutLanguagePreference;
}

export function resolveWorkoutLanguages(options: WorkoutLanguageOptions): string[] {
  const available = options.availableLanguages.filter((code, index, codes) => (
    code.trim() !== '' && codes.findIndex((candidate) => candidate.toLowerCase() === code.toLowerCase()) === index
  ));
  if (!available.length) return [];

  const primary = matchLanguageCode(options.interfaceLanguage, available)
    ?? options.displayLanguages.map((code) => matchLanguageCode(code, available)).find(Boolean)
    ?? available[0]!;
  if (options.secondLanguage === 'off') return [primary];

  const requestedSecond = options.secondLanguage === 'auto'
    ? options.displayLanguages
    : [options.secondLanguage];
  const secondary = requestedSecond
    .map((code) => matchLanguageCode(code, available))
    .find((code) => code !== undefined && code.toLowerCase() !== primary.toLowerCase());
  return secondary ? [primary, secondary] : [primary];
}
