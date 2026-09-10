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
  await page.locator('[data-display-language="de"]').uncheck();
  await page.locator('[data-display-language="fr"]').check();
  await page.getByLabel(/plan name.*Français/i).fill('Force compacte');
  const trainingPhase = page.locator('.phase-editor[data-phase="training"]');
  await trainingPhase.getByRole('button', { name: /add exercise|Übung hinzufügen/i }).click();
  const picker = page.locator('select[name="exercise-library"]');
  await expect(picker).toBeVisible();
  const categoryGroups = await picker.evaluate((select) => Array.from(select.querySelectorAll('optgroup')).map((group) => ({
    label: group.label,
    options: Array.from(group.querySelectorAll('option')).map((option) => option.textContent ?? '')
  })));
  expect(categoryGroups.map((group) => group.label)).toEqual([
    'Warm-up', 'Cardio', 'Full body', 'Legs', 'Push', 'Pull', 'Core', 'Stretching'
  ]);
  const legOptions = categoryGroups.find((group) => group.label === 'Legs')?.options ?? [];
  expect(legOptions).toEqual([...legOptions].sort((left, right) => left.localeCompare(right, 'en', { sensitivity: 'base' })));
  await page.locator('select[name="exercise-library"]').selectOption('squat');
  await page.getByRole('button', { name: /add selected|Auswahl hinzufügen/i }).click();

  await trainingPhase.getByText(/edit translations|Übersetzungen bearbeiten/i).click();
  await trainingPhase.locator('.translation-editor input[name$="-fr-name"]').fill('Squat français');
  await trainingPhase.locator('.translation-editor textarea[name$="-fr-instructions"]').fill('Pliez les genoux et gardez les pieds au sol.');

  await expect(trainingPhase.locator('.exercise-row-main strong')).toHaveText('Squat');
  await trainingPhase.getByLabel('Minimum', { exact: true }).fill('14');
  await trainingPhase.getByLabel('Maximum', { exact: true }).fill('18');
  await page.getByRole('button', { name: /save locally|lokal speichern/i }).click();
  await expect(page.getByText(/saved|gespeichert/i)).toBeVisible();

  const savedPlansRaw = await page.evaluate(() => localStorage.getItem('home-workout:plans') ?? '[]');
  const savedPlans = JSON.parse(savedPlansRaw) as Array<{
    name: Record<string, string>;
    schemaVersion: number;
    phases: Array<{ kind: string; exercises: Array<{ translations: Record<string, { name: string; instructions: string }> }> }>;
  }>;
  expect(savedPlans[0]).toEqual(expect.objectContaining({
    schemaVersion: 2,
    name: expect.objectContaining({ fr: 'Force compacte' }),
    phases: expect.arrayContaining([expect.objectContaining({ kind: 'training', exercises: [expect.objectContaining({
      translations: expect.objectContaining({ fr: { name: 'Squat français', instructions: 'Pliez les genoux et gardez les pieds au sol.' } })
    })] })])
  }));

  await page.getByRole('link', { name: /my plans|meine Pläne/i }).click();
  await expect(page.getByText('Compact Strength')).toBeVisible();
  await expect(page.getByRole('heading', { name: '30 Minute Full Body' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Gentle Start' })).toBeVisible();

  const localCard = page.locator('.plan-card').filter({ hasText: 'Compact Strength' });
  await localCard.getByRole('button', { name: /edit|bearbeiten/i }).click();
  await expect(page.getByRole('heading', { name: /edit plan|Plan bearbeiten/i })).toBeVisible();
  const editedTraining = page.locator('.phase-editor[data-phase="training"]');
  await expect(editedTraining.getByLabel('Minimum', { exact: true })).toHaveValue('14');
  await expect(editedTraining.getByLabel('Maximum', { exact: true })).toHaveValue('18');
  await editedTraining.getByLabel('Rounds', { exact: true }).fill('2');
  await page.getByRole('button', { name: /save changes|Änderungen speichern/i }).click();
  await page.getByRole('link', { name: /my plans|meine Pläne/i }).click();
  await expect(page.locator('.plan-card').filter({ hasText: 'Compact Strength' })).toContainText(/4 rounds/i);
  await expect(page.locator('.plan-card').filter({ hasText: '30 Minute Full Body' })).toContainText(/permanent bundled routine/i);

  const updatedCard = page.locator('.plan-card').filter({ hasText: 'Compact Strength' }).first();
  await updatedCard.getByRole('button', { name: /duplicate|duplizieren/i }).click();
  const copyCard = page.locator('.plan-card').filter({ hasText: 'Compact Strength · Copy' });
  await expect(copyCard).toBeVisible();
  await copyCard.getByRole('button', { name: /delete|löschen/i }).click();
  const deleteDialog = page.getByRole('dialog');
  await expect(deleteDialog).toBeVisible();
  await deleteDialog.getByRole('button', { name: /^delete$|^Plan löschen$/i }).click();
  await expect(copyCard).toHaveCount(0);
  await expect(page.getByText(/Plan deleted|Plan gelöscht/i)).toBeVisible();
});

test('machine translation explains the transfer and requires explicit review before saving', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'firefox-desktop', 'Representative translation-review journey');
  await page.route('**/api/translate', async (route) => {
    const request = route.request().postDataJSON() as {
      consent: boolean;
      items: Array<{ id: string; text: string }>;
    };
    expect(request.consent).toBe(true);
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        provider: 'cloudflare-m2m100-1.2b',
        translations: request.items.map(({ id, text }) => ({ id, text: `FR ${text}` }))
      })
    });
  });
  await page.goto('/#editor');
  await page.getByLabel(/plan name.*English|English.*plan name/i).fill('Translation Test');
  await page.locator('[data-display-language="de"]').uncheck();
  await page.locator('[data-display-language="fr"]').check();
  await page.locator('.phase-editor[data-phase="training"]').getByRole('button', { name: /add exercise|Übung hinzufügen/i }).click();
  await page.locator('select[name="exercise-library"]').selectOption('squat');
  await page.getByRole('button', { name: /add selected|Auswahl hinzufügen/i }).click();

  await expect(page.getByText(/sent to Cloudflare, an external service provider/i)).toBeVisible();
  await page.getByRole('button', { name: /translate draft/i }).click();
  await expect(page.getByLabel(/plan name.*Français/i)).toHaveValue('FR Translation Test');
  await expect(page.getByText(/review required before saving/i)).toBeVisible();

  await page.getByRole('button', { name: /save locally|lokal speichern/i }).click();
  await expect(page.getByRole('status')).toContainText(/review and confirm/i);
  await page.getByLabel(/Français: machine translated/i).check();
  await page.getByRole('button', { name: /save locally|lokal speichern/i }).click();
  await expect(page.getByRole('status')).toContainText(/saved|gespeichert/i);

  const storedRaw = await page.evaluate(() => localStorage.getItem('home-workout:plans') ?? '[]');
  const stored = JSON.parse(storedRaw) as Array<{
    translationMetadata?: Record<string, { reviewStatus: string; provider: string }>;
  }>;
  expect(stored[0]?.translationMetadata?.fr).toMatchObject({
    reviewStatus: 'reviewed',
    provider: 'cloudflare-m2m100-1.2b'
  });
});


test('editor rejects zero rounds without changing it to one', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'firefox-desktop', 'Representative editor validation journey');
  await page.goto('/#editor');
  await page.locator('.phase-editor[data-phase="training"]').getByLabel('Rounds', { exact: true }).fill('0');
  await page.getByRole('button', { name: /save locally|lokal speichern/i }).click();
  await expect(page.getByRole('status')).toContainText(/rounds must be at least 1|Runden müssen mindestens 1 sein/i);
  const savedPlans = await page.evaluate(() => localStorage.getItem('home-workout:plans'));
  expect(savedPlans).toBeNull();
});

test('phase editor groups warm-up, training and cool-down and can add a block', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'firefox-desktop', 'Representative phase-editor journey');
  await page.goto('/#editor');
  await expect(page.locator('.phase-editor')).toHaveCount(3);
  await expect(page.locator('.phase-editor').nth(0)).toContainText(/Warm-up|Aufwärmen/i);
  await expect(page.locator('.phase-editor').nth(1)).toContainText(/Training/i);
  await expect(page.locator('.phase-editor').nth(2)).toContainText(/Cool-down|Dehnen/i);

  await page.getByRole('button', { name: /add training block|Trainingsblock hinzufügen/i }).click();
  await expect(page.locator('.phase-editor')).toHaveCount(4);
  const added = page.locator('.phase-editor').nth(2);
  await added.locator('select[name="phase-2-kind"]').selectOption('active-recovery');
  await added.getByRole('button', { name: /remove phase/i }).click();
  await expect(page.locator('.phase-editor')).toHaveCount(3);
});

test('customizing a bundled routine creates a separate editable plan', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'firefox-desktop', 'Representative immutable-default journey');
  await page.goto('/#plans');

  const defaultCard = page.locator('.plan-card').filter({ hasText: '30 Minute Full Body' });
  await defaultCard.getByRole('button', { name: /customize|anpassen/i }).click();
  await expect(page.getByRole('heading', { name: /customize routine|Routine anpassen/i })).toBeVisible();
  await page.getByRole('button', { name: /save locally|lokal speichern/i }).click();
  await page.getByRole('link', { name: /my plans|meine Pläne/i }).click();

  await expect(page.locator('.plan-card').filter({ hasText: '30 Minute Full Body · Custom' })).toContainText(/stored only on this device/i);
  await expect(page.getByRole('heading', { name: /^30 Minute Full Body(?: · Custom)?$/ })).toHaveCount(2);
  await expect(page.locator('.plan-card').filter({ hasText: '30 Minute Full Body' }).first()).toContainText(/permanent bundled routine/i);
});

test('duplicating a non-DE/EN local plan preserves its configured languages', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'firefox-desktop', 'Representative generic-language duplication journey');
  await page.goto('/');
  await page.evaluate((plan) => localStorage.setItem('home-workout:plans', JSON.stringify([plan])), importedPlan);
  await page.goto('/#plans');

  const sourceCard = page.locator('.plan-card').filter({ hasText: 'Plan corto' });
  await sourceCard.getByRole('button', { name: /duplicate|duplizieren/i }).click();
  await expect(page.locator('.plan-card').filter({ hasText: 'Plan corto · Copia' })).toBeVisible();

  const storedRaw = await page.evaluate(() => localStorage.getItem('home-workout:plans') ?? '[]');
  const stored = JSON.parse(storedRaw) as unknown;
  expect(stored).toStrictEqual([
    importedPlan,
    expect.objectContaining({
      languages: [{ code: 'es', label: 'Español' }],
      name: { es: 'Plan corto · Copia' }
    })
  ]);
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
  await expect(page.getByRole('heading', { name: 'Sentadilla' })).toBeVisible();
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
  await expect(page.locator('.copy-field code')).toHaveText(`${new URL(page.url()).origin}/ai-workout-guide.txt`);
  await expect(page.getByRole('button', { name: /^Copy link$/i })).toBeVisible();
  await expect(page.getByText(/Give an AI such as ChatGPT/i)).toBeVisible();
  await expect(page.getByText(/Wenn du deinen Trainingsplan/i)).toHaveCount(0);

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
  await expect(page.locator('.workout-status').getByText(/Exercise 2\s*\/\s*4/i)).toBeVisible();

  await page.reload();
  await page.getByRole('dialog', { name: /resume workout|Workout fortsetzen/i })
    .getByRole('button', { name: /start over|neu starten/i }).click();
  await expect(page.locator('.workout-status').getByText(/Runde 1\s*\/\s*1|Round 1\s*\/\s*1/i)).toBeVisible();
  await expect(page.locator('.phase-pill')).not.toHaveText(/rest|pause/i);
});
