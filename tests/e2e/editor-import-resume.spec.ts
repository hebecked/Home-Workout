import { expect, test } from '@playwright/test';

const importedPlan = {
  schemaVersion: 1,
  id: 'e2e-es-plan',
  languages: [{ code: 'es', label: 'Español' }],
  name: { es: 'Plan corto' },
  displayLanguages: ['es'],
  rounds: 1,
  restBetweenExercises: 10,
  restBetweenRounds: 30,
  exercises: [{
    id: 'slot-squat',
    exerciseId: 'squat',
    type: 'repetitions',
    target: { min: 8, max: 10, unit: 'repetitions' },
    translations: { es: { name: 'Sentadilla', instructions: 'Baja con control.' } },
    alternativeExerciseIds: []
  }]
};

test('desktop editor creates, orders and saves a multilingual plan', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'firefox-desktop', 'Representative editor journey');
  await page.goto('/');
  await page.getByRole('link', { name: /create new plan|neuen Plan/i }).click();

  await page.getByLabel(/plan name.*English|English.*plan name/i).fill('Compact Strength');
  await page.getByRole('button', { name: /add language|Sprache hinzufügen/i }).click();
  await page.getByLabel(/language code|Sprachcode/i).fill('fr');
  await page.getByLabel(/language label|Sprachname/i).fill('Français');
  await page.getByRole('button', { name: /add exercise|Übung hinzufügen/i }).click();
  await page.getByRole('option', { name: /squat|Kniebeuge/i }).click();
  await page.getByRole('button', { name: /add selected|Auswahl hinzufügen/i }).click();

  await expect(page.getByText(/squat|Kniebeuge/i)).toBeVisible();
  await page.getByRole('button', { name: /save locally|lokal speichern/i }).click();
  await expect(page.getByText(/saved|gespeichert/i)).toBeVisible();

  await page.getByRole('link', { name: /my plans|meine Pläne/i }).click();
  await expect(page.getByText('Compact Strength')).toBeVisible();
});

test('tablet imports, previews, and starts a valid own plan', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-tablet', 'Representative file import journey');
  await page.goto('/');
  await page.getByRole('link', { name: /upload|own plan|import/i }).click();

  await page.getByLabel(/JSON file|JSON-Datei|choose file|Datei auswählen/i).setInputFiles({
    name: 'plan-corto.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(importedPlan))
  });

  await expect(page.getByRole('heading', { name: /preview|Vorschau/i })).toBeVisible();
  await expect(page.getByText('Plan corto')).toBeVisible();
  await expect(page.getByText('Sentadilla')).toBeVisible();
  await page.getByRole('button', { name: /^start$|^starten$/i }).click();
  await expect(page.getByText('Sentadilla')).toBeVisible();
});

test('invalid imports show a useful error and never offer start', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'firefox-desktop', 'One browser covers validation integration');
  await page.goto('/');
  await page.getByRole('link', { name: /upload|own plan|import/i }).click();
  await page.getByLabel(/JSON file|JSON-Datei|choose file|Datei auswählen/i).setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"schemaVersion":1,"rounds":0}')
  });

  await expect(page.getByRole('alert')).toContainText(/invalid|ungültig|round|Runde/i);
  await expect(page.getByRole('button', { name: /^start$|^starten$/i })).toHaveCount(0);
});

test('reload offers resume or start over and resume keeps progress', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-phone', 'Representative persistence journey');
  await page.goto('/');
  await page.getByRole('button', { name: /start workout/i }).click();
  await page.getByRole('button', { name: /next|weiter/i }).click();
  await page.reload();

  const prompt = page.getByRole('dialog', { name: /resume workout|Workout fortsetzen/i });
  await expect(prompt).toBeVisible();
  await prompt.getByRole('button', { name: /resume|fortsetzen/i }).click();
  await expect(page.getByText(/rest|pause/i)).toBeVisible();

  await page.reload();
  await page.getByRole('dialog', { name: /resume workout|Workout fortsetzen/i })
    .getByRole('button', { name: /start over|neu starten/i }).click();
  await expect(page.getByText(/Runde 1\s*\/\s*3|Round 1\s*\/\s*3/i)).toBeVisible();
  await expect(page.getByText(/rest|pause/i)).toHaveCount(0);
});
