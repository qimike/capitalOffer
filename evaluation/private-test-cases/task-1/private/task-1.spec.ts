import { test, expect } from '@playwright/test';

test.describe('Task 1 - Display offer list page with status badges (private)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'jane');
    await page.fill('#password', 'private@456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 });
  });

  test('should display offer cards with private lender names', async ({ page }) => {
    const cardTitles = await page.locator('.card h5.card-title').allTextContents();
    const lenderNames = cardTitles.map(t => t.trim());

    const privateLenders = ['PrivateLend', 'EliteCapital', 'PremierFinance'];
    const hasPrivateLender = lenderNames.some(name => privateLenders.includes(name));
    expect(hasPrivateLender).toBe(true);

    expect(lenderNames.length).toBe(10);
  });

  test('should show loan amounts with dollar sign and term in months', async ({ page }) => {
    const amounts = await page.locator('.card h2').allTextContents();
    const dollarAmounts = amounts.filter(a => a.includes('$'));
    expect(dollarAmounts.length).toBeGreaterThan(0);
    for (const amount of dollarAmounts) {
      expect(amount).toMatch(/\$/);
    }

    const cardTexts = await page.locator('.card-body').allTextContents();
    const hasMonths = cardTexts.some(t => t.includes('months'));
    expect(hasMonths).toBe(true);
  });

  test('should display correct status badge types for jane offers', async ({ page }) => {
    const allBadgeTexts = await page.locator('.card .badge').allTextContents();
    const statuses = allBadgeTexts.map(t => t.trim().toLowerCase());

    expect(statuses.some(s => s === 'new')).toBe(true);
    expect(statuses.some(s => s === 'accepted')).toBe(true);
    expect(statuses.some(s => s === 'expired')).toBe(true);

    expect(statuses.length).toBe(20);
  });

  test('should display pagination controls with 1 page', async ({ page }) => {
    await expect(page.locator('.pagination')).toBeVisible();
    await expect(page.locator('text=Page 1 of 1')).toBeVisible();
  });

  test('should show all offers from all three lenders', async ({ page }) => {
    const cardTitles = await page.locator('.card h5.card-title').allTextContents();
    const lenderNames = cardTitles.map(t => t.trim());

    expect(lenderNames.filter(n => n === 'EliteCapital').length).toBe(4);
    expect(lenderNames.filter(n => n === 'PrivateLend').length).toBe(3);
    expect(lenderNames.filter(n => n === 'PremierFinance').length).toBe(3);
  });
});
