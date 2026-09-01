import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Cloudflare Pages translation configuration', () => {
  it('binds Workers AI and limits Functions to the API route', () => {
    const wrangler = JSON.parse(readFileSync(resolve(process.cwd(), 'wrangler.jsonc'), 'utf8')) as {
      name: string;
      pages_build_output_dir: string;
      ai: { binding: string };
    };
    const routes = JSON.parse(readFileSync(resolve(process.cwd(), 'public', '_routes.json'), 'utf8')) as {
      version: number;
      include: string[];
      exclude: string[];
    };

    expect(wrangler).toMatchObject({
      name: 'home-workout',
      pages_build_output_dir: './dist',
      ai: { binding: 'AI' }
    });
    expect(routes).toStrictEqual({ version: 1, include: ['/api/*'], exclude: [] });
  });
});
