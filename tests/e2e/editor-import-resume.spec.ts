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

test('AI launch links are validated and open the import preview', async ({ page }) => {
  const payload = Buffer.from(JSON.stringify(importedPlan), 'utf8').toString('base64url');
  await page.goto(`/?plan=${payload}`);

  await expect(page).toHaveURL(/#import$/);
  expect(new URL(page.url()).search).toBe('');
  await expect(page.getByText(/AI plan loaded|KI-Plan geladen/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /preview|Vorschau/i })).toBeVisible();
  await expect(page.getByText('Plan corto')).toBeVisible();
  await expect(page.getByText('Sentadilla')).toBeVisible();
  await expect(page.getByRole('button', { name: /^start$|^starten$/i })).toBeVisible();
});

test('an invalid AI launch link is rejected safely and removed from the address bar', async ({ page }) => {
  const privateInput = 'private+launch-payload';
  await page.goto(`/?plan=${encodeURIComponent(privateInput)}`);

  await expect(page).toHaveURL(/#import$/);
  expect(new URL(page.url()).search).toBe('');
  await expect(page.getByRole('alert')).toHaveText(
    'The workout link is invalid. Ask the AI for a JSON config file instead.'
  );
  await expect(page.getByRole('alert')).not.toContainText(privateInput);
  await expect(page.getByRole('heading', { name: /preview|Vorschau/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^start$|^starten$/i })).toHaveCount(0);
});

test('instructions expose the deployed-origin AI guide link', async ({ page }) => {
  await page.goto('/#instructions');

  await expect(page.getByRole('heading', { name: /Let an AI prepare/i })).toBeVisible();
  await expect(page.locator('.copy-field code')).toHaveText('http://127.0.0.1:4173/ai-workout-guide.txt');
  await expect(page.getByRole('button', { name: /link kopieren/i })).toBeVisible();

  const guideResponse = await page.request.get('/ai-workout-guide.txt');
  expect(guideResponse.status()).toBe(200);
  await expect(guideResponse.text()).resolves.toContain(
    'BASE_URL/?plan=BASE64URL_UTF8_JSON#import'
  );
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
