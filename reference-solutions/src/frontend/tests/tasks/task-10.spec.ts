import { test, expect } from '@playwright/test'

test.describe('Task 10 - Notifications Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as alice before each test
    await page.goto('/login');
    await page.fill('#username', 'jane');
    await page.fill('#password', 'private@456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should navigate to notifications page and see notifications header', async ({ page }) => {
    await page.goto('/notifications')
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible()
  })
})
