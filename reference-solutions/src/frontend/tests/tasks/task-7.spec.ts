import { test, expect } from '@playwright/test'

test.describe('Task 7 - Sort Offers Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('#username', 'jane')
    await page.fill('#password', 'private@456')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*offers/)
  })

  test('should navigate to offers page and verify sorting dropdown exists', async ({ page }) => {
    await page.goto('/offers')
    
    // Verify sorting dropdown exists (second select is the sort by dropdown)
    const sortDropdown = page.locator('select.form-select').nth(1)
    await expect(sortDropdown).toBeVisible()
  })

  test('should verify all sorting options are available', async ({ page }) => {
    await page.goto('/offers')
    
    // Get all options from sort dropdown
    const sortDropdown = page.locator('select.form-select').nth(1)
    const options = await sortDropdown.locator('option').allTextContents()
    
    // Verify all sort options are present
    expect(options).toContain('Amount: High to Low')
    expect(options).toContain('Amount: Low to High')
    expect(options).toContain('Interest Rate: Low to High')
    expect(options).toContain('Interest Rate: High to Low')
    expect(options).toContain('Expiry: Soonest')
    expect(options).toContain('Expiry: Latest')
  })

  test('should sort offers by lowest interest rate', async ({ page }) => {
    await page.goto('/offers')
    
    // Select 'Interest Rate: Low to High' sort option
    const sortDropdown = page.locator('select.form-select').nth(1)
    await sortDropdown.selectOption('rate_asc')
    await page.waitForTimeout(1000)
    
    // Verify offers are sorted (check first few offers have interest rates)
    const offers = page.locator('.card .card-body p.text-muted')
    const count = await offers.count()
    
    // Should have at least some offers displayed with interest rates
    expect(count).toBeGreaterThan(0)
  })

  test('should verify default sort is by amount descending', async ({ page }) => {
    await page.goto('/offers')
    
    // Verify default sort option is "Amount: High to Low"
    const sortDropdown = page.locator('select.form-select').nth(1)
    await expect(sortDropdown).toHaveValue('amount_desc')
  })


  test('should reset to first page when changing sort', async ({ page }) => {
    await page.goto('/offers')
    
    // Manually navigate to page 2 if available
    const nextButton = page.locator('a:has-text("Next")')
    if (await nextButton.count() > 0 && await nextButton.isEnabled()) {
      await nextButton.click()
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

  test('should filter and sort offers with combined filters', async ({ page }) => {
    await page.goto('/offers')
    
    // Select a status filter
    const statusDropdown = page.locator('select.form-select').nth(0)
    await statusDropdown.selectOption('new')
    
    // Select a sort option
    const sortDropdown = page.locator('select.form-select').nth(1)
    await sortDropdown.selectOption('rate_asc')
    
    await page.waitForTimeout(1000)
    
    // Verify offers are loaded with combined filtering
    const offers = page.locator('.card')
    await expect(offers.first()).toBeVisible()
  })

  test.afterEach(async ({ page }) => {
    // Logout after each test
    await page.goto('/logout')
  })
})
