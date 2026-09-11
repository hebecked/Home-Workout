import { expect, test } from '@playwright/test';

const longCustomInstructions = 'Move slowly through the full range of motion, keep your breathing steady, maintain a stable stance, and stop if the movement no longer feels controlled or comfortable. Repeat the sequence with the same calm tempo while keeping enough space around you.';

const phasePreviewPlan = {
  schemaVersion: 2,
  id: 'phase-preview-plan',
  languages: [{ code: 'en', label: 'English' }],
  name: { en: 'Phase Preview Plan' },
  displayLanguages: ['en'],
  phases: [
    {
      id: 'warm-up', kind: 'warm-up', rounds: 1,
      restBetweenExercises: 0, restBetweenRounds: 0, restAfterPhase: 10,
      exercises: [{
        id: 'warm-up-custom-flow', exerciseId: 'custom-balance-flow', type: 'duration', target: { seconds: 30 },
        translations: { en: { name: 'Custom Balance Flow', instructions: longCustomInstructions } },
        alternativeExerciseIds: []
      }]
    },
    {
      id: 'training', kind: 'training', rounds: 2,
      restBetweenExercises: 10, restBetweenRounds: 20, restAfterPhase: 0,
      exercises: [{
        id: 'training-custom-flow', exerciseId: 'custom-balance-flow', type: 'duration', target: { seconds: 45 },
        translations: { en: { name: 'Custom Balance Flow', instructions: longCustomInstructions } },
        alternativeExerciseIds: []
      }]
    }
  ]
};

test('home presents the default plan and all primary destinations', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Home Workout/i);
  await expect(page.getByRole('heading', { name: /30 Minute Full Body/i })).toBeVisible();
  await expect(page.getByText(/3\s+(phases|Phasen)/i)).toBeVisible();
  await expect(page.getByText(/5\s+(rounds|Runden)/i)).toBeVisible();
  await expect(page.getByText(/17\s+(exercises|Übungen)/i)).toBeVisible();
  await expect(page.getByRole('combobox', { name: /choose routine|Routine wählen/i })).toHaveAttribute('data-value', '30-minute-full-body');
  await expect(page.getByRole('button', { name: /start workout/i })).toBeVisible();
  const phaseGroups = page.locator('.exercise-preview-phase');
  await expect(phaseGroups).toHaveCount(3);
  await expect(phaseGroups.getByRole('heading', { level: 3 })).toHaveCount(3);
  await expect(page.locator('.exercise-preview-card')).toHaveCount(17);
  const firstPreview = page.locator('.exercise-preview-card').first();
  const info = firstPreview.getByRole('button', { name: /instructions: marching/i });
  const tooltip = firstPreview.getByRole('tooltip');
  await expect(info).toHaveAttribute('aria-expanded', 'false');
  await expect(tooltip).toBeHidden();
  await info.focus();
  await expect(info).toHaveAttribute('aria-expanded', 'true');
  await expect(info).toHaveAttribute('aria-describedby', await tooltip.getAttribute('id') ?? 'missing');
  await expect(tooltip).toBeVisible();
  await expect(tooltip).not.toBeEmpty();
  await info.press('Escape');
  await expect(info).toBeFocused();
  await expect(tooltip).toBeHidden();
  await info.click();
  await expect(tooltip).toBeVisible();
  await info.press('Escape');
  await expect(tooltip).toBeHidden();
  await page.locator('.preview-heading').hover();
  await firstPreview.locator('.preview-info-wrap').hover();
  await expect(tooltip).toBeVisible();
  await page.locator('.preview-heading').hover();
  await expect(tooltip).toBeHidden();
  const options = page.locator('.plan-options');
  await expect(options.getByRole('link', { name: /instructions|Anleitung/i })).toBeVisible();
  await expect(options.getByRole('link', { name: /create new plan|neuen Plan/i })).toBeVisible();
  await expect(options.getByRole('link', { name: /upload|own plan|import/i })).toBeVisible();
  await expect(options.getByRole('link', { name: /my plans|meine Pläne/i })).toBeVisible();
});

test('phase overview handles repeated custom exercises and long instructions', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'firefox-desktop', 'Representative custom-plan preview regression');
  await page.addInitScript((plan) => localStorage.setItem('home-workout:plans', JSON.stringify([plan])), phasePreviewPlan);
  await page.goto('/');

  await page.getByRole('combobox', { name: /choose routine|Trainingsplan wählen/i }).click();
  await page.getByRole('option', { name: /Phase Preview Plan.*\d+ min/i }).click();

  const phaseGroups = page.locator('.exercise-preview-phase');
  await expect(phaseGroups).toHaveCount(2);
  await expect(phaseGroups.nth(0)).toContainText(/warm-up/i);
  await expect(phaseGroups.nth(1)).toContainText(/training/i);
  const repeatedCards = page.locator('.exercise-preview-card').filter({ hasText: 'Custom Balance Flow' });
  await expect(repeatedCards).toHaveCount(2);
  await expect(phaseGroups.nth(0).locator('.exercise-preview-card')).toContainText('Custom Balance Flow');
  await expect(phaseGroups.nth(1).locator('.exercise-preview-card')).toContainText('Custom Balance Flow');

  await page.setViewportSize({ width: 390, height: 844 });
  const info = repeatedCards.last().getByRole('button', { name: 'Instructions: Custom Balance Flow' });
  await info.click();
  const tooltip = repeatedCards.last().getByRole('tooltip');
  await expect(tooltip).toHaveText(longCustomInstructions);
  expect(await tooltip.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return box.left >= 0 && box.right <= window.innerWidth && document.documentElement.scrollWidth <= window.innerWidth;
  })).toBe(true);
});

test('permanent bundled routines can be selected without replacing the default', async ({ page }) => {
  await page.goto('/');

  let picker = page.getByRole('combobox', { name: /choose routine|Routine wählen/i });
  await picker.click();
  await expect(page.getByRole('listbox', { name: /choose routine|Routine wählen/i })).toBeVisible();
  await expect(page.getByRole('listbox', { name: /choose routine|Routine wählen/i }).getByRole('option')).toHaveCount(6);
  await page.getByRole('option', { name: /Gentle Start.*\d+ min/i }).click();
  await expect(page.getByRole('heading', { name: 'Gentle Start', exact: true })).toBeVisible();
  await expect(page.getByText(/4\s+(rounds|Runden)/i)).toBeVisible();
  await expect(page.getByText(/14\s+(exercises|Übungen)/i)).toBeVisible();

  picker = page.getByRole('combobox', { name: /choose routine|Routine wählen/i });
  await picker.click();
  await page.getByRole('option', { name: /30 Minute Full Body.*\d+ min/i }).click();
  await expect(page.getByRole('heading', { name: /30 Minute Full Body/i })).toBeVisible();
  await expect(page.getByText(/5\s+(rounds|Runden)/i)).toBeVisible();
});

test('plan selection keeps its estimate, label, focus, and responsive alignment', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText(/READY WHEN YOU ARE|BEREIT, WENN DU ES BIST/i)).toHaveCount(0);
  const picker = page.getByRole('combobox', { name: /choose routine|Trainingsplan wählen/i });
  await expect(picker).toContainText(/30 Minute Full Body/i);
  await expect(picker).toContainText(/\d+\s*(min|Min\.)/);
  await expect(picker).toHaveAttribute('aria-expanded', 'false');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await picker.focus();
  await expect(picker).toBeFocused();
  await picker.press('ArrowDown');
  const listbox = page.getByRole('listbox', { name: /choose routine|Trainingsplan wählen/i });
  await expect(listbox).toBeVisible();
  const optionTimeRights = await listbox.getByRole('option').evaluateAll((options) => options.map((option) => {
    const time = option.lastElementChild as HTMLElement;
    return Math.round(time.getBoundingClientRect().right);
  }));
  expect(Math.max(...optionTimeRights) - Math.min(...optionTimeRights)).toBeLessThanOrEqual(1);
  await picker.press('ArrowDown');
  await picker.press('Enter');

  const updatedPicker = page.getByRole('combobox', { name: /choose routine|Trainingsplan wählen/i });
  await expect(updatedPicker).toBeFocused();
  await expect(updatedPicker).toHaveAttribute('data-value', 'gentle-start');
  await expect(updatedPicker).toContainText(/Gentle Start/i);
  await expect(updatedPicker).toContainText(/\d+\s*(min|Min\.)/);
});

test('timer audio remains opt-in, local, and mutable during a workout', async ({ page }) => {
  await page.goto('/');

  const toggle = page.getByRole('button', { name: /timer end signals|Timer-Endsignale/i });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('checkbox', { name: /timer end signals|Timer-Endsignale/i })).toHaveCount(0);
  await expect(page.getByRole('slider', { name: /volume|Lautstärke/i })).toHaveCount(0);
  if (await toggle.isDisabled()) {
    await expect(toggle).toBeDisabled();
    expect(await page.evaluate(() => localStorage.getItem('home-workout:timer-audio'))).toBeNull();
    return;
  }
  await expect(toggle).toBeEnabled();

  await toggle.click();
  await expect(page.getByRole('button', { name: /timer end signals|Timer-Endsignale/i })).toBeFocused();
  await expect(page.getByRole('button', { name: /timer end signals|Timer-Endsignale/i })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('slider')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('home-workout:timer-audio'))).toBe('{"enabled":true}');
  const start = page.getByRole('button', { name: /start workout|Training starten/i });
  const homeAudio = page.getByRole('button', { name: /timer end signals|Timer-Endsignale/i });
  const [startBox, audioBox] = await Promise.all([start.boundingBox(), homeAudio.boundingBox()]);
  expect(startBox).not.toBeNull();
  expect(audioBox).not.toBeNull();
  expect(Math.abs(startBox!.y - audioBox!.y)).toBeLessThanOrEqual(1);
  expect(audioBox!.x).toBeGreaterThanOrEqual(startBox!.x + startBox!.width);
  expect(startBox!.width).toBeGreaterThan(audioBox!.width * 4);

  await start.click();
  const workoutToggle = page.getByRole('button', { name: /timer end signals|Timer-Endsignale/i });
  await expect(page.locator('.workout-header-controls')).toContainText(/end workout|Workout beenden/i);
  const headerButtons = page.locator('.workout-header-controls').getByRole('button');
  await expect(headerButtons).toHaveCount(2);
  await expect(headerButtons.first()).toHaveAccessibleName(/timer end signals|Timer-Endsignale/i);
  await expect(headerButtons.last()).toHaveAccessibleName(/end workout|Workout beenden/i);
  await expect(workoutToggle).toHaveAttribute('aria-pressed', 'true');
  await workoutToggle.click();
  await expect(page.getByRole('button', { name: /timer end signals|Timer-Endsignale/i })).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => localStorage.getItem('home-workout:timer-audio'))).toBe('{"enabled":false}');

  await page.reload();
  await page.getByRole('button', { name: /resume|fortsetzen/i }).click();
  await expect(page.getByRole('button', { name: /timer end signals|Timer-Endsignale/i })).toHaveAttribute('aria-pressed', 'false');
});

test('timer audio plays a louder three-two-one and completion pattern', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'firefox-desktop', 'Representative synthesized-audio timing regression');
  await page.addInitScript(() => {
    const cues: Array<{ startFrequency?: number; endFrequency?: number; peakGain?: number; duration?: number }> = [];
    class TestAudioContext {
      state = 'running';
      currentTime = 10;
      destination = {};
      async resume() {}
      createOscillator() {
        const cue: (typeof cues)[number] = {};
        cues.push(cue);
        return {
          type: 'sine',
          frequency: {
            setValueAtTime: (value: number) => { cue.startFrequency = value; },
            exponentialRampToValueAtTime: (value: number) => { cue.endFrequency = value; }
          },
          connect: () => {}, start: () => {},
          stop: (time: number) => { cue.duration = time - 10; }
        };
      }
      createGain() {
        const cue = cues[cues.length - 1]!;
        return {
          gain: {
            setValueAtTime: () => {},
            exponentialRampToValueAtTime: (value: number) => { cue.peakGain = Math.max(cue.peakGain ?? 0, value); }
          },
          connect: () => {}
        };
      }
    }
    Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: TestAudioContext });
    Object.defineProperty(globalThis, '__timerCueEvents', { configurable: true, value: cues });
  });
  await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') });
  await page.goto('/');
  await page.getByRole('button', { name: 'Timer end signals' }).click();
  await page.getByRole('button', { name: 'Start workout' }).click();

  await page.clock.runFor(30_500);
  const cues = await page.evaluate(() => (globalThis as unknown as {
    __timerCueEvents: Array<{ startFrequency: number; peakGain: number; duration: number }>;
  }).__timerCueEvents);
  expect(cues).toHaveLength(4);
  expect(cues.map(({ startFrequency }) => startFrequency)).toStrictEqual([880, 880, 880, 1046.5]);
  expect(cues.map(({ peakGain }) => peakGain)).toStrictEqual([0.2, 0.2, 0.2, 0.24]);
  expect(cues.map(({ duration }) => Number(duration.toFixed(2)))).toStrictEqual([0.16, 0.16, 0.16, 0.48]);
});

test('an active workout holds and releases the screen wake lock', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-phone', 'Representative Screen Wake Lock lifecycle regression');
  await page.addInitScript(() => {
    const events: string[] = [];
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: {
        request: () => {
          events.push('request');
          const target = new EventTarget();
          let released = false;
          return Promise.resolve({
            get released() { return released; },
            addEventListener: (type: string, listener: EventListener, options?: AddEventListenerOptions) => target.addEventListener(type, listener, options),
            release: () => {
              if (released) return Promise.resolve();
              released = true;
              events.push('release');
              target.dispatchEvent(new Event('release'));
              return Promise.resolve();
            }
          });
        }
      }
    });
    Object.defineProperty(globalThis, '__wakeLockEvents', { configurable: true, value: events });
  });
  const events = () => page.evaluate(() => (globalThis as unknown as { __wakeLockEvents: string[] }).__wakeLockEvents);
  await page.goto('/');
  await page.getByRole('button', { name: 'Start workout' }).click();
  await expect.poll(events).toStrictEqual(['request']);

  await page.getByRole('button', { name: 'Pause' }).click();
  await expect.poll(events).toStrictEqual(['request', 'release']);
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect.poll(events).toStrictEqual(['request', 'release', 'request']);

  await page.getByRole('button', { name: 'End workout' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'End workout' }).click();
  await expect.poll(events).toStrictEqual(['request', 'release', 'request', 'release']);
});

test('the app stays visibly light when the operating system prefers dark mode', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-phone', 'Chromium covers the color-scheme contract');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');

  const appearance = await page.locator('html').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      colorScheme: style.colorScheme,
      backgroundColor: style.backgroundColor,
      color: style.color
    };
  });

  expect(appearance).toStrictEqual({
    colorScheme: 'light',
    backgroundColor: 'rgb(247, 248, 251)',
    color: 'rgb(31, 41, 55)'
  });
});

test('phone workout journey shows two-language exercise copy, localized controls, pause and rest', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-phone', 'Representative smartphone journey');
  await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') });
  await page.goto('/');
  await page.getByRole('button', { name: /start workout/i }).click();

  await expect(page.locator('.workout-status').getByText(/Phase 1\s*\/\s*3/i)).toBeVisible();
  await expect(page.locator('.workout-status').getByText(/Runde 1\s*\/\s*1|Round 1\s*\/\s*1/i)).toBeVisible();
  await expect(page.locator('.workout-status').getByText(/Exercise 1\s*\/\s*4/i)).toBeVisible();
  await expect(page.locator('.translation')).toHaveCount(2);
  await expect(page.getByRole('img', { name: /marching|Marschieren/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /previous|zurück/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /next|weiter/i })).toBeVisible();

  await page.getByRole('button', { name: /pause/i }).click();
  await expect(page.getByRole('button', { name: /resume|fortsetzen/i })).toBeVisible();
  await page.clock.fastForward(60_000);
  await expect(page.locator('.phase-pill')).toContainText(/paused|pausiert/i);
  await page.getByRole('button', { name: /resume|fortsetzen/i }).click();
  const next = page.getByRole('button', { name: /next|weiter/i });
  for (const heading of [/^Torso Rotations$/i, /^Bodyweight Good Mornings$/i, /^Dynamic Lunge with Reach$/i]) {
    await next.click();
    await page.clock.runFor(550);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
  await next.click();
  await expect(page.locator('.phase-pill')).toHaveText(/rest|pause/i);
  await next.click();
  await page.clock.runFor(550);
  await expect(page.locator('.workout-status').getByText(/Phase 2\s*\/\s*3/i)).toBeVisible();
  await expect(page.locator('.workout-status').getByText(/Exercise 1\s*\/\s*8/i)).toBeVisible();
  await page.getByRole('button', { name: /next|weiter/i }).click();
  await page.getByRole('button', { name: /next|weiter/i }).click();
  await expect(page.locator('.workout-status').getByText(/Exercise 2\s*\/\s*8/i)).toBeVisible();
  const kneeOption = page.getByRole('button', { name: /Knee Push-up/i });
  await expect(kneeOption).toBeVisible();
  await expect(page.getByText(/Alternatives/i).first()).toBeVisible();
  await kneeOption.click();
  await expect(kneeOption).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('img', { name: /Knee Push-up|Knie-Liegestütz/i })).toBeVisible();
});

test('workout actions remain anchored while exercise content scrolls independently', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-phone', 'Representative anchored mobile action bar check');
  await page.goto('/');
  await page.getByRole('button', { name: /start workout/i }).click();

  const actionBar = page.locator('.workout-actions');
  await expect(actionBar).toBeVisible();
  await expect(page.getByRole('button', { name: /previous|zurück/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /next|weiter/i })).toBeVisible();

  const initialY = (await actionBar.boundingBox())?.y;
  expect(initialY).toEqual(expect.any(Number));
  await page.locator('.workout-content').evaluate((element) => { element.scrollTop = element.scrollHeight; });
  const scrolledY = (await actionBar.boundingBox())?.y;
  expect(scrolledY).toEqual(expect.any(Number));
  expect(Math.abs(scrolledY! - initialY!)).toBeLessThanOrEqual(1);
});

test('touch controls meet the minimum 44 by 44 pixel target on tablet', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-tablet', 'Representative tablet accessibility check');
  await page.goto('/');
  await page.getByRole('button', { name: /start workout/i }).click();

  for (const control of await page.getByRole('button', { name: /previous|zurück|pause|next|weiter/i }).all()) {
    const box = await control.boundingBox();
    expect(box, 'control has a rendered box').not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});
