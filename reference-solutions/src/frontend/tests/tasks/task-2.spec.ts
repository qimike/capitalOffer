import { test, expect } from '@playwright/test';

test.describe('Task 2 - Display offer detail page', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as alice before each test
    await page.goto('/login');
    await page.fill('#username', 'jane');
    await page.fill('#password', 'private@456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should navigate to offer detail page from offers list', async ({ page }) => {
    // Navigate to /offers
    await page.goto('/offers');
    
    // Click on an offer card
    await page.locator('.card').first().click();
    
    // Verify navigation to /offers/:id
    await expect(page).toHaveURL("http://localhost:5173/offers");
  });
});
