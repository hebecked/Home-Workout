import { expect, test } from '@playwright/test';

test('offers all 16 interface languages and persists the selection', async ({ page }) => {
  await page.goto('/');

  const picker = page.getByLabel('Interface language');
  await expect(picker.locator('option')).toHaveCount(16);
  await picker.selectOption('de');

  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { name: '30 Minuten Ganzkörper' })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Sprache der Benutzeroberfläche')).toHaveValue('de');
});

test('applies Arabic copy and right-to-left document direction together', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Interface language').selectOption('ar');

  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('button', { name: 'بدء التمرين' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'خططي' })).toBeVisible();
});

test('keeps interface and two training languages independent', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Interface language').selectOption('hi');
  await page.getByRole('button', { name: 'वर्कआउट शुरू करें' }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  await expect(page.getByRole('button', { name: 'अगला' })).toBeVisible();
  const exerciseImage = page.locator('.exercise-visual img');
  await expect(exerciseImage).toHaveAttribute('alt', /Marching/i);
  await expect(exerciseImage).toHaveAttribute('alt', /Marschieren/i);
  await expect(page.locator('.translation')).toHaveCount(2);
});

test('offers all supported training languages while enforcing a maximum of two', async ({ page }) => {
  await page.goto('/#editor');

  const choices = page.locator('[data-display-language]');
  await expect(choices).toHaveCount(16);
  await page.locator('[data-display-language="de"]').uncheck();
  await page.locator('[data-display-language="hi"]').check();

  await expect(page.locator('[data-display-language="en"]')).toBeChecked();
  await expect(page.locator('[data-display-language="hi"]')).toBeChecked();
  await expect(page.locator('[data-display-language]:checked')).toHaveCount(2);
});
test('removes deselected plan languages and uses the selected language for exercise names', async ({ page }) => {
  await page.goto('/#editor');

  await page.locator('[data-display-language="de"]').uncheck();
  await page.locator('[data-display-language="hi"]').check();
  await page.locator('[data-display-language="en"]').uncheck();

  await expect(page.locator('[name="name-en"]')).toHaveCount(0);
  await expect(page.locator('[name="name-de"]')).toHaveCount(0);
  await expect(page.locator('[name="name-hi"]')).toHaveCount(1);

  const trainingPhase = page.locator('.phase-editor[data-phase="training"]');
  await trainingPhase.getByRole('button', { name: 'Add exercise' }).click();
  const picker = page.locator('select[name="exercise-library"]');
  await expect(picker.locator('option[value="squat"]')).toHaveText('स्क्वाट');
  await picker.selectOption('squat');
  await page.getByRole('button', { name: 'Add selected' }).click();

  await expect(trainingPhase.locator('.exercise-row-main strong')).toHaveText('स्क्वाट');
  await trainingPhase.getByText('Edit translations').click();
  await expect(trainingPhase.locator('.translation-editor fieldset')).toHaveCount(1);
  await expect(trainingPhase.locator('.translation-editor legend')).toHaveText(/हिन्दी \(hi\)/);
});
