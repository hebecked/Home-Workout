import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { CURRENT_REVIEW_ILLUSTRATIONS, illustrationRevision } from '../../src/data/illustration-revisions';

it('only requests a new Burpee review and retains accepted revision numbers', () => {
  expect([...CURRENT_REVIEW_ILLUSTRATIONS]).toEqual(['burpee']);
  expect(illustrationRevision('burpee')).toBe(4);
  expect(illustrationRevision('dead-bug')).toBe(3);
  expect(illustrationRevision('squat')).toBe(2);
});

it('separates stationary Burpee panels with matching phase colors and no horizontal arrow', () => {
  const svg = readFileSync('public/assets/exercises/burpee.svg', 'utf8');
  expect(svg).toContain('data-phase-panels="stationary"');
  expect(svg).toContain('data-ground="separate-panels"');
  expect(svg).not.toContain('→');
  expect(svg).not.toContain('M146 169H174');
  for (const number of [1, 3]) expect(svg).toContain(`fill="#18233a">${number}</text>`);
  for (const number of [2, 4]) expect(svg).toContain(`fill="hsl(4 42% 76%)">${number}</text>`);
});
