import { expect, test } from '@playwright/test';

test('home presents the default plan and all primary destinations', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Home Workout/i);
  await expect(page.getByText(/30 Minute Full Body/i)).toBeVisible();
  await expect(page.getByText(/3\s+(rounds|Runden)/i)).toBeVisible();
  await expect(page.getByText(/8\s+(exercises|Übungen)/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /start workout/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /instructions|Anleitung/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /create new plan|neuen Plan/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /upload|own plan|import/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /my plans|meine Pläne/i })).toBeVisible();
});

test('phone workout journey shows bilingual exercise, controls, pause and rest', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-phone', 'Representative smartphone journey');
  await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') });
  await page.goto('/');
  await page.getByRole('button', { name: /start workout/i }).click();

  await expect(page.getByText(/Runde 1\s*\/\s*3|Round 1\s*\/\s*3/i)).toBeVisible();
  await expect(page.getByRole('img', { name: /squat|Kniebeuge/i })).toBeVisible();
  await expect(page.getByText(/Kniebeuge/i)).toBeVisible();
  await expect(page.getByText(/^Squat$/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /previous|zurück/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /next|weiter/i })).toBeVisible();

  await page.getByRole('button', { name: /pause/i }).click();
  await expect(page.getByRole('button', { name: /resume|fortsetzen/i })).toBeVisible();
  await page.clock.fastForward(60_000);
  await expect(page.getByText(/paused|pausiert/i)).toBeVisible();
  await page.getByRole('button', { name: /resume|fortsetzen/i }).click();
  await page.getByRole('button', { name: /next|weiter/i }).click();
  await expect(page.getByText(/rest|pause/i)).toBeVisible();
});

test('touch controls meet the minimum 44 by 44 pixel target on tablet', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-tablet', 'Representative tablet accessibility check');
  await page.goto('/');
  await page.getByRole('button', { name: /start workout/i }).click();

  for (const control of await page.getByRole('button', { name: /previous|zurück|pause|next|weiter/i }).all()) {
    const box = await control.boundingBox();
    expect(box, 'control has a rendered box').not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});
