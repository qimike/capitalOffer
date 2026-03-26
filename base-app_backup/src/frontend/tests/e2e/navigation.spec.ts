import { test, expect } from '@playwright/test';

test.describe('Navbar & Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display navbar logo', async ({ page }) => {
    await expect(page.locator('.navbar-brand')).toContainText('Capital Offer');
  });

  test('should display navigation links', async ({ page }) => {
    await expect(page.locator('a:has-text("Offers")')).toBeVisible();
    await expect(page.locator('a:has-text("Login")')).toBeVisible();
  });

  test('should handle navigation to offers from unauthenticated state', async ({ page }) => {
    await page.goto('/');
    await page.click('a:has-text("Offers")');
    await expect(page).toHaveURL('/login?redirect=/offers');
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

  test('should show authentication state in navbar', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'alice');
    await page.fill('#password', 'test@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
    
    // Check navbar shows username
    await expect(page.locator('.navbar')).toContainText('alice');
  });
});