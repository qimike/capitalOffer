import { test, expect } from '@playwright/test'

test.describe('Task 8 - Accept and Decline Offers', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as alice before each test
    await page.goto('/login');
    await page.fill('#username', 'alice');
    await page.fill('#password', 'test@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should navigate to offer detail page from offers list', async ({ page }) => {
    await page.goto('/offers')
    
    // Click on first offer's View Details button
    await page.locator('.card .btn-outline-primary').first().click()
    
    // Verify we're on the offer detail page
    await expect(page).toHaveURL(/\/offers\/\d+$/)
  })

  test('should show offer details page with correct status badge', async ({ page }) => {
    await page.goto('/offers')
    
    // Navigate to offer
    await page.click('.card .btn-outline-primary')
    await page.waitForURL(/.*offers\/\d+$/)
    await page.waitForTimeout(500)
    
    // Verify status badge is displayed
    await expect(page.locator('span.badge')).toBeVisible()
  })

})
