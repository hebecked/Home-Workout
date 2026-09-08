import { expect, test } from '@playwright/test';
import { EXERCISE_LIBRARY } from '../../src/data/exercises';
import { CURRENT_REVIEW_ILLUSTRATIONS } from '../../src/data/illustration-revisions';

test('old feedback survives the revised review and only current decisions finish the round', async ({ page }) => {
  await page.goto('/#review');
  await page.evaluate((ids) => localStorage.setItem('home-workout:illustration-reviews', JSON.stringify(ids.map(exerciseId => ({ exerciseId, status: 'confirmed', comment: 'Old feedback', reviewedAt: '2026-09-07' })))), EXERCISE_LIBRARY.map(e => e.id));
  await page.reload();
  await expect(page.getByRole('heading', { name: '1 / 1' })).toBeVisible();
  await expect(page.locator('textarea')).toHaveValue('');
  await page.getByRole('button', { name: 'Next · Weiter' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Review complete' })).toBeVisible();
  const reviews = JSON.parse(await page.evaluate(() => localStorage.getItem('home-workout:illustration-reviews')) ?? '[]') as { exerciseId: string; revision?: number }[];
  expect(reviews.filter(r => r.exerciseId === 'burpee')).toHaveLength(2);
  await page.evaluate((ids) => {
    const old = JSON.parse(localStorage.getItem('home-workout:illustration-reviews') ?? '[]') as unknown[];
    localStorage.setItem('home-workout:illustration-reviews', JSON.stringify([...old, ...ids.map(exerciseId => ({ exerciseId, revision: 5, status: 'confirmed', comment: '', reviewedAt: '2026-09-08' }))]));
  }, [...CURRENT_REVIEW_ILLUSTRATIONS]);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Review complete' })).toBeVisible();
  await expect(page.getByText('Alle Bilder dieser Runde sind abgenommen.', { exact: false })).toBeVisible();
});

test('target follows image without being covered by workout controls', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /start workout/i }).click();
  const image = await page.locator('.exercise-visual').boundingBox();
  const target = await page.locator('.target-block').boundingBox();
  const actions = await page.locator('.workout-actions').boundingBox();
  expect(image).not.toBeNull(); expect(target).not.toBeNull(); expect(actions).not.toBeNull();
  expect(target!.y).toBeGreaterThanOrEqual(image!.y + image!.height - 1);
  expect(target!.y + target!.height).toBeLessThanOrEqual(actions!.y);
  for (const button of await page.locator('.workout-actions button').all()) {
    const box = await button.boundingBox(); expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test('legal notice is reachable and skip link retains the route', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await page.getByRole('link', { name: 'Impressum', exact: true }).click();
  await expect(page.locator('address')).toContainText('Dr. Dustin Hebecker');
  await expect(page.locator('address')).toContainText('Dr. Dustin Hebecker');
  await expect(page.getByRole('heading', { name: 'Nutzung auf eigene Verantwortung' })).toBeVisible();
  await expect(page.getByRole('link', { name: /öffentliche Feedback- und Fehlerforum/ })).toHaveAttribute('href', 'https://github.com/hebecked/Home-Workout/issues');
  await expect(page.locator('#main')).toContainText('Dieser Hinweis schließt gesetzliche Haftungsansprüche nicht aus.');
  await expect(page.locator('.skip-link')).toHaveCount(1);
  await page.locator('.skip-link').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#impressum$/);
  await expect(page.locator('#main')).toBeFocused();
});

test('legal notice loads offline from the installed app shell', async ({ page, context, browserName }) => {
  test.skip(process.platform === 'win32' && browserName === 'webkit', 'Windows WebKit offline reload fails internally after a verified active service worker; retest on Safari/Linux WebKit.');
  await page.goto('/#impressum');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await page.waitForFunction(async () => {
    const assets = [...document.querySelectorAll<HTMLScriptElement>('script[src]')].map(script => script.src);
    return (await Promise.all(assets.map(url => caches.match(url)))).every(Boolean);
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('address')).toContainText('Dr. Dustin Hebecker');
});

test('targets remain visible on short and narrow screens', async ({ page }) => {
  for (const [width, height] of [[320, 568], [844, 390], [1280, 800]]) {
    await page.setViewportSize({ width: width!, height: height! });
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('button', { name: /start workout/i }).click();
    await expect(page).toHaveURL(/#workout$/);
    await expect(page.locator('.target-block')).toBeVisible();
    await expect.poll(() => page.evaluate(() => {
      const selectors = ['.target-block', '.workout-actions', '.workout-exercise-heading', '.exercise-visual', '.site-header'];
      const boxes = selectors.map(s => document.querySelector(s)?.getBoundingClientRect());
      if (boxes.some(box => !box)) return false;
      const [target, actions, names, image, header] = boxes;
      return scrollY === 0 && document.documentElement.scrollWidth <= innerWidth
        && header!.top >= 0 && names!.top >= 0 && names!.bottom <= image!.top
        && target!.bottom <= actions!.top && target!.right <= innerWidth
        && actions!.bottom <= innerHeight;
    }), { message: `${width}x${height}: names, targets and controls fit` }).toBe(true);
    await expect(page.locator('.workout-exercise-heading h2')).toHaveCount(2);
    await expect(page.locator('.site-header [data-action="abort"]')).toBeVisible();
    await expect(page.locator('.workout-actions [data-action="abort"]')).toHaveCount(0);
  }
});
