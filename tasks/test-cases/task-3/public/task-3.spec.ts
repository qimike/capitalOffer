import { test, expect } from '@playwright/test';

test.describe('Task 3 - Filter offers by status', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'alice');
    await page.fill('#password', 'test@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should display My Offers heading and filter controls', async ({ page }) => {
    await page.goto('/offers');
    await expect(page.locator('h2').filter({ hasText: 'My Offers' })).toBeVisible();
    await expect(page.locator('select.form-select').nth(0)).toBeVisible();
    await expect(page.locator('button.btn-outline-secondary').filter({ hasText: 'Clear' })).toBeVisible();
  });

  test('should default to All Status showing alice offers', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.locator('select.form-select').nth(0)).toHaveValue('');

    const cardCount = await page.locator('.card .badge').count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should filter by New status and show only new offer badges', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('select.form-select').nth(0).selectOption('new');
    await page.waitForTimeout(500);

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

    const totalCount = await page.locator('.card .badge').count();

    await page.locator('select.form-select').nth(0).selectOption('expired');
    await page.waitForTimeout(1000);
    const filteredCount = await page.locator('.card .badge').count();
    expect(filteredCount).toBeLessThan(totalCount);

    await page.locator('button.btn-outline-secondary').filter({ hasText: 'Clear' }).click();
    await page.waitForTimeout(1500);

    await expect(page.locator('select.form-select').nth(0)).toHaveValue('');

    const allCount = await page.locator('.card .badge').count();
    expect(allCount).toBe(totalCount);
  });

  test('should show page info text after filtering', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 });

    await page.locator('select.form-select').nth(0).selectOption('new');
    await page.waitForTimeout(500);

    await expect(page.locator('.text-muted.ms-3')).toContainText('Page 1');
  });
});
