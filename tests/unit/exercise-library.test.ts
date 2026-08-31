import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXERCISE_LIBRARY } from '../../src/data/exercises';
import { DEFAULT_WORKOUT } from '../../src/data/default-workout';
import { validateWorkoutPlan } from '../../src/core/plan-schema';

const requiredIds = [
  'squat', 'sumo-squat', 'reverse-lunge', 'forward-lunge', 'split-squat',
  'glute-bridge', 'single-leg-glute-bridge', 'calf-raise', 'wall-sit',
  'push-up', 'incline-push-up', 'knee-push-up', 'pike-push-up',
  'pull-up', 'assisted-pull-up', 'chin-up', 'resistance-band-row',
  'resistance-band-pull-apart', 'dead-bug', 'lying-leg-raise', 'bird-dog', 'plank', 'side-plank',
  'mountain-climber', 'hollow-hold', 'jumping-jack', 'step-jack', 'high-knees',
  'marching-in-place', 'burpee', 'squat-to-reach'
];

describe('built-in exercise library', () => {
  it('contains at least 30 stable, unique exercises including every required exercise', () => {
    expect(EXERCISE_LIBRARY.length).toBeGreaterThanOrEqual(30);
    const ids = EXERCISE_LIBRARY.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining(requiredIds));
  });

  it('provides complete metadata, DE/EN copy and local illustrations for every exercise', () => {
    for (const exercise of EXERCISE_LIBRARY) {
      expect(exercise.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(exercise.category).toMatch(/^(legs|push|pull|core|cardio|full-body)$/);
      expect(exercise.equipment.length).toBeGreaterThan(0);
      expect(exercise.difficulty).toMatch(/^(beginner|intermediate|advanced)$/);
      expect(exercise.type).toMatch(/^(repetitions|duration)$/);
      expect(exercise.defaultTarget).toBeDefined();
      expect(exercise.translations.de?.name.trim()).toBeTruthy();
      expect(exercise.translations.de?.instructions.trim()).toBeTruthy();
      expect(exercise.translations.en?.name.trim()).toBeTruthy();
      expect(exercise.translations.en?.instructions.trim()).toBeTruthy();
      expect(exercise.illustration).toMatch(/^\/assets\/exercises\/[a-z0-9-]+\.svg$/);
      expect(existsSync(resolve(process.cwd(), 'public', exercise.illustration.slice(1)))).toBe(true);
      expect(Array.isArray(exercise.variants.easier)).toBe(true);
      expect(Array.isArray(exercise.variants.harder)).toBe(true);
    }
  });

  it('only references alternatives that exist and never references itself', () => {
    const ids = new Set(EXERCISE_LIBRARY.map(({ id }) => id));
    for (const exercise of EXERCISE_LIBRARY) {
      const alternatives = [...exercise.variants.easier, ...exercise.variants.harder];
      expect(alternatives).not.toContain(exercise.id);
      for (const id of alternatives) expect(ids.has(id)).toBe(true);
    }
  });
});

describe('30 Minute Full Body default workout', () => {
  it('is valid, bilingual and has the requested structure and rests', () => {
    expect(validateWorkoutPlan(DEFAULT_WORKOUT)).toStrictEqual(DEFAULT_WORKOUT);
    expect(DEFAULT_WORKOUT.displayLanguages).toEqual(['de', 'en']);
    expect(DEFAULT_WORKOUT.rounds).toBe(3);
    expect(DEFAULT_WORKOUT.restBetweenExercises).toBe(20);
    expect(DEFAULT_WORKOUT.restBetweenRounds).toBe(60);
    expect(DEFAULT_WORKOUT.exercises).toHaveLength(8);
    expect(DEFAULT_WORKOUT.exercises.map(({ exerciseId }) => exerciseId)).toEqual([
      'squat',
      'push-up',
      'reverse-lunge',
      'pull-up',
      'glute-bridge',
      'dead-bug',
      'jumping-jack',
      'lying-leg-raise'
    ]);
  });

  it('alternates upper-body work with legs, core or cardio', () => {
    const categoryById = new Map(EXERCISE_LIBRARY.map(({ id, category }) => [id, category]));
    const categories = DEFAULT_WORKOUT.exercises.map(({ exerciseId }) => categoryById.get(exerciseId));
    const isUpperBody = (category: string | undefined): boolean => category === 'push' || category === 'pull';

    expect(categories).toEqual(['legs', 'push', 'legs', 'pull', 'legs', 'core', 'cardio', 'core']);
    for (let index = 1; index < categories.length; index += 1) {
      expect(
        isUpperBody(categories[index - 1]) && isUpperBody(categories[index]),
        `upper-body exercises at positions ${index} and ${index + 1} must be separated`
      ).toBe(false);
    }
  });

  it('ships Reverse Lunge and Lying Leg Raises with translated local artwork', () => {
    const byId = new Map(EXERCISE_LIBRARY.map((exercise) => [exercise.id, exercise]));
    const reverseLunge = byId.get('reverse-lunge');
    const legRaise = byId.get('lying-leg-raise');

    expect(DEFAULT_WORKOUT.exercises.map(({ exerciseId }) => exerciseId)).toEqual(
      expect.arrayContaining(['reverse-lunge', 'lying-leg-raise'])
    );
    expect(legRaise?.translations.en?.name).toBe('Lying Leg Raises');
    expect(legRaise?.translations.de?.name).toBe('Beinheben im Liegen');
    for (const exercise of [reverseLunge, legRaise]) {
      expect(exercise?.illustration).toMatch(/^\/assets\/exercises\/[a-z0-9-]+\.svg$/);
      expect(existsSync(resolve(process.cwd(), 'public', exercise!.illustration.slice(1)))).toBe(true);
    }
  });

  it('includes the specified easier alternatives and a 30 second jumping-jack target', () => {
    const byId = Object.fromEntries(DEFAULT_WORKOUT.exercises.map((exercise) => [exercise.exerciseId, exercise]));
    expect(byId['push-up']?.alternativeExerciseIds).toContain('incline-push-up');
    expect(byId['pull-up']?.alternativeExerciseIds).toEqual(expect.arrayContaining([
      'assisted-pull-up', 'resistance-band-row'
    ]));
    expect(byId['jumping-jack']?.alternativeExerciseIds).toContain('step-jack');
    expect(byId['jumping-jack']?.target).toStrictEqual({ seconds: 30 });
  });
});
