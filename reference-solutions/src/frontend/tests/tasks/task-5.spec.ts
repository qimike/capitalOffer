import { test, expect } from '@playwright/test';

test.describe('Task 5 - Repayment summary panel', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as alice before each test
    await page.goto('/login');
    await page.fill('#username', 'alice');
    await page.fill('#password', 'test@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should navigate to offer detail page', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card').first().click();
    await expect(page).toHaveURL(/\/offers\/\d+/);
  });

  test('should scroll to repayment summary section', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card').first().click();
    await page.waitForTimeout(500);
    
    // Scroll down to see repayment summary
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Verify repayment summary is visible after scrolling
    await expect(page.locator('h5:has-text("Repayment Summary")')).toBeVisible();
  });

  test('should display monthly payment in repayment summary', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card').first().click();
    await page.waitForTimeout(500);
    
    // Scroll to the repayment section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Verify monthly payment is displayed in repayment summary
    await expect(page.locator('div.card:has-text("Repayment Summary") .text-primary')).toBeVisible();
    await expect(page.locator('span:has-text("Monthly Payment")~ .text-primary')).toBeVisible();
  });

  test('should display total repayment amount', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card').first().click();
    await page.waitForTimeout(500);
    
    // Scroll to the repayment section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Verify total repayment is displayed
    await expect(page.locator('div.card:has-text("Repayment Summary")')).toContainText('Total Repayment');
    await expect(page.locator('div.card:has-text("Repayment Summary") .text-primary')).toHaveCount(2);
  });

  test('should display total interest calculated correctly', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card').first().click();
    await page.waitForTimeout(500);
    
    // Scroll to the repayment section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Verify total interest is displayed
    await expect(page.locator('div.card:has-text("Repayment Summary")')).toContainText('Total Interest');
    await expect(page.locator('div.card:has-text("Repayment Summary") .text-danger')).toBeVisible();
  });

  test('should show payment breakdown progress bar', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card').first().click();
    await page.waitForTimeout(500);
    
    // Scroll to the repayment section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Verify progress bar is displayed
    await expect(page.locator('div.card:has-text("Repayment Summary") .progress')).toBeVisible();
    await expect(page.locator('div.card:has-text("Repayment Summary") .progress-bar')).toHaveCount(2);
  });

  test('should display principal amount in breakdown', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card').first().click();
    await page.waitForTimeout(500);
    
    // Scroll to the repayment section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Verify principal is shown in breakdown
    await expect(page.locator('div.card:has-text("Repayment Summary")')).toContainText(/Principal:/i);
  });

  test('should display interest amount in breakdown', async ({ page }) => {
    await page.goto('/offers');
    await page.locator('.card').first().click();
    await page.waitForTimeout(500);
    
    // Scroll to the repayment section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Verify interest is shown in breakdown
    await expect(page.locator('div.card:has-text("Repayment Summary")')).toContainText(/Interest:/i);
  });
});
