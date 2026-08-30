import type { ExerciseTarget, Translation } from '../core/plan-schema';

export interface ExerciseDefinition {
  id: string;
  category: 'legs' | 'push' | 'pull' | 'core' | 'cardio' | 'full-body';
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'repetitions' | 'duration';
  defaultTarget: ExerciseTarget;
  translations: Record<'de' | 'en', Translation>;
  illustration: string;
  variants: { easier: string[]; harder: string[] };
}

type Seed = [string, ExerciseDefinition['category'], string, string, ExerciseDefinition['difficulty'], ExerciseDefinition['type'], string[], string[]];

const seeds: Seed[] = [
  ['squat', 'legs', 'Kniebeuge', 'Squat', 'beginner', 'repetitions', ['wall-sit'], ['sumo-squat']],
  ['sumo-squat', 'legs', 'Sumo-Kniebeuge', 'Sumo Squat', 'beginner', 'repetitions', ['squat'], ['split-squat']],
  ['reverse-lunge', 'legs', 'Rückwärts-Ausfallschritt', 'Reverse Lunge', 'intermediate', 'repetitions', ['split-squat'], ['forward-lunge']],
  ['forward-lunge', 'legs', 'Vorwärts-Ausfallschritt', 'Forward Lunge', 'intermediate', 'repetitions', ['reverse-lunge'], ['split-squat']],
  ['split-squat', 'legs', 'Geteilte Kniebeuge', 'Split Squat', 'intermediate', 'repetitions', ['reverse-lunge'], ['forward-lunge']],
  ['glute-bridge', 'legs', 'Beckenheben', 'Glute Bridge', 'beginner', 'repetitions', [], ['single-leg-glute-bridge']],
  ['single-leg-glute-bridge', 'legs', 'Einbeiniges Beckenheben', 'Single Leg Glute Bridge', 'intermediate', 'repetitions', ['glute-bridge'], []],
  ['calf-raise', 'legs', 'Wadenheben', 'Calf Raise', 'beginner', 'repetitions', [], []],
  ['wall-sit', 'legs', 'Wandsitz', 'Wall Sit', 'beginner', 'duration', ['squat'], ['split-squat']],
  ['push-up', 'push', 'Liegestütz', 'Push-up', 'intermediate', 'repetitions', ['incline-push-up', 'knee-push-up'], ['pike-push-up']],
  ['incline-push-up', 'push', 'Erhöhter Liegestütz', 'Incline Push-up', 'beginner', 'repetitions', ['knee-push-up'], ['push-up']],
  ['knee-push-up', 'push', 'Knie-Liegestütz', 'Knee Push-up', 'beginner', 'repetitions', ['incline-push-up'], ['push-up']],
  ['pike-push-up', 'push', 'Pike-Liegestütz', 'Pike Push-up', 'advanced', 'repetitions', ['push-up'], []],
  ['pull-up', 'pull', 'Klimmzug', 'Pull-up', 'advanced', 'repetitions', ['assisted-pull-up', 'resistance-band-row'], ['chin-up']],
  ['assisted-pull-up', 'pull', 'Unterstützter Klimmzug', 'Assisted Pull-up', 'intermediate', 'repetitions', ['resistance-band-row'], ['pull-up']],
  ['chin-up', 'pull', 'Untergriff-Klimmzug', 'Chin-up', 'advanced', 'repetitions', ['assisted-pull-up'], ['pull-up']],
  ['resistance-band-row', 'pull', 'Bandrudern', 'Resistance Band Row', 'beginner', 'repetitions', ['resistance-band-pull-apart'], ['assisted-pull-up']],
  ['resistance-band-pull-apart', 'pull', 'Band auseinanderziehen', 'Resistance Band Pull-Apart', 'beginner', 'repetitions', [], ['resistance-band-row']],
  ['dead-bug', 'core', 'Käfer', 'Dead Bug', 'beginner', 'repetitions', [], ['hollow-hold']],
  ['lying-leg-raise', 'core', 'Beinheben im Liegen', 'Lying Leg Raises', 'beginner', 'repetitions', ['dead-bug'], ['hollow-hold']],
  ['bird-dog', 'core', 'Vierfüßler diagonal', 'Bird Dog', 'beginner', 'repetitions', ['dead-bug'], ['plank']],
  ['plank', 'core', 'Unterarmstütz', 'Plank', 'intermediate', 'duration', ['dead-bug'], ['side-plank', 'hollow-hold']],
  ['side-plank', 'core', 'Seitstütz', 'Side Plank', 'intermediate', 'duration', ['plank'], ['hollow-hold']],
  ['mountain-climber', 'core', 'Bergsteiger', 'Mountain Climber', 'intermediate', 'duration', ['marching-in-place'], ['burpee']],
  ['hollow-hold', 'core', 'Hollow Hold', 'Hollow Hold', 'advanced', 'duration', ['dead-bug'], []],
  ['jumping-jack', 'cardio', 'Hampelmann', 'Jumping Jack', 'beginner', 'duration', ['step-jack'], ['high-knees']],
  ['step-jack', 'cardio', 'Seitlicher Step Jack', 'Step Jack', 'beginner', 'duration', ['marching-in-place'], ['jumping-jack']],
  ['high-knees', 'cardio', 'Kniehebelauf', 'High Knees', 'intermediate', 'duration', ['marching-in-place'], ['burpee']],
  ['marching-in-place', 'cardio', 'Marschieren am Platz', 'Marching in Place', 'beginner', 'duration', [], ['high-knees']],
  ['burpee', 'full-body', 'Burpee', 'Burpee', 'advanced', 'repetitions', ['squat-to-reach'], []],
  ['squat-to-reach', 'full-body', 'Kniebeuge mit Strecken', 'Squat to Reach', 'beginner', 'repetitions', ['squat'], ['burpee']],
  ['superman', 'core', 'Superman', 'Superman', 'beginner', 'duration', ['bird-dog'], ['hollow-hold']],
  ['triceps-dip', 'push', 'Trizeps-Dip', 'Triceps Dip', 'intermediate', 'repetitions', ['incline-push-up'], ['pike-push-up']]
];

const bandExercises = new Set(['resistance-band-row', 'resistance-band-pull-apart', 'assisted-pull-up']);
const barExercises = new Set(['pull-up', 'chin-up']);

export const EXERCISE_LIBRARY: ExerciseDefinition[] = seeds.map(([id, category, de, en, difficulty, type, easier, harder]) => ({
  id, category,
  equipment: bandExercises.has(id) ? ['resistance band'] : barExercises.has(id) ? ['pull-up bar'] : id === 'triceps-dip' || id === 'incline-push-up' ? ['chair'] : ['none'],
  difficulty, type,
  defaultTarget: type === 'duration' ? { seconds: 30 } : { min: 8, max: 12, unit: id.includes('lunge') || id === 'bird-dog' || id === 'dead-bug' ? 'per-side' : 'repetitions' },
  translations: {
    de: { name: de, instructions: id === 'lying-leg-raise' ? 'Lege dich auf den Rücken, presse den unteren Rücken in den Boden und hebe die gestreckten Beine kontrolliert an und ab.' : type === 'duration' ? 'Halte eine ruhige, kontrollierte Position und atme gleichmäßig.' : 'Bewege dich kontrolliert und halte den Rumpf stabil.' },
    en: { name: en, instructions: id === 'lying-leg-raise' ? 'Lie on your back, press your lower back into the floor, and raise and lower straight legs with control.' : type === 'duration' ? 'Hold a calm, controlled position and breathe steadily.' : 'Move with control and keep your core stable.' }
  },
  illustration: `/assets/exercises/${id}.svg`,
  variants: { easier, harder }
}));

export const EXERCISES_BY_ID = new Map(EXERCISE_LIBRARY.map((exercise) => [exercise.id, exercise]));
