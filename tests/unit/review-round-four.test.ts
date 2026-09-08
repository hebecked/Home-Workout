import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { CURRENT_REVIEW_ILLUSTRATIONS, illustrationRevision } from '../../src/data/illustration-revisions';

it('only requests a new Burpee review and retains accepted revision numbers', () => {
  expect([...CURRENT_REVIEW_ILLUSTRATIONS]).toEqual(['burpee']);
  expect(illustrationRevision('burpee')).toBe(5);
  expect(illustrationRevision('dead-bug')).toBe(3);
  expect(illustrationRevision('squat')).toBe(2);
});

it('overlays four Burpee phases with matching rounded labels and no panels', () => {
  const svg = readFileSync('public/assets/exercises/burpee.svg', 'utf8');
  expect(svg).toContain('data-phase-labels="overlaid"');
  expect(svg).not.toContain('data-phase-panels');
  expect(svg).toContain('Comic Sans');
  expect(svg).not.toContain('→');
  expect(svg).not.toContain('M146 169H174');
  ['#18233a', '#667085', '#a72f32', '#a65312'].forEach((color, index) => {
    expect(svg).toContain(`data-burpee-phase="${index + 1}" stroke="${color}"`);
    expect(svg).toContain(`fill="${color}">${index + 1}</text>`);
  });
});
