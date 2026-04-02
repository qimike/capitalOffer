import { test, expect } from '@playwright/test';

test.describe('Task 3 - Filter offers by status (private)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'jane');
    await page.fill('#password', 'private@456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should display My Offers heading and filter controls', async ({ page }) => {
    await page.goto('/offers');
    await expect(page.locator('h2').filter({ hasText: 'My Offers' })).toBeVisible();
    await expect(page.locator('select.form-select').nth(0)).toBeVisible();
    await expect(page.locator('button.btn-outline-secondary').filter({ hasText: 'Clear' })).toBeVisible();
  });

  test('should default to All Status showing all jane offers', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.locator('select.form-select').nth(0)).toHaveValue('');

    // Jane has 10 offers, all on page 1
    const cardCount = await page.locator('.card .badge').count();
    expect(cardCount).toBe(10);
  });

  test('should filter by New status and show only new offer badges', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('select.form-select').nth(0).selectOption('new');
    await page.waitForTimeout(500);

    // All visible offer badges should say "new"
    const badges = await page.locator('.card .badge').allTextContents();
    expect(badges.length).toBeGreaterThan(0);
    for (const badge of badges) {
      expect(badge.trim().toLowerCase()).toBe('new');
    }
  });

  test('should filter by Accepted status and verify badge text', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('select.form-select').nth(0).selectOption('accepted');
    await page.waitForTimeout(500);

    const badges = await page.locator('.card .badge').allTextContents();
    expect(badges.length).toBeGreaterThan(0);
    for (const badge of badges) {
      expect(badge.trim().toLowerCase()).toBe('accepted');
    }
  });

  test('should filter by Expired status and verify badge text', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('select.form-select').nth(0).selectOption('expired');
    await page.waitForTimeout(500);

    const badges = await page.locator('.card .badge').allTextContents();
    expect(badges.length).toBeGreaterThan(0);
    for (const badge of badges) {
      expect(badge.trim().toLowerCase()).toBe('expired');
    }
  });

  test('should reset filters with Clear button and restore full list', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 });

    // Get total count of all offers before filtering
    const totalCount = await page.locator('.card .badge').count();

    // Apply a filter first
    await page.locator('select.form-select').nth(0).selectOption('accepted');
    await page.waitForTimeout(1000);
    const filteredCount = await page.locator('.card .badge').count();
    expect(filteredCount).toBeLessThan(totalCount);

    // Click Clear
    await page.locator('button.btn-outline-secondary').filter({ hasText: 'Clear' }).click();
    await page.waitForTimeout(1500);

    // Verify filter reset to default
    await expect(page.locator('select.form-select').nth(0)).toHaveValue('');

    // Should show all offers again (same as total count)
    const allCount = await page.locator('.card .badge').count();
    expect(allCount).toBe(totalCount);
  });

  test('should show page info text after filtering', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 });

    // Filter by "new" status
    await page.locator('select.form-select').nth(0).selectOption('new');
    await page.waitForTimeout(500);

    // Page info should still show Page 1
    await expect(page.locator('.text-muted.ms-3')).toContainText('Page 1');
  });
});
