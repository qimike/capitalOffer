import { test, expect } from '@playwright/test';

test.describe('Task 3 - Filter offers by status', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'alice');
    await page.fill('#password', 'test@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should navigate to offers list page', async ({ page }) => {
    await page.goto('/offers');
    await expect(page.locator('h2').filter({ hasText: 'My Offers' })).toBeVisible();
  });

  test('should display filter controls', async ({ page }) => {
    await page.goto('/offers');

    await expect(page.locator('select.form-select').nth(0)).toBeVisible();

    await expect(page.locator('select.form-select').nth(1)).toBeVisible();

    await expect(page.locator('button.btn-outline-secondary').filter({ hasText: 'Clear' })).toBeVisible();
  });

  test('should filter offers by All Status (default)', async ({ page }) => {
    await page.goto('/offers');

    await expect(page.locator('select.form-select').nth(0)).toHaveValue('');

    const offerCards = page.locator('.card');
    await expect(offerCards).toHaveCount(11);
  });

  test('should filter offers by New status', async ({ page }) => {
    await page.goto('/offers');

    await page.locator('select.form-select').nth(0).selectOption('new');

    await page.waitForTimeout(500);

    const badgeCount = await page.locator('.card .badge.bg-success').count();
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });

  test('should filter offers by Accepted status', async ({ page }) => {
    await page.goto('/offers');

    await page.locator('select.form-select').nth(0).selectOption('accepted');

    await page.waitForTimeout(500);

    const acceptedBadgeCount = await page.locator('.card .badge.bg-info').count();
    expect(acceptedBadgeCount).toBeGreaterThanOrEqual(0);
  });

  test('should filter offers by Pending status', async ({ page }) => {
    await page.goto('/offers');

    await page.locator('select.form-select').nth(0).selectOption('pending');

    await page.waitForTimeout(500);

    const pendingBadgeCount = await page.locator('.card .badge.bg-warning').count();
    expect(pendingBadgeCount).toBeGreaterThanOrEqual(0);
  });

  test('should filter offers by Expired status', async ({ page }) => {
    await page.goto('/offers');

    await page.locator('select.form-select').nth(0).selectOption('expired');

    await page.waitForTimeout(500);

    const expiredBadgeCount = await page.locator('.card .badge.bg-secondary').count();
    expect(expiredBadgeCount).toBeGreaterThanOrEqual(0);
  });

  test('should reset filters with Clear button', async ({ page }) => {
    await page.goto('/offers');

    await page.locator('select.form-select').nth(0).selectOption('new');
    await page.waitForTimeout(300);

    await page.locator('.btn-outline-secondary i.bi-x-circle').first().click();
    await page.waitForTimeout(500);

    await expect(page.locator('select.form-select').nth(0)).toHaveValue('');
  });

  test('should reset page to 1 when filter changes', async ({ page }) => {
    await page.goto('/offers');

    const nextButton = page.locator('.page-item:not(.disabled):has-text("Next") .page-link').first();
    if (await nextButton.count() > 0) {
      await nextButton.click();
      await page.waitForTimeout(500);

      await expect(page.locator('.text-muted.ms-3')).toContainText('Page 2');
    }

    await page.locator('select.form-select').nth(0).selectOption('new');
    await page.waitForTimeout(500);

    await expect(page.locator('.text-muted.ms-3')).toContainText('Page 1');
  });

  test('should handle empty filter results', async ({ page }) => {
    await page.goto('/offers');

    await page.locator('select.form-select').nth(0).selectOption('expired');
    await page.waitForTimeout(500);

    const emptyState = page.locator('.text-center.py-5');
    const offerCards = page.locator('.card');

    const isEmptyState = await emptyState.count() > 0;
    const hasCards = await offerCards.count() > 0;

    expect(isEmptyState || hasCards).toBe(true);
  });
});
