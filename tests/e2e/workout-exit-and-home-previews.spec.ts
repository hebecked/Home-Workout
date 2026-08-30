import { expect, test, type Page } from '@playwright/test';

const exitDialogName = /end workout|training beenden|workout abbrechen/i;

async function startWorkout(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: /start workout/i }).click();
  await expect(page.getByText(/Runde 1\s*\/\s*3|Round 1\s*\/\s*3/i)).toBeVisible();
}

async function confirmWorkoutExit(page: Page): Promise<void> {
  const confirmation = page.getByRole('dialog', { name: exitDialogName });
  await expect(confirmation).toBeVisible();
  await expect(confirmation.getByRole('button', { name: /cancel|abbrechen|keep workout|training fortsetzen/i })).toBeVisible();
  await confirmation.getByRole('button', {
    name: /^(end workout|training beenden|workout abbrechen|beenden)$/i
  }).click();
  await expect(page.getByRole('button', { name: /start workout/i })).toBeVisible();
  await expect(page.getByText(/Runde 1\s*\/\s*3|Round 1\s*\/\s*3/i)).toHaveCount(0);
}

test('a running workout has a clearly visible confirmed exit action that returns home', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-phone', 'Representative smartphone exit journey');
  await startWorkout(page);

  const exitButton = page.getByRole('button', { name: exitDialogName });
  await expect(exitButton).toBeVisible();
  await expect(exitButton).toBeEnabled();
  await exitButton.click();

  await confirmWorkoutExit(page);
});

test('clicking the Home Workout brand during a workout uses the same confirmation flow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-phone', 'Representative smartphone brand-navigation journey');
  await startWorkout(page);

  await page.getByRole('link', { name: /^Home Workout$/i }).click();

  await confirmWorkoutExit(page);
});

test('home shows multiple visible exercise previews backed by local SVG assets', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-phone', 'One browser is sufficient for static local previews');
  await page.goto('/');

  const previews = page.locator('img[src^="/assets/exercises/"][src$=".svg"]:visible');
  expect(await previews.count()).toBeGreaterThanOrEqual(3);

  for (const preview of (await previews.all()).slice(0, 3)) {
    await expect(preview).toBeVisible();
    await expect(preview).toHaveAttribute('alt', /\S+/);
    await expect(preview).toHaveJSProperty('complete', true);
    expect(await preview.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  }
});
