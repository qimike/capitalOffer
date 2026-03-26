import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });


  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form (using id selectors instead of name)
    await page.fill('#username', 'alice');
    await page.fill('#password', 'test@123');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for navigation to offers page
    await page.waitForURL(/.*offers/);
    
    // Verify user is logged in
    await expect(page.locator('.navbar')).toContainText('alice');
  });


  test('should navigate to signup from login', async ({ page }) => {
    await page.goto('/login');
    
    // Look for signup link text
    const signupLink = page.locator('a[href^="/signup"]').nth(0);
    await signupLink.click();
    
    // Verify signup page loaded
    await expect(page).toHaveURL('/signup');
  });
});
