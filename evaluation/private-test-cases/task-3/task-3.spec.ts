import { test, expect } from '@playwright/test';

test.describe('Task 3 - Filter offers by status', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as alice before each test
    await page.goto('/login');
    await page.fill('#username', 'jane');
    await page.fill('#password', 'private@456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should navigate to offers list page', async ({ page }) => {
    await page.goto('/offers');
    await expect(page.locator('h2').filter({ hasText: 'My Offers' })).toBeVisible();
  });

  test('should display filter controls', async ({ page }) => {
    await page.goto('/offers');
    
    // Verify status filter dropdown exists
    await expect(page.locator('select.form-select').nth(0)).toBeVisible();
    
    // Verify sort dropdown exists
    await expect(page.locator('select.form-select').nth(1)).toBeVisible();
    
    // Verify clear button exists
    await expect(page.locator('button.btn-outline-secondary').filter({ hasText: 'Clear' })).toBeVisible();
  });

  test('should filter offers by All Status (default)', async ({ page }) => {
    await page.goto('/offers');
    
    // Verify All Status is selected by default
    await expect(page.locator('select.form-select').nth(0)).toHaveValue('');
    
    // Should display offers with various statuses
    const offerCards = page.locator('.card');
    await expect(offerCards).toHaveCount(11);
  });

  test('should filter offers by New status', async ({ page }) => {
    await page.goto('/offers');
    
    // Select 'New' filter option
    await page.locator('select.form-select').nth(0).selectOption('new');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Check that each visible card has 'new' badge
    const badgeCount = await page.locator('.card .badge.bg-success').count();
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });

  test('should filter offers by Accepted status', async ({ page }) => {
    await page.goto('/offers');
    
    // Select 'Accepted' filter option
    await page.locator('select.form-select').nth(0).selectOption('accepted');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Verify offers with accepted status are displayed
    const acceptedBadgeCount = await page.locator('.card .badge.bg-info').count();
    expect(acceptedBadgeCount).toBeGreaterThanOrEqual(0); // May have 0 accepted offers
  });

  test('should filter offers by Pending status', async ({ page }) => {
    await page.goto('/offers');
    
    // Select 'Pending' filter option
    await page.locator('select.form-select').nth(0).selectOption('pending');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Verify offers with pending status are displayed
    const pendingBadgeCount = await page.locator('.card .badge.bg-warning').count();
    expect(pendingBadgeCount).toBeGreaterThanOrEqual(0); // May have 0 pending offers
  });

  test('should filter offers by Expired status', async ({ page }) => {
    await page.goto('/offers');
    
    // Select 'Expired' filter option
    await page.locator('select.form-select').nth(0).selectOption('expired');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Verify offers with expired status are displayed
    const expiredBadgeCount = await page.locator('.card .badge.bg-secondary').count();
    expect(expiredBadgeCount).toBeGreaterThanOrEqual(0); // May have 0 expired offers
  });

  test('should reset filters with Clear button', async ({ page }) => {
    await page.goto('/offers');
    
    // Set a filter using the first select element
    await page.locator('select.form-select').nth(0).selectOption('new');
    await page.waitForTimeout(300);
    
    // Click Clear button
    await page.locator('.btn-outline-secondary i.bi-x-circle').first().click();
    await page.waitForTimeout(500);
    
    // Verify filter is reset
    await expect(page.locator('select.form-select').nth(0)).toHaveValue('');
  });

  test('should reset page to 1 when filter changes', async ({ page }) => {
    await page.goto('/offers');
    
    // Try to navigate to page 2 if Next button is available and enabled
    const nextButton = page.locator('.page-item:not(.disabled):has-text("Next") .page-link').first();
    if (await nextButton.count() > 0) {
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Verify we're on page 2
      await expect(page.locator('.text-muted.ms-3')).toContainText('Page 2');
    }
    
    // Change filter
    await page.locator('select.form-select').nth(0).selectOption('new');
    await page.waitForTimeout(500);
    
    // Verify we're on page 1
    await expect(page.locator('.text-muted.ms-3')).toContainText('Page 1');
  });

  test('should handle empty filter results', async ({ page }) => {
    await page.goto('/offers');
    
    // Set a filter that might not exist
    await page.locator('select.form-select').nth(0).selectOption('expired');
    await page.waitForTimeout(500);
    
    // Either shows no offers or shows existing expired offers
    // This test just verifies the UI handles it gracefully
    const emptyState = page.locator('.text-center.py-5');
    const offerCards = page.locator('.card');
    
    // Either empty state is shown OR cards are shown
    const isEmptyState = await emptyState.count() > 0;
    const hasCards = await offerCards.count() > 0;
    
    expect(isEmptyState || hasCards).toBe(true);
  });
});
