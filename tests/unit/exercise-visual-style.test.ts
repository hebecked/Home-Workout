import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXERCISE_LIBRARY, type ExerciseDefinition } from '../../src/data/exercises';

const categoryHue: Record<ExerciseDefinition['category'], number> = {
  legs: 208,
  push: 28,
  pull: 28,
  core: 276,
  cardio: 4,
  'full-body': 4
};

function svgFor(exercise: ExerciseDefinition): string {
  return readFileSync(
    resolve(process.cwd(), 'public', exercise.illustration.slice(1)),
    'utf8'
  );
}

describe('exercise illustration visual system', () => {
  it('uses one consistent background and accent hue for all 33 exercise categories', () => {
    expect(EXERCISE_LIBRARY).toHaveLength(33);

    for (const exercise of EXERCISE_LIBRARY) {
      const hue = categoryHue[exercise.category];
      const svg = svgFor(exercise);

      expect(
        svg,
        `${exercise.id} (${exercise.category}) uses hue ${hue} for its background`
      ).toContain(`fill="hsl(${hue} 42% 93%)"`);
      expect(
        svg,
        `${exercise.id} (${exercise.category}) uses hue ${hue} for its accent`
      ).toContain(`stroke="hsl(${hue} 65% 48%)"`);
    }
  });

  it('keeps push-up toes and hands grounded without an extra hip limb', () => {
    const pushUp = EXERCISE_LIBRARY.find(({ id }) => id === 'push-up');
    expect(pushUp).toBeDefined();
    const generatedSvg = svgFor(pushUp!);

    const generator = readFileSync(
      resolve(process.cwd(), 'scripts', 'generate-exercise-assets.mjs'),
      'utf8'
    );
    const pushUpTemplate = generator.match(/'push-up': \{([\s\S]*?)\n\s*\},\n\s*'incline-push-up':/)?.[1];
    expect(pushUpTemplate, 'push-up has a dedicated generator template').toBeDefined();

    for (const source of [generatedSvg, pushUpTemplate!]) {
      expect(source).toContain('M219 109L151 124L75 171L50 204');
      expect(source).toContain('M211 111L183 150L198 204');
      expect(source).not.toContain('M151 124L58 191');
    }
  });

  it('shows the requested movement direction and floor contact in key corrected poses', () => {
    const byId = new Map(EXERCISE_LIBRARY.map((exercise) => [exercise.id, svgFor(exercise)]));

    expect(byId.get('squat')).toContain('M137 145L94 154L72 204');
    expect(byId.get('pull-up')).toContain('<circle cx="160" cy="133"');
    expect(byId.get('pull-up')).toContain('<circle cx="160" cy="75"');
    for (const id of ['dead-bug', 'lying-leg-raise', 'glute-bridge']) {
      expect(byId.get(id), `${id} keeps the body at the floor`).toMatch(/cy="18[04]"/);
      expect(byId.get(id), `${id} includes the shared floor line`).toContain('M42 210H278');
    }
  });
});
