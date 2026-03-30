import { test, expect } from '@playwright/test'

test.describe('Task 5 - Repayment Summary Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as alice before each test
    await page.goto('/login');
    await page.fill('#username', 'jane');
    await page.fill('#password', 'private@456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });


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
    // Payment breakdown progress bar should be visible
    await expect(page.locator('.card:has-text("Repayment Summary") .progress')).toBeVisible()
  })
})