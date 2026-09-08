import { expect, test } from '@playwright/test';

test('safety guidance is visible and the retired review does not erase local feedback', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.home-safety')).toContainText('Schmerzen');
  await expect(page.locator('a[href="#review"]')).toHaveCount(0);
  await page.evaluate(() => localStorage.setItem('home-workout:illustration-reviews', '[]'));
  await page.goto('/#review');
  await expect(page.locator('.workout-card')).toBeVisible();
  await expect(page.locator('[data-illustration-review]')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('home-workout:illustration-reviews'))).toBe('[]');
  await page.locator('.create-plan-button').click();
  await expect(page.locator('.editor-ai-callout .ai-safety-note')).toContainText('keine gesundheitliche Freigabe');
  await page.locator('[data-open-ai-guide]').click();
  await expect(page.locator('.ai-plan-guide .ai-safety-note')).toContainText('Gesetzliche Haftungsansprüche bleiben unberührt');
  await expect(page.locator('.instruction-list article')).toHaveCount(10);
  const offline = page.locator('.instruction-list article').filter({ has: page.getByRole('heading', { name: 'Offline', exact: true }) });
  await expect(offline.locator('.instruction-list article')).toHaveCount(0);
  await expect(offline.locator('xpath=preceding-sibling::article')).toHaveCount(9);
  await expect(offline).toContainText('designed as a web app');
  await expect(offline).toContainText('Install the app:');
  await expect(offline.getByRole('link', { name: 'Apple instructions' })).toHaveAttribute('href', 'https://support.apple.com/guide/iphone/bookmark-a-website-iphea86e5236/ios');
  const guide = await page.request.get('/ai-workout-guide.txt');
  expect(await guide.text()).toContain('not medical or health suitability');
  expect(await guide.text()).toContain('statutory liability rights');
  expect(await guide.text()).toContain('warm-up: heel-dig');
  expect(await guide.text()).toContain('stretch: calf-stretch');
});
