import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to signup from login', async ({ page }) => {
    await page.goto('/login');
    
    // Look for signup link text
    const signupLink = page.locator('a[href^="/signup"]').nth(0);
    await signupLink.click();
    
    // Verify signup page loaded
    await expect(page).toHaveURL('/signup');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form with invalid credentials
    await page.fill('#username', 'invalid');
    await page.fill('#password', 'wrong');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify error message is shown
    await expect(page.locator('.alert')).toBeVisible();
  });

});
