import { expect, test } from '@playwright/test';

test('home exposes custom plans and editor offers AI guidance without leaving the draft', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.plan-options .action-card')).toHaveCount(4);
  expect(await page.locator('.plan-options .action-card').evaluateAll(cards => new Set(cards.map(card => { const style = getComputedStyle(card); return style.borderColor + style.borderWidth; })).size)).toBe(1);
  await expect(page.locator('.start-button')).toHaveText(/start workout/i);
  await expect(page.locator('.start-button')).toHaveCSS('justify-content', 'center');
  const create = page.locator('.create-plan-button');
  await expect(create).toBeVisible();
  await create.click();
  await expect(page.locator('[data-editor]')).toBeVisible();
  const guide = page.locator('.editor-ai-callout a');
  await page.locator('[name="name-en"]').fill('My unfinished workout');
  const pageCount = context.pages().length;
  await guide.click();
  await expect(page.locator('.ai-plan-guide')).toBeVisible();
  await expect(page).toHaveURL(/#instructions$/);
  expect(context.pages()).toHaveLength(pageCount);
  await page.goBack();
  await expect(page).toHaveURL(/#editor$/);
  await expect(page.locator('[name="name-en"]')).toHaveValue('My unfinished workout');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
