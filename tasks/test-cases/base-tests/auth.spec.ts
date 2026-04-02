import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to signup from login', async ({ page }) => {
    await page.goto('/login');

    const signupLink = page.locator('a[href^="/signup"]').nth(0);
    await signupLink.click();

    await expect(page).toHaveURL('/signup');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#username', 'invalid');
    await page.fill('#password', 'wrong');

    await page.click('button[type="submit"]');

    await expect(page.locator('.alert')).toBeVisible();
  });

});
