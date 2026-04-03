import { test, expect } from '@playwright/test';

test.describe('Navbar & Navigation Tests (private)', () => {
  test('should display navbar logo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.navbar-brand')).toContainText('Capital Offer');
  });

  test('should display navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a:has-text("Offers")')).toBeVisible();
    await expect(page.locator('a:has-text("Login")')).toBeVisible();
  });

  test('should handle navigation to offers from unauthenticated state', async ({ page }) => {
    await page.goto('/');
    await page.click('a:has-text("Offers")');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login when accessing authenticated routes', async ({ page }) => {
    // Clear any authentication
    await page.context().clearCookies();
    await page.context().clearPermissions();

    // Try to access offers page
    await page.goto('/offers');

    // Should redirect to login (may have query param)
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show navbar with user info after private user login', async ({ page }) => {
    // Log in with private seed user
    await page.goto('/login');
    await page.fill('#username', 'jane');
    await page.fill('#password', 'private@456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);

    // After login, navbar should show authenticated state
    await expect(page.locator('.navbar')).toBeVisible();
    await expect(page.locator('.navbar a:has-text("Offers")')).toBeVisible();
  });

});