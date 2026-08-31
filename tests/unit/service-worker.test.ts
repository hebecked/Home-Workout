import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const serviceWorker = readFileSync(
  resolve(process.cwd(), 'public', 'service-worker.js'),
  'utf8'
);

describe('service worker update strategy', () => {
  it('does not precache navigation documents in APP_SHELL', () => {
    const declaration = serviceWorker.match(/const APP_SHELL\s*=\s*\[([^\]]*)\]/)?.[1];
    expect(declaration, 'APP_SHELL declaration exists').toBeDefined();
    const entries = [...declaration!.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]);

    expect(entries).not.toContain('/');
    expect(entries).not.toContain('/index.html');
    expect(entries).toEqual(expect.arrayContaining([
      '/manifest.webmanifest',
      '/icon.svg',
      '/maskable-icon.svg',
      '/ai-workout-guide.txt'
    ]));
  });

  it('handles navigations network-first with cached index only as an offline fallback', () => {
    const navigationBranch = serviceWorker.match(
      /if\s*\(event\.request\.mode\s*===\s*["']navigate["']\)\s*\{([\s\S]*?)\n\s*return;\s*\n\s*\}/
    )?.[1];
    expect(navigationBranch, 'navigation fetch branch exists').toBeDefined();

    const networkFetch = navigationBranch!.indexOf('fetch(event.request)');
    const cacheFallback = navigationBranch!.indexOf("caches.match('/index.html')");
    expect(networkFetch).toBeGreaterThanOrEqual(0);
    expect(cacheFallback).toBeGreaterThan(networkFetch);
    expect(navigationBranch).not.toContain('caches.match(event.request)');
  });
});
