import { expect, test, type Locator, type Page } from '@playwright/test';

async function pressAcrossRenderTick(page: Page, control: Locator): Promise<void> {
  await expect(control).toBeVisible();
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
  await expect(page.getByText(/rest|pause/i)).toBeVisible();

  // Move the timestamp beyond the configured 20-second rest, then allow one
  // render tick to settle the state machine onto the next exercise.
  await page.clock.setSystemTime(new Date('2026-01-01T12:00:21Z'));
  await page.clock.runFor(550);
  await expect(page.getByText(/^Push-up$/i)).toBeVisible();

  await pressAcrossRenderTick(page, page.getByRole('button', { name: /^pause$/i }));
  await expect(page.getByText(/paused|pausiert/i)).toBeVisible();
  await pressAcrossRenderTick(page, page.getByRole('button', { name: /resume|fortsetzen/i }));
  await expect(page.getByText(/paused|pausiert/i)).toHaveCount(0);

  const counter = page.getByLabel(/repetition counter/i);
  const output = counter.locator('output');
  await expect(output).toHaveText('6');
  await pressAcrossRenderTick(page, counter.getByRole('button', { name: /increase repetitions/i }));
  await expect(output).toHaveText('7');
  await pressAcrossRenderTick(page, counter.getByRole('button', { name: /decrease repetitions/i }));
  await expect(output).toHaveText('6');

  await pressAcrossRenderTick(page, page.getByRole('button', { name: /previous|zurück/i }));
  await expect(page.getByText(/^Squat$/i)).toBeVisible();
});
