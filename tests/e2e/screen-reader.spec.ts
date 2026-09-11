import { expect, test } from '@playwright/test';

test.describe('screen-reader smoke tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-phone', 'One accessibility tree is sufficient for semantic smoke coverage');
    await page.goto('/');
  });

  test('home plan and audio controls expose names, descriptions, and state', async ({ page }) => {
    const card = page.locator('.workout-card');
    const tree = await card.ariaSnapshot();
    expect(tree).toContain('combobox "Choose routine"');
    expect(tree).toContain('checkbox "Timer end signals"');

    const picker = page.getByRole('combobox', { name: 'Choose routine' });
    await expect(picker).toContainText(/30 Minute Full Body.*\d+ min/i);
    await picker.press('Enter');
    const listbox = page.getByRole('listbox', { name: 'Choose routine' });
    await expect(listbox).toBeVisible();
    expect(await listbox.ariaSnapshot()).toContain('option "30 Minute Full Body');
    await picker.press('Escape');
    await expect(listbox).toBeHidden();
    const toggle = page.getByRole('checkbox', { name: 'Timer end signals' });
    await expect(toggle).not.toBeChecked();
    await expect(page.getByRole('slider')).toHaveCount(0);

    await toggle.check();
    await expect(toggle).toBeChecked();
    await expect(page.getByRole('slider')).toHaveCount(0);
  });

  test('workout state is announced and keyboard focus survives rerenders', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Timer end signals' }).check();
    await page.getByRole('button', { name: 'Start workout' }).click();

    const announcement = page.locator('[data-workout-announcement]');
    await expect(announcement).toHaveAttribute('role', 'status');
    await expect(announcement).toHaveAttribute('aria-live', 'polite');
    await expect(announcement).toHaveAttribute('aria-atomic', 'true');
    await expect(announcement).toContainText('Phase 1 / 3');
    await expect(announcement).toContainText('Exercise 1 / 4');
    await expect(announcement).toContainText(/Marching in place/i);

    const firstAnnouncement = await announcement.textContent();
    const next = page.getByRole('button', { name: 'Next' });
    await next.click();
    await expect(page.getByRole('button', { name: 'Next' })).toBeFocused();
    await expect(announcement).not.toHaveText(firstAnnouncement ?? '');
    await expect(announcement).toContainText('Exercise 2 / 4');
    await expect(announcement).toContainText(/Torso Rotations/i);

    const pause = page.getByRole('button', { name: 'Pause' });
    await pause.click();
    await expect(page.getByRole('button', { name: 'Resume' })).toBeFocused();
    await expect(announcement).toContainText('Paused');

    const audio = page.getByRole('button', { name: 'Timer end signals' });
    await expect(audio).toHaveAttribute('aria-pressed', 'true');
    await audio.click();
    await expect(page.getByRole('button', { name: 'Timer end signals' })).toBeFocused();
    await expect(page.getByRole('button', { name: 'Timer end signals' })).toHaveAttribute('aria-pressed', 'false');
  });
});
