import { test, expect } from '@playwright/test';

test.describe('Task 1 - Display offer list page with status badges', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'alice');
    await page.fill('#password', 'test@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should display offer list page with all required information', async ({ page }) => {
    await page.goto('/offers');

    await expect(page.locator('.card').first()).toBeVisible();

    await expect(page.locator('.card h5.card-title').first()).toBeVisible();
    await expect(page.locator('.card h2').first()).toBeVisible();
    await expect(page.locator('.card p.text-muted').first()).toContainText('months');
  });

  test('should display status badges on each offer', async ({ page }) => {
    await page.goto('/offers');

    const statusBadges = page.locator('.badge');
    await expect(statusBadges.first()).toBeVisible();
  });

  test('should display pagination controls at the bottom', async ({ page }) => {
    await page.goto('/offers');

    await expect(page.locator('.pagination')).toBeVisible();

    await expect(page.locator('.text-muted.ms-3')).toContainText('Page 1 of');
  });

  test('should navigate to next page using Next button', async ({ page }) => {
    await page.goto('/offers');

    const firstPageOffers = await page.locator('.card').allTextContents();

    const nextButton = page.locator('.page-link:has-text("Next")');
    await nextButton.click();

    await page.waitForTimeout(500);

    await expect(page.locator('.text-muted.ms-3')).toContainText('Page 2 of');

    const secondPageOffers = await page.locator('.card').allTextContents();
    expect(firstPageOffers).not.toEqual(secondPageOffers);
  });

  test('should navigate to previous page using Previous button', async ({ page }) => {
    await page.goto('/offers');

    await page.locator('.page-link:has-text("Next")').click();

    await page.waitForTimeout(500);

    await expect(page.locator('.text-muted.ms-3')).toContainText('Page 2 of');

    await page.locator('.page-link:has-text("Previous")').click();

    await page.waitForTimeout(500);

    await expect(page.locator('.text-muted.ms-3')).toContainText('Page 1 of');
  });
});
