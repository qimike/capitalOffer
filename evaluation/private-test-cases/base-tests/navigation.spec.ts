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
    // Clear any authentication
    await page.context().clearCookies();
    await page.context().clearPermissions();
    
    // Try to access offers page
    await page.goto('/offers');
    
    // Should redirect to login (may have query param)
    await expect(page).toHaveURL(/\/login/);
  });

});