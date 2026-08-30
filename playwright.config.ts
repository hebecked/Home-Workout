import { defineConfig, devices } from '@playwright/test';

const useWindowsBrowserFallback = process.env.PLAYWRIGHT_WINDOWS_FALLBACK === '1';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI
  },
  projects: [
    { name: 'chromium-phone', use: { ...devices['Pixel 7'] } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'], browserName: useWindowsBrowserFallback ? 'chromium' : 'firefox' } },
    { name: 'webkit-tablet', use: { ...devices['iPad Pro 11'], browserName: useWindowsBrowserFallback ? 'chromium' : 'webkit' } }
  ]
});
