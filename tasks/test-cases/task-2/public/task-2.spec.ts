import { test, expect } from '@playwright/test';

test.describe('Task 2 - Display offer detail page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'alice');
    await page.fill('#password', 'test@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should navigate to offer detail page via View Details button', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card .btn-outline-primary').first().click();
    await expect(page).toHaveURL(/\/offers\/\d+$/);
  });

  test('should display lender name and status badge', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card .btn-outline-primary').first().click();
    await page.waitForURL(/\/offers\/\d+$/);

    await expect(page.locator('h2').first()).toBeVisible();

    const badge = page.locator('span.badge');
    await expect(badge).toBeVisible();
    const badgeText = await badge.textContent();
    expect(['NEW', 'ACCEPTED', 'EXPIRED', 'PENDING', 'DECLINED'].some(s => badgeText?.includes(s))).toBe(true);
  });

  test('should display loan amount and interest rate', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card .btn-outline-primary').first().click();
    await page.waitForURL(/\/offers\/\d+$/);

    await expect(page.locator('h3.text-primary')).toContainText('$');
    await expect(page.locator('h3.text-success')).toContainText('%');
  });

  test('should display loan term and monthly payment', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card .btn-outline-primary').first().click();
    await page.waitForURL(/\/offers\/\d+$/);

    await expect(page.locator('text=months')).toBeVisible();

    const payments = page.locator('h3:has-text("$")');
    expect(await payments.count()).toBeGreaterThanOrEqual(2);
  });

  test('should display breadcrumb navigation back to offers', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card .btn-outline-primary').first().click();
    await page.waitForURL(/\/offers\/\d+$/);

    await expect(page.locator('.breadcrumb')).toBeVisible();
    await expect(page.locator('.breadcrumb-item a')).toContainText('Offers');
  });
});
