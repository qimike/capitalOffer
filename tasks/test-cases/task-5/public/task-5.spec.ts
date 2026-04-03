import { test, expect } from '@playwright/test'

test.describe('Task 5 - Repayment Summary Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'alice');
    await page.fill('#password', 'test@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should display monthly payment on offer detail', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card .btn-outline-primary').first().click()
    await page.waitForURL(/\/offers\/\d+$/);

    const repaymentCard = page.locator('.card:has-text("Repayment Summary")');
    await expect(repaymentCard.locator('h6:has-text("Monthly Payment")')).toBeVisible();

    const monthlyPayment = repaymentCard.locator('h3.text-primary');
    await expect(monthlyPayment).toBeVisible();
    const value = await monthlyPayment.textContent();
    expect(value).toMatch(/\$[\d,]+/);
  })

  test('should display total repayment amount', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card .btn-outline-primary').first().click()

    await expect(page.locator('.card:has-text("Repayment Summary") h6:has-text("Total Repayment")')).toBeVisible()
  })

  test('should display total interest in repayment summary', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card .btn-outline-primary').first().click()

    await expect(page.locator('.card:has-text("Repayment Summary") h6:has-text("Total Interest")')).toBeVisible()
  })

  test('should show payment breakdown progress bar', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card .btn-outline-primary').first().click()
    await expect(page.locator('.card:has-text("Repayment Summary") .progress')).toBeVisible()
  })
})
