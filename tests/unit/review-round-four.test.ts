import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { CURRENT_REVIEW_ILLUSTRATIONS, illustrationRevision } from '../../src/data/illustration-revisions';

it('only requests a new Burpee review and retains accepted revision numbers', () => {
  expect([...CURRENT_REVIEW_ILLUSTRATIONS]).toEqual(['burpee']);
  expect(illustrationRevision('burpee')).toBe(6);
  expect(illustrationRevision('dead-bug')).toBe(3);
  for (const id of ['hip-circles', 'ankle-rocks', 'torso-rotations', 'bodyweight-good-morning', 'dynamic-lunge-reach', 'inchworm']) {
    expect(illustrationRevision(id)).toBe(8);
  }
  expect(illustrationRevision('squat')).toBe(2);
});

it('shows four separated Burpee phases in the existing palette without panels', () => {
  const svg = readFileSync('public/assets/exercises/burpee.svg', 'utf8');
  expect(svg).toContain('data-phase-labels="sequence"');
  expect(svg).not.toContain('data-phase-panels');
  expect(svg).toContain('Comic Sans');
  expect(svg).not.toContain('→');
  expect(svg).not.toContain('M146 169H174');
  [1, 2, 3, 4].forEach(number => {
    expect(svg).toContain(`data-burpee-phase="${number}"`);
    expect(svg).toContain(`>${number}</text>`);
  });
  expect(svg).not.toContain('#a72f32');
  expect(svg).not.toContain('#a65312');
});
