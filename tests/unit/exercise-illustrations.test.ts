import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXERCISE_LIBRARY } from '../../src/data/exercises';

function numericAttribute(element: string | undefined, attribute: string): number | undefined {
  if (!element) return undefined;
  const match = element.match(new RegExp(`${attribute}=["']([0-9]+(?:\\.[0-9]+)?)["']`, 'i'));
  return match ? Number(match[1]) : undefined;
}

describe('exercise illustrations', () => {
  it('gives all 51 exercises a local pose and movement indicators only where movement is shown', () => {
    expect(EXERCISE_LIBRARY).toHaveLength(51);
    const singlePoseIds = new Set([
      'side-plank', 'sumo-squat-hold', 'shoulder-roll', 'arm-circle', 'burpee',
      'calf-stretch', 'hamstring-stretch', 'quadriceps-stretch', 'hip-flexor-stretch',
      'shoulder-upper-back-stretch', 'chest-stretch', 'child-pose', 'cobra-stretch', 'yoga-bridge'
    ]);
    const staticIds = new Set([
      'side-plank', 'sumo-squat-hold',
      'calf-stretch', 'hamstring-stretch', 'quadriceps-stretch', 'hip-flexor-stretch',
      'shoulder-upper-back-stretch', 'chest-stretch', 'child-pose', 'cobra-stretch', 'yoga-bridge'
    ]);

    for (const exercise of EXERCISE_LIBRARY) {
      const exerciseId = exercise.id;
      expect.soft(exercise.illustration).toMatch(/^\/assets\/exercises\/[a-z0-9-]+\.svg$/);

      const absolutePath = resolve(process.cwd(), 'public', exercise.illustration.slice(1));
      expect.soft(existsSync(absolutePath), `${exerciseId} SVG exists locally`).toBe(true);
      if (!existsSync(absolutePath)) continue;
      const svg = readFileSync(absolutePath, 'utf8').trim();

      expect.soft(svg, `${exerciseId} has an SVG root`).toMatch(/^<svg\b[^>]*>/i);
      expect.soft(svg, `${exerciseId} declares the SVG namespace`).toMatch(/^<svg\b[^>]*xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/i);
      expect.soft(svg, `${exerciseId} has a viewBox`).toMatch(/^<svg\b[^>]*viewBox=["'][^"']+["']/i);
      expect.soft(svg, `${exerciseId} closes its SVG root`).toMatch(/<\/svg>$/i);
      expect.soft(svg, `${exerciseId} has a finish pose`).toContain('data-pose="finish"');
      if (singlePoseIds.has(exerciseId)) {
        expect.soft(svg, `${exerciseId} intentionally uses one same-scale figure`).not.toContain('data-pose="start"');
      } else {
        expect.soft(svg, `${exerciseId} has an overlaid start pose`).toContain('data-pose="start"');
      }

      const marker = svg.match(/<marker\b[^>]*id=["']motion-arrow["'][^>]*>/i)?.[0];
      expect.soft(marker, `${exerciseId} defines #motion-arrow`).toBeDefined();
      expect.soft(numericAttribute(marker, 'markerWidth'), `${exerciseId} markerWidth`).toBeGreaterThan(0);
      expect.soft(numericAttribute(marker, 'markerWidth'), `${exerciseId} markerWidth`).toBeLessThanOrEqual(5);
      expect.soft(numericAttribute(marker, 'markerHeight'), `${exerciseId} markerHeight`).toBeGreaterThan(0);
      expect.soft(numericAttribute(marker, 'markerHeight'), `${exerciseId} markerHeight`).toBeLessThanOrEqual(5);

      const movement = svg.match(
        /<(?:path|line|polyline)\b[^>]*marker-end=["']url\(#motion-arrow\)["'][^>]*>/i
      )?.[0];
      if (staticIds.has(exerciseId)) {
        expect.soft(movement, `${exerciseId} is a static hold without a false direction arrow`).toBeUndefined();
        continue;
      }
      expect.soft(movement, `${exerciseId} uses #motion-arrow on a movement path`).toBeDefined();
      expect.soft(numericAttribute(movement, 'stroke-width'), `${exerciseId} movement stroke-width`).toBeGreaterThan(0);
      expect.soft(numericAttribute(movement, 'stroke-width'), `${exerciseId} movement stroke-width`).toBeLessThanOrEqual(5);
    }
  });
});
