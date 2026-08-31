import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_WORKOUT } from '../../src/data/default-workout';
import { EXERCISES_BY_ID } from '../../src/data/exercises';

function numericAttribute(element: string | undefined, attribute: string): number | undefined {
  if (!element) return undefined;
  const match = element.match(new RegExp(`${attribute}=["']([0-9]+(?:\\.[0-9]+)?)["']`, 'i'));
  return match ? Number(match[1]) : undefined;
}

describe('default-workout exercise illustrations', () => {
  it('gives all eight local SVGs a subtle, consistently bounded motion indicator', () => {
    const exerciseIds = DEFAULT_WORKOUT.exercises.map(({ exerciseId }) => exerciseId);
    expect(exerciseIds).toHaveLength(8);
    expect(new Set(exerciseIds).size).toBe(8);

    for (const exerciseId of exerciseIds) {
      const exercise = EXERCISES_BY_ID.get(exerciseId);
      expect.soft(exercise, `library entry for ${exerciseId}`).toBeDefined();
      if (!exercise) continue;
      expect.soft(exercise.illustration).toMatch(/^\/assets\/exercises\/[a-z0-9-]+\.svg$/);

      const absolutePath = resolve(process.cwd(), 'public', exercise.illustration.slice(1));
      expect.soft(existsSync(absolutePath), `${exerciseId} SVG exists locally`).toBe(true);
      if (!existsSync(absolutePath)) continue;
      const svg = readFileSync(absolutePath, 'utf8').trim();

      expect.soft(svg, `${exerciseId} has an SVG root`).toMatch(/^<svg\b[^>]*>/i);
      expect.soft(svg, `${exerciseId} declares the SVG namespace`).toMatch(/^<svg\b[^>]*xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/i);
      expect.soft(svg, `${exerciseId} has a viewBox`).toMatch(/^<svg\b[^>]*viewBox=["'][^"']+["']/i);
      expect.soft(svg, `${exerciseId} closes its SVG root`).toMatch(/<\/svg>$/i);

      const marker = svg.match(/<marker\b[^>]*id=["']motion-arrow["'][^>]*>/i)?.[0];
      expect.soft(marker, `${exerciseId} defines #motion-arrow`).toBeDefined();
      expect.soft(numericAttribute(marker, 'markerWidth'), `${exerciseId} markerWidth`).toBeGreaterThan(0);
      expect.soft(numericAttribute(marker, 'markerWidth'), `${exerciseId} markerWidth`).toBeLessThanOrEqual(5);
      expect.soft(numericAttribute(marker, 'markerHeight'), `${exerciseId} markerHeight`).toBeGreaterThan(0);
      expect.soft(numericAttribute(marker, 'markerHeight'), `${exerciseId} markerHeight`).toBeLessThanOrEqual(5);

      const movement = svg.match(
        /<(?:path|line|polyline)\b[^>]*marker-end=["']url\(#motion-arrow\)["'][^>]*>/i
      )?.[0];
      expect.soft(movement, `${exerciseId} uses #motion-arrow on a movement path`).toBeDefined();
      expect.soft(numericAttribute(movement, 'stroke-width'), `${exerciseId} movement stroke-width`).toBeGreaterThan(0);
      expect.soft(numericAttribute(movement, 'stroke-width'), `${exerciseId} movement stroke-width`).toBeLessThanOrEqual(5);
    }
  });
});
