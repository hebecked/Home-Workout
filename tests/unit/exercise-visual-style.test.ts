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

function darkMainPath(source: string): string | undefined {
  return [...source.matchAll(/<path\b[^>]*>/gi)]
    .map(([element]) => element)
    .find((element) => /stroke=["']#18233a["']/i.test(element));
}

function pathData(element: string | undefined): string | undefined {
  return element?.match(/\bd=["']([^"']+)["']/i)?.[1];
}

function hasRearwardLegSegment(path: string | undefined): boolean {
  if (!path) return false;
  const absoluteSegments = path.matchAll(
    /M\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(?:L\s*)?(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g
  );
  return [...absoluteSegments].some((match) => {
    const [, startX, startY, endX, endY] = match.map(Number);
    return startX! >= 120 && startX! <= 160 && startY! >= 130 && startY! <= 160 &&
      endX! < 100 && endY! >= 155;
  });
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

  it('keeps a clearly rearward additional leg in both push-up SVG and its generator template', () => {
    const pushUp = EXERCISE_LIBRARY.find(({ id }) => id === 'push-up');
    expect(pushUp).toBeDefined();
    const generatedSvgPath = pathData(darkMainPath(svgFor(pushUp!)));

    const generator = readFileSync(
      resolve(process.cwd(), 'scripts', 'generate-exercise-assets.mjs'),
      'utf8'
    );
    const pushUpTemplate = generator.match(/'push-up': `([\s\S]*?)`,\s*\n\s*'pull-up':/)?.[1];
    expect(pushUpTemplate, 'push-up has a dedicated generator template').toBeDefined();
    const generatorPath = pathData(darkMainPath(pushUpTemplate!));

    expect(generatedSvgPath, 'generated push-up has a dark main path').toBeDefined();
    expect(generatorPath, 'push-up generator has a dark main path').toBeDefined();
    expect(
      hasRearwardLegSegment(generatedSvgPath),
      `generated push-up needs a hip-to-rear-foot segment; got ${generatedSvgPath}`
    ).toBe(true);
    expect(
      hasRearwardLegSegment(generatorPath),
      `generator needs the same hip-to-rear-foot segment; got ${generatorPath}`
    ).toBe(true);
  });
});
