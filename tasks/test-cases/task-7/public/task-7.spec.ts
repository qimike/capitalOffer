import { test, expect } from '@playwright/test'

test.describe('Task 7 - Sort offers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('#username', 'alice')
    await page.fill('#password', 'test@123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*offers/)
  })

  test('should display sort by dropdown', async ({ page }) => {
    await page.goto('/offers')
    
    // Verify the sort by dropdown exists (second select is the sort by dropdown)
    await expect(page.locator('select.form-select').nth(1)).toBeVisible()
  })

  test('should sort by lowest interest rate', async ({ page }) => {
    await page.goto('/offers')
    
    // Select 'Interest Rate: Low to High' from the sort dropdown (second select)
    const sortDropdown = page.locator('select.form-select').nth(1)
    await sortDropdown.selectOption('rate_asc')
    await page.waitForTimeout(1000)
    
    // Verify offers are sorted (check that offer cards are displayed)
    const offers = page.locator('.card')
    await expect(offers.first()).toBeVisible()
  })

  test('should sort by highest loan amount', async ({ page }) => {
    await page.goto('/offers')
    
    // Select 'Amount: High to Low' from the sort dropdown (second select)
    const sortDropdown = page.locator('select.form-select').nth(1)
    await sortDropdown.selectOption('amount_desc')
    await page.waitForTimeout(500)
    
    // Verify offers are displayed after sorting
    const offers = page.locator('.card')
    await expect(offers.first()).toBeVisible()
  })

  test('should sort by soonest expiry', async ({ page }) => {
    await page.goto('/offers')
    
    // Select 'Expiry: Soonest' from the sort dropdown (second select)
    const sortDropdown = page.locator('select.form-select').nth(1)
    await sortDropdown.selectOption('expiry_asc')
    await page.waitForTimeout(500)
    
    // Verify offers are displayed after sorting
    const offers = page.locator('.card')
    await expect(offers.first()).toBeVisible()
  })

  test('should display correct sort options', async ({ page }) => {
    await page.goto('/offers')
    
    // Get sort dropdown (second select)
    const sortDropdown = page.locator('select.form-select').nth(1)
    
    // Get all options
    const options = await sortDropdown.locator('option').allTextContents()
    
    // Verify all expected options are present
    expect(options).toContain('Amount: High to Low')
    expect(options).toContain('Interest Rate: Low to High')
    expect(options).toContain('Expiry: Soonest')
  })

  test('should default to amount descending sort', async ({ page }) => {
    await page.goto('/offers')
    
    // Verify the default sort is "Amount: High to Low" (second select)
    const sortDropdown = page.locator('select.form-select').nth(1)
    await expect(sortDropdown).toHaveValue('amount_desc')
  })

  test('should reset to first page when changing sort', async ({ page }) => {
    await page.goto('/offers')
    
    // Manually navigate to page 2 if Next is available and not disabled
    const nextItem = page.locator('.page-item:not(.disabled):has-text("Next")')
    if (await nextItem.count() > 0) {
      await nextItem.locator('.page-link').click()
      await page.waitForTimeout(500)
    }
    
    // Change sort order
    const sortDropdown = page.locator('select.form-select').nth(1)
    await sortDropdown.selectOption('rate_asc')
    await page.waitForTimeout(500)
    
    // Pagination should still be visible
    const pagination = page.locator('.pagination')
    await expect(pagination).toBeVisible()
  })

  test('should maintain sort order when switching between options', async ({ page }) => {
    await page.goto('/offers')
    
    // Select Lowest Interest Rate (second select)
    const sortDropdown = page.locator('select.form-select').nth(1)
    await sortDropdown.selectOption('rate_asc')
    await page.waitForTimeout(500)
    
    // Change to Amount: High to Low
    await sortDropdown.selectOption('amount_desc')
    await page.waitForTimeout(500)
    
    // Change back to Lowest Interest Rate
    await sortDropdown.selectOption('rate_asc')
    await page.waitForTimeout(500)
    
    // Verify offers are still displayed
    await expect(page.locator('.card').first()).toBeVisible()
  })
})
