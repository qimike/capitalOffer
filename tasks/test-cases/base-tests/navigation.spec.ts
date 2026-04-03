import { test, expect } from '@playwright/test';

test.describe('Navbar & Navigation Tests (public)', () => {
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
    await page.context().clearCookies();
    await page.context().clearPermissions();

    await page.goto('/offers');

    await expect(page).toHaveURL(/\/login/);
  });

  test('should show navbar with user info after public user login', async ({ page }) => {
    // Log in with public seed user
    await page.goto('/login');
    await page.fill('#username', 'alice');
    await page.fill('#password', 'test@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);

    // After login, navbar should show authenticated state
    await expect(page.locator('.navbar')).toBeVisible();
    await expect(page.locator('.navbar a:has-text("Offers")')).toBeVisible();
  });

});
