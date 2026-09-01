import { expect, test, type Locator, type Page } from '@playwright/test';

async function pressAcrossRenderTick(page: Page, control: Locator): Promise<void> {
  await expect(control).toBeVisible();
  await control.scrollIntoViewIfNeeded();
  const box = await control.boundingBox();
  expect(box, 'control must have a rendered hit target').not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  // A normal long tap may straddle the 500 ms workout render tick. The control
  // must not disappear between pointerdown and pointerup and lose the action.
  await page.clock.runFor(550);
  await page.mouse.up();
}

test('workout controls remain reliable while the render timer is running', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-phone', 'Representative touch-control regression');
  await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') });
  await page.goto('/');
  await page.getByRole('button', { name: /start workout/i }).click();

  await expect(page.getByText(/^Squat$/i)).toBeVisible();
  await pressAcrossRenderTick(page, page.getByRole('button', { name: /next|weiter/i }));
  await expect(page.locator('.phase-pill')).toHaveText(/rest|pause/i);

  // Move the timestamp beyond the configured 20-second rest, then allow one
  // render tick to settle the state machine onto the next exercise.
  await page.clock.setSystemTime(new Date('2026-01-01T12:00:21Z'));
  await page.clock.runFor(550);
  await expect(page.getByText(/^Push-up$/i)).toBeVisible();

  await pressAcrossRenderTick(page, page.getByRole('button', { name: /^pause$/i }));
  await expect(page.getByText(/paused|pausiert/i)).toBeVisible();
  await pressAcrossRenderTick(page, page.getByRole('button', { name: /resume|fortsetzen/i }));
  await expect(page.getByText(/paused|pausiert/i)).toHaveCount(0);

  await expect(page.getByLabel(/repetition counter/i)).toHaveCount(0);
  await expect(page.locator('[data-workout-total]')).toContainText(/Total\s+00:/i);

  await pressAcrossRenderTick(page, page.getByRole('button', { name: /previous|zurück/i }));
  await expect(page.getByText(/^Squat$/i)).toBeVisible();
});

test('Next skips an active rest and repetition targets do not render a tap counter', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-phone', 'Representative rest-skip and target journey');
  await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') });
  await page.goto('/');
  await page.getByRole('button', { name: /start workout/i }).click();

  await page.getByRole('button', { name: /next|weiter/i }).click();
  await expect(page.locator('.phase-pill')).toHaveText(/rest|pause/i);
  await expect(page.getByText(/00:20/)).toBeVisible();

  await page.getByRole('button', { name: /next|weiter/i }).click();
  await expect(page.getByText(/^Push-up$/i)).toBeVisible();
  await expect(page.getByText(/rest|pause/i)).toHaveCount(0);

  await expect(page.getByText(/6–15/)).toBeVisible();
  await expect(page.getByLabel(/repetition counter/i)).toHaveCount(0);
  await expect(page.locator('[data-workout-total]')).toBeVisible();
});
