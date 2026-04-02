import { test, expect } from '@playwright/test'

test.describe('Task 5 - Repayment Summary Panel (private)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'jane');
    await page.fill('#password', 'private@456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should display Repayment Summary section on offer detail', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card .btn-outline-primary').first().click();
    await page.waitForURL(/\/offers\/\d+$/);

    // Repayment Summary card should be visible
    const repaymentCard = page.locator('.card:has-text("Repayment Summary")');
    await expect(repaymentCard).toBeVisible();
  });

  test('should display Total Repayment with a dollar amount', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card .btn-outline-primary').first().click();
    await page.waitForURL(/\/offers\/\d+$/);

    const repaymentCard = page.locator('.card:has-text("Repayment Summary")');
    await expect(repaymentCard.locator('h6:has-text("Total Repayment")')).toBeVisible();

    // The dollar amount is in an h4 element within the repayment summary
    const h4Elements = await repaymentCard.locator('h4').allTextContents();
    const hasDollarAmount = h4Elements.some(text => /\$[\d,]+/.test(text));
    expect(hasDollarAmount).toBe(true);
  });

  test('should display Total Interest with a dollar amount', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card .btn-outline-primary').first().click();
    await page.waitForURL(/\/offers\/\d+$/);

    const repaymentCard = page.locator('.card:has-text("Repayment Summary")');
    await expect(repaymentCard.locator('h6:has-text("Total Interest")')).toBeVisible();

    // Total interest value in h4.text-danger
    const interestAmount = repaymentCard.locator('h4.text-danger');
    await expect(interestAmount).toBeVisible();
    const text = await interestAmount.textContent();
    expect(text).toMatch(/\$[\d,]+/);
  });

  test('should display payment breakdown progress bar', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card .btn-outline-primary').first().click();
    await page.waitForURL(/\/offers\/\d+$/);

    const repaymentCard = page.locator('.card:has-text("Repayment Summary")');
    await expect(repaymentCard.locator('.progress')).toBeVisible();

    // Should have principal (green) and interest (yellow) sections
    await expect(repaymentCard.locator('.progress-bar.bg-success')).toBeVisible();
    await expect(repaymentCard.locator('.progress-bar.bg-warning')).toBeVisible();
  });

  test('should display repayment summary on a different offer', async ({ page }) => {
    await page.goto('/offers');

    // Click on the second offer instead of the first
    const viewButtons = page.locator('.card .btn-outline-primary');
    const count = await viewButtons.count();
    if (count > 1) {
      await viewButtons.nth(1).click();
    } else {
      await viewButtons.first().click();
    }
    await page.waitForURL(/\/offers\/\d+$/);

    // Repayment summary should still be visible with amounts
    const repaymentCard = page.locator('.card:has-text("Repayment Summary")');
    await expect(repaymentCard).toBeVisible();

    // Monthly payment in h3 should show dollar amount
    const monthlyPayment = repaymentCard.locator('h3.text-primary');
    await expect(monthlyPayment).toBeVisible();
    const mpText = await monthlyPayment.textContent();
    expect(mpText).toMatch(/\$[\d,]+/);
  });
});
