import { expect, test } from '@playwright/test';

test('home exposes custom plans and editor offers AI guidance without leaving the draft', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.plan-options .action-card')).toHaveCount(4);
  const create = page.locator('.create-plan-button');
  await expect(create).toBeVisible();
  await create.click();
  await expect(page.locator('[data-editor]')).toBeVisible();
  const guide = page.locator('.editor-ai-callout a');
  await expect(guide).toHaveAttribute('target', '_blank');
  const newPage = context.waitForEvent('page');
  await guide.click();
  const instructions = await newPage;
  await expect(instructions.locator('.ai-plan-guide')).toBeVisible();
  await expect(page).toHaveURL(/#editor$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
