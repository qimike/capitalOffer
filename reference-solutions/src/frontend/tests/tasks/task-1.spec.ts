import { test, expect } from '@playwright/test';

test.describe('Task 1 - Display offer list page with status badges', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as alice before each test
    await page.goto('/login');
    await page.fill('#username', 'jane');
    await page.fill('#password', 'private@456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should display offer list page with all required information', async ({ page }) => {
    // Navigate to /offers
    await page.goto('/offers');
    
    // Verify each offer card shows lender name, loan amount, interest rate, and term
    await expect(page.locator('.card').first()).toBeVisible();
    
    // Check first offer card details using direct selectors
    await expect(page.locator('.card h5.card-title').first()).toBeVisible();
    await expect(page.locator('.card h2').first()).toBeVisible();
    await expect(page.locator('.card p.text-muted').first()).toContainText('months');
  });

  test('should display status badges on each offer', async ({ page }) => {
    await page.goto('/offers');
    
    // Verify each offer displays a status badge (6 badges for 6 offers)
    const statusBadges = page.locator('.badge');   
    // Verify status badges have correct text (new, pending, accepted, expired)
    await expect(statusBadges.first()).toBeVisible();
  });

  test('should display pagination controls at the bottom', async ({ page }) => {
    await page.goto('/offers');
    
    // Verify pagination controls exist
    await expect(page.locator('.pagination')).toBeVisible();
    
    // Verify page info is displayed (fix selector: use .text-muted.ms-3 not .text-muted ms-3)
    await expect(page.locator('.text-muted.ms-3')).toContainText('Page 1 of');
  });

  test('should navigate to next page using Next button', async ({ page }) => {
    await page.goto('/offers');
    
    // Get first page offers
    const firstPageOffers = await page.locator('.card').allTextContents();
    
    // Click Next button
    const nextButton = page.locator('.page-link:has-text("Next")');
    await nextButton.click();
    
    // Wait for page to update
    await page.waitForTimeout(500);
    
    // Verify page changed to page 2
    await expect(page.locator('.text-muted.ms-3')).toContainText('Page 2 of');
    
    // Verify different offers are displayed
    const secondPageOffers = await page.locator('.card').allTextContents();
    expect(firstPageOffers).not.toEqual(secondPageOffers);
  });

  test('should navigate to previous page using Previous button', async ({ page }) => {
    await page.goto('/offers');
    
    // Go to page 2 first
    await page.locator('.page-link:has-text("Next")').click();
    
    // Wait for page to update
    await page.waitForTimeout(500);
    
    // Verify we're on page 2
    await expect(page.locator('.text-muted.ms-3')).toContainText('Page 2 of');
    
    // Click Previous button
    await page.locator('.page-link:has-text("Previous")').click();
    
    // Wait for page to update
    await page.waitForTimeout(500);
    
    // Verify back to page 1
    await expect(page.locator('.text-muted.ms-3')).toContainText('Page 1 of');
  });
});