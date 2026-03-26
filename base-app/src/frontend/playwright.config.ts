import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for frontend testing
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Ignore test files from evaluation/private-test-cases and other non-standard test directories */
  testIgnore: '**/evaluation/**',

  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env['CI'],
  /* Retry on CI only */
  retries: process.env['CI'] ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env['CI'] ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: '../test-reports/playwright-report' }],
    ['json', { outputFile: '../test-reports/results.json' }],
    ['junit', { outputFile: '../test-reports/results.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Maximum time each action can take */
    actionTimeout: 10000,
    /* Maximum time each test can take */
    timeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env['CI'],
    timeout: 120000,
  },
});
