import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXERCISE_LIBRARY } from '../../src/data/exercises';

describe('exercise audit documentation', () => {
  it('contains one fully reviewed row for every bundled exercise', () => {
    const audit = readFileSync(resolve(process.cwd(), 'docs', 'exercise-audit.md'), 'utf8');
    const rows = audit.split(/\r?\n/).filter((line) => /^\| `[a-z0-9-]+` \|/.test(line));
    const documentedIds = rows.map((line) => line.match(/^\| `([a-z0-9-]+)` \|/)?.[1]);
    const libraryIds = EXERCISE_LIBRARY.map(({ id }) => id);

    expect(rows).toHaveLength(libraryIds.length);
    expect(new Set(documentedIds).size).toBe(documentedIds.length);
    expect(documentedIds.sort()).toEqual([...libraryIds].sort());
    for (const row of rows) expect(row).toMatch(/\| Reviewed \| Reviewed \| 2026-09-01 \|$/);
  });
});
