import { expect, test } from '@playwright/test';
import { startOfflineOrigin } from './offline-origin';


test('target follows image without being covered by workout controls', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /start workout/i }).click();
  const image = await page.locator('.exercise-visual').boundingBox();
  const target = await page.locator('.target-block').boundingBox();
  const actions = await page.locator('.workout-actions').boundingBox();
  expect(image).not.toBeNull(); expect(target).not.toBeNull(); expect(actions).not.toBeNull();
  expect(target!.y).toBeGreaterThanOrEqual(image!.y + image!.height - 1);
  expect(target!.y + target!.height).toBeLessThanOrEqual(actions!.y);
  for (const button of await page.locator('.workout-actions button').all()) {
    const box = await button.boundingBox(); expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test('legal notice is reachable and skip link retains the route', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Interface language').selectOption('de');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await page.getByRole('link', { name: 'Impressum', exact: true }).click();
  await expect(page.locator('address')).toContainText('Dr. Dustin Hebecker');
  await expect(page.locator('address')).toContainText('Dr. Dustin Hebecker');
  await expect(page.getByRole('heading', { name: 'Nutzung auf eigene Verantwortung' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Feedback- und Fehlerforum auf GitHub/i })).toHaveAttribute('href', 'https://github.com/hebecked/Home-Workout/issues');
  await expect(page.locator('#main')).toContainText('Dieser Hinweis schließt gesetzliche Haftungsansprüche nicht aus.');
  await expect(page.locator('.skip-link')).toHaveCount(1);
  await page.locator('.skip-link').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#impressum$/);
  await expect(page.locator('#main')).toBeFocused();
});

test('legal notice loads offline from the installed app shell', async ({ page }) => {
  const origin = await startOfflineOrigin();
  try {
  await page.goto(`${origin.url}/#impressum`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await page.waitForFunction(async () => {
    const assets = [...document.querySelectorAll<HTMLScriptElement>('script[src]')].map(script => script.src);
    return (await Promise.all(assets.map(url => caches.match(url)))).every(Boolean);
  });
  await origin.close();
  await page.reload();
  await expect(page.locator('address')).toContainText('Dr. Dustin Hebecker');
  } finally { await origin.close(); }
});

test('targets remain visible on short and narrow screens', async ({ page }) => {
  for (const [width, height] of [[320, 568], [844, 390], [1280, 800]]) {
    await page.setViewportSize({ width: width!, height: height! });
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('button', { name: /start workout/i }).click();
    await expect(page).toHaveURL(/#workout$/);
    await expect(page.locator('.target-block')).toBeVisible();
    await expect.poll(() => page.evaluate(() => {
      const selectors = ['.target-block', '.workout-actions', '.workout-exercise-heading', '.exercise-visual', '.site-header'];
      const boxes = selectors.map(s => document.querySelector(s)?.getBoundingClientRect());
      if (boxes.some(box => !box)) return { fits: { elementsFound: false } };
      const [target, actions, names, image, header] = boxes;
      return {
        fits: {
          elementsFound: true,
          pageAtTop: scrollY === 0,
          noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth,
          headerVisible: header!.top >= 0,
          namesVisible: names!.top >= 0 && names!.bottom <= image!.top,
          targetAboveControls: target!.bottom <= actions!.top,
          targetFitsWidth: target!.right <= innerWidth,
          controlsFitHeight: actions!.bottom <= innerHeight + 0.5
        },
        metrics: {
          viewport: { width: innerWidth, height: innerHeight },
          documentWidth: document.documentElement.scrollWidth,
          target: { bottom: target!.bottom, right: target!.right },
          actions: { top: actions!.top, bottom: actions!.bottom },
          names: { top: names!.top, bottom: names!.bottom },
          imageTop: image!.top,
          headerTop: header!.top,
          scrollY
        }
      };
    }), { message: `${width}x${height}: names, targets and controls fit` }).toMatchObject({ fits: {
      elementsFound: true,
      pageAtTop: true,
      noHorizontalOverflow: true,
      headerVisible: true,
      namesVisible: true,
      targetAboveControls: true,
      targetFitsWidth: true,
      controlsFitHeight: true
    } });
    await expect(page.locator('.workout-exercise-heading h2')).toHaveCount(2);
    await expect(page.locator('.site-header [data-action="abort"]')).toBeVisible();
    await expect(page.locator('.workout-actions [data-action="abort"]')).toHaveCount(0);
  }
});
