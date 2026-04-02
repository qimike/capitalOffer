import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/tasks',
  fullyParallel: true,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.BASE_URL || 'http://frontend:80',
    actionTimeout: 10000,
    timeout: 30000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
