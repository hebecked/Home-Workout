import { defineConfig, devices } from '@playwright/test';

const useWindowsBrowserFallback = process.env.PLAYWRIGHT_WINDOWS_FALLBACK === '1';
const e2ePort = Number(process.env.E2E_PORT ?? 4173);
const useExternalPreview = process.env.E2E_EXTERNAL_SERVER === '1';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: `http://127.0.0.1:${e2ePort}`,
    trace: 'on-first-retry'
  },
  ...(useExternalPreview ? {} : {
    webServer: {
      command: `node ./node_modules/vite/bin/vite.js preview --host 0.0.0.0 --port ${e2ePort}`,
      port: e2ePort,
      reuseExistingServer: false
    }
  }),
  projects: [
    { name: 'chromium-phone', use: { ...devices['Pixel 7'] } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'], browserName: useWindowsBrowserFallback ? 'chromium' : 'firefox' } },
    { name: 'webkit-tablet', use: { ...devices['iPad Pro 11'], browserName: useWindowsBrowserFallback ? 'chromium' : 'webkit' } }
  ]
});
