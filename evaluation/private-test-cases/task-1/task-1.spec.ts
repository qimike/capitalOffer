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
    // Jane should see offers from the private lenders
    const cardTitles = await page.locator('.card h5.card-title').allTextContents();
    const lenderNames = cardTitles.map(t => t.trim());

    // Page 1 (limit=6) shows top 6 by amount: all PrivateLend or PremierFinance
    const privateLenders = ['PrivateLend', 'EliteCapital', 'PremierFinance'];
    const hasPrivateLender = lenderNames.some(name => privateLenders.includes(name));
    expect(hasPrivateLender).toBe(true);

    // Should have 6 offers on first page
    expect(lenderNames.length).toBe(6);
  });

  test('should show loan amounts with dollar sign and term in months', async ({ page }) => {
    // Each offer card should display a dollar amount
    const amounts = await page.locator('.card h2').allTextContents();
    // Filter out the "My Offers" h2
    const dollarAmounts = amounts.filter(a => a.includes('$'));
    expect(dollarAmounts.length).toBeGreaterThan(0);
    for (const amount of dollarAmounts) {
      expect(amount).toMatch(/\$/);
    }

    // Each offer card should show term in months
    const cardTexts = await page.locator('.card-body').allTextContents();
    const hasMonths = cardTexts.some(t => t.includes('months'));
    expect(hasMonths).toBe(true);
  });

  test('should display correct status badge types for jane offers', async ({ page }) => {
    // Page 1 badges (limit=6, sorted by amount desc): expired, pending, new, accepted, accepted, new
    const allBadgeTexts = await page.locator('.card .badge').allTextContents();
    const statuses = allBadgeTexts.map(t => t.trim().toLowerCase());

    // Should have "new" status badges
    expect(statuses.some(s => s === 'new')).toBe(true);

    // Should have "accepted" badge
    expect(statuses.some(s => s === 'accepted')).toBe(true);

    // Should have "expired" badge
    expect(statuses.some(s => s === 'expired')).toBe(true);

    // Total badges on page 1 should be 6
    expect(statuses.length).toBe(6);
  });

  test('should display pagination controls with 2 pages', async ({ page }) => {
    // Pagination section should be visible (10 offers / 6 per page = 2 pages)
    await expect(page.locator('.pagination')).toBeVisible();

    // Page info text should show page 1 of 2 with 10 total
    await expect(page.locator('text=Page 1 of 2')).toBeVisible();
    await expect(page.locator('text=10 offers total')).toBeVisible();
  });

  test('should navigate to page 2 showing remaining offers', async ({ page }) => {
    // Click Next to go to page 2
    await page.locator('.pagination .page-link:has-text("Next")').click();
    await page.waitForTimeout(1000);

    // Page 2 should show 4 remaining offers
    const cardTitles = await page.locator('.card h5.card-title').allTextContents();
    expect(cardTitles.length).toBe(4);

    // All page 2 offers should be from EliteCapital
    for (const title of cardTitles) {
      expect(title.trim()).toBe('EliteCapital');
    }

    // Page info should show page 2 of 2
    await expect(page.locator('text=Page 2 of 2')).toBeVisible();
  });
});
