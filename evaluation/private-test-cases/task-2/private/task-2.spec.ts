import { test, expect } from '@playwright/test';

test.describe('Task 2 - Display offer detail page (private)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'jane');
    await page.fill('#password', 'private@456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should navigate to offer detail via View Details button', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card .btn-outline-primary').first().click();
    await expect(page).toHaveURL(/\/offers\/\d+$/);
  });

  test('should display lender name from private lenders on detail page', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card .btn-outline-primary').first().click();
    await page.waitForURL(/\/offers\/\d+$/);

    // Verify a private lender name appears on the detail page
    const heading = await page.locator('h2').first().textContent();
    const privateLenders = ['PrivateLend', 'EliteCapital', 'PremierFinance'];
    const foundLender = privateLenders.some(l => heading?.includes(l));
    expect(foundLender).toBe(true);
  });

  test('should display loan amount and interest rate on detail page', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card .btn-outline-primary').first().click();
    await page.waitForURL(/\/offers\/\d+$/);

    // Loan amount should show dollar sign
    await expect(page.locator('h3.text-primary')).toContainText('$');

    // Interest rate should show percentage
    await expect(page.locator('h3.text-success')).toContainText('%');
  });

  test('should display term in months and monthly payment', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card .btn-outline-primary').first().click();
    await page.waitForURL(/\/offers\/\d+$/);

    // Term months
    await expect(page.locator('text=months')).toBeVisible();

    // Monthly payment with dollar sign
    const payments = page.locator('h3:has-text("$")');
    expect(await payments.count()).toBeGreaterThanOrEqual(2);
  });

  test('should show status badge on detail page', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card .btn-outline-primary').first().click();
    await page.waitForURL(/\/offers\/\d+$/);

    const badge = page.locator('.card-body span.badge.fs-6');
    await expect(badge).toBeVisible();
    const badgeText = await badge.textContent();
    expect(['NEW', 'ACCEPTED', 'EXPIRED', 'PENDING', 'DECLINED'].some(s => badgeText?.includes(s))).toBe(true);
  });

  test('should display expiry date on detail page', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card .btn-outline-primary').first().click();
    await page.waitForURL(/\/offers\/\d+$/);

    await expect(page.locator('text=Expiry Date')).toBeVisible();
    const expiryText = await page.locator('strong:has-text("Expiry Date")').locator('..').textContent();
    expect(expiryText).toMatch(/\d/);
  });

  test('should display lender notes if present', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card .btn-outline-primary').first().click();
    await page.waitForURL(/\/offers\/\d+$/);

    await expect(page.locator('text=Lender Notes')).toBeVisible();
    const notesText = await page.locator('strong:has-text("Lender Notes")').locator('..').textContent();
    expect(notesText?.trim().length).toBeGreaterThan(0);
  });
});
