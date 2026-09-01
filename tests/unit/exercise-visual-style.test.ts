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
  'full-body': 4,
  'warm-up': 42,
  stretch: 160
};

function svgFor(exercise: ExerciseDefinition): string {
  return readFileSync(
    resolve(process.cwd(), 'public', exercise.illustration.slice(1)),
    'utf8'
  );
}

describe('exercise illustration visual system', () => {
  it('uses one consistent background and accent hue for all 51 exercise categories', () => {
    expect(EXERCISE_LIBRARY).toHaveLength(51);

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
    expect(byId.get('pull-up')).toContain('<circle cx="160" cy="95"');
    expect(byId.get('pull-up')).toContain('<circle cx="160" cy="55"');
    expect(byId.get('pull-up')).toContain('M160 118L144 169');
    expect(byId.get('assisted-pull-up')).toContain('stroke-dasharray="7 6"');
    expect(byId.get('chin-up')).toContain('<circle cx="160" cy="95"');
    expect(byId.get('chin-up')).toContain('<circle cx="160" cy="55"');
    expect(byId.get('side-plank')).toContain('M228 130L215 145L155 171L80 204');
    expect(byId.get('side-plank')).not.toContain('data-pose="start"');
    expect(byId.get('pike-push-up')).toContain('L185 84L260 204');
    expect(byId.get('pike-push-up')).not.toContain('cx="191"');
    expect(byId.get('side-plank')).toContain('M215 145L215 204L170 204');
    expect(byId.get('incline-push-up')).toContain('M151 116L110 130');
    expect(byId.get('incline-push-up')).toContain('L260 204');
    expect(byId.get('triceps-dip')).toContain('M58 154H130');
    expect(byId.get('triceps-dip')).not.toContain('M167 165L151 204');
    expect(byId.get('burpee')).not.toContain('data-pose="start"');
    expect(byId.get('burpee')).toContain('M193 145L180 174L177 204');
    expect(byId.get('burpee')).toContain('M193 145L208 173L213 204');
    expect(byId.get('burpee')).toContain('M150 159L110 173L75 204');
    expect(byId.get('burpee')).toContain('M150 159L137 187L128 204');
    for (const id of ['dead-bug', 'lying-leg-raise', 'glute-bridge']) {
      expect(byId.get(id), `${id} keeps the body at the floor`).toMatch(/cy="18[04]"/);
      expect(byId.get(id), `${id} includes the shared floor line`).toContain('M42 210H278');
    }
  });

  it('keeps vertical and lowering movements overlaid instead of separating figures sideways', () => {
    const byId = new Map(EXERCISE_LIBRARY.map((exercise) => [exercise.id, svgFor(exercise)]));
    for (const id of ['pull-up', 'chin-up']) {
      const heads = [...byId.get(id)!.matchAll(/<circle cx="(\d+)" cy="(?:95|55)" r="13"\/>/g)];
      expect(heads, `${id} has same-centre start and finish heads`).toHaveLength(2);
      expect(new Set(heads.map((match) => match[1]))).toStrictEqual(new Set(['160']));
    }
    const pike = byId.get('pike-push-up')!;
    expect(pike.match(/L185 84L260 204/g), 'pike start and finish share hip and feet').toHaveLength(2);
  });
});
