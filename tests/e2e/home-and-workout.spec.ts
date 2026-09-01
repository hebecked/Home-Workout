import { expect, test } from '@playwright/test';

test('home presents the default plan and all primary destinations', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Home Workout/i);
  await expect(page.getByRole('heading', { name: /30 Minute Full Body/i })).toBeVisible();
  await expect(page.getByText(/3\s+(rounds|Runden)/i)).toBeVisible();
  await expect(page.getByText(/8\s+(exercises|Übungen)/i)).toBeVisible();
  await expect(page.getByLabel(/choose routine|Routine wählen/i)).toHaveValue('30-minute-full-body');
  await expect(page.getByRole('button', { name: /start workout/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /instructions|Anleitung/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /create new plan|neuen Plan/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /upload|own plan|import/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /my plans|meine Pläne/i })).toBeVisible();
});

test('permanent bundled routines can be selected without replacing the default', async ({ page }) => {
  await page.goto('/');

  const picker = page.getByLabel(/choose routine|Routine wählen/i);
  await expect(picker.locator('option')).toHaveCount(6);
  await picker.selectOption('gentle-start');
  await expect(page.getByRole('heading', { name: 'Gentle Start', exact: true })).toBeVisible();
  await expect(page.getByText(/2\s+(rounds|Runden)/i)).toBeVisible();
  await expect(page.getByText(/6\s+(exercises|Übungen)/i)).toBeVisible();

  await picker.selectOption('30-minute-full-body');
  await expect(page.getByRole('heading', { name: /30 Minute Full Body/i })).toBeVisible();
  await expect(page.getByText(/3\s+(rounds|Runden)/i)).toBeVisible();
});

test('the app stays visibly light when the operating system prefers dark mode', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-phone', 'Chromium covers the color-scheme contract');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');

  const appearance = await page.locator('html').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      colorScheme: style.colorScheme,
      backgroundColor: style.backgroundColor,
      color: style.color
    };
  });

  expect(appearance).toStrictEqual({
    colorScheme: 'light',
    backgroundColor: 'rgb(247, 248, 251)',
    color: 'rgb(31, 41, 55)'
  });
});

test('phone workout journey shows bilingual exercise, controls, pause and rest', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-phone', 'Representative smartphone journey');
  await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') });
  await page.goto('/');
  await page.getByRole('button', { name: /start workout/i }).click();

  await expect(page.getByText(/Runde 1\s*\/\s*3|Round 1\s*\/\s*3/i)).toBeVisible();
  await expect(page.getByText(/Exercise 1\s*\/\s*8.*Übung 1\s*\/\s*8/i)).toBeVisible();
  await expect(page.getByRole('img', { name: /squat|Kniebeuge/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Kniebeuge', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Squat', exact: true })).toBeVisible();
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
  await expect(page.getByText(/Exercise 1\s*\/\s*8.*Übung 1\s*\/\s*8/i)).toBeVisible();
  await page.getByRole('button', { name: /next|weiter/i }).click();
  await expect(page.getByText(/Exercise 2\s*\/\s*8.*Übung 2\s*\/\s*8/i)).toBeVisible();
  const kneeOption = page.getByRole('button', { name: /Knee Push-up.*Knie-Liegestütz/i });
  await expect(kneeOption).toBeVisible();
  await kneeOption.click();
  await expect(kneeOption).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('img', { name: /Knee Push-up|Knie-Liegestütz/i })).toBeVisible();
});

test('workout actions remain anchored while exercise content scrolls independently', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-phone', 'Representative anchored mobile action bar check');
  await page.goto('/');
  await page.getByRole('button', { name: /start workout/i }).click();

  const actionBar = page.locator('.workout-actions');
  await expect(actionBar).toBeVisible();
  await expect(page.getByRole('button', { name: /previous|zurück/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /next|weiter/i })).toBeVisible();

  const initialY = (await actionBar.boundingBox())?.y;
  expect(initialY).toEqual(expect.any(Number));
  await page.locator('.workout-content').evaluate((element) => { element.scrollTop = element.scrollHeight; });
  const scrolledY = (await actionBar.boundingBox())?.y;
  expect(scrolledY).toEqual(expect.any(Number));
  expect(Math.abs(scrolledY! - initialY!)).toBeLessThanOrEqual(1);
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
