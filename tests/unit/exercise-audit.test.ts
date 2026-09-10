import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXERCISE_LIBRARY } from '../../src/data/exercises';
import { REVISED_ILLUSTRATIONS, CURRENT_REVIEW_ILLUSTRATIONS } from '../../src/data/illustration-revisions';

describe('exercise audit documentation', () => {
  it('tracks every exercise and contains no illustration still pending owner approval', () => {
    const audit = readFileSync(resolve(process.cwd(), 'docs', 'exercise-audit.md'), 'utf8');
    const rows = audit.split(/\r?\n/).filter((line) => /^\| `[a-z0-9-]+` \|/.test(line));
    const documentedIds = rows.map((line) => line.match(/^\| `([a-z0-9-]+)` \|/)?.[1]);
    const libraryIds = EXERCISE_LIBRARY.map(({ id }) => id);

    expect(rows).toHaveLength(libraryIds.length);
    expect(new Set(documentedIds).size).toBe(documentedIds.length);
    expect(documentedIds.sort()).toEqual([...libraryIds].sort());
    expect(CURRENT_REVIEW_ILLUSTRATIONS.size).toBe(0);
    for (const row of rows) {
      const id = row.match(/^\| `([a-z0-9-]+)` \|/)![1]!;
      expect(row).toContain(REVISED_ILLUSTRATIONS.has(id) ? '| Reviewed | Owner confirmed |' : '| Reviewed | Reviewed |');
    }
  });
});
