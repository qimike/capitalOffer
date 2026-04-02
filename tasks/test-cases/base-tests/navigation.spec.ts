import { test, expect } from '@playwright/test';

test.describe('Navbar & Navigation Tests', () => {
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

});
