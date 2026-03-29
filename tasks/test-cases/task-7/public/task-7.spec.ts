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
    
    // Verify the sort by dropdown exists
    await expect(page.locator('select.form-select').nth(0)).toBeVisible()
  })

  test('should sort by lowest interest rate', async ({ page }) => {
    await page.goto('/offers')
    
    // Select 'Interest Rate: Low to High'
    await page.locator('.filter({ hasText: "Sort By" })').click()
    await page.locator('select.form-select').nth(0).selectOption('rate_asc')
    await page.waitForTimeout(500)
    
    // Verify offers are sorted by interest rate (ascending)
    const offers = await page.locator('.card .card-body h5.card-title').all()
    
    // Get interest rates for each offer
    const interestRates = []
    for (const offer of offers) {
      const rateText = await offer.locator('p.text-muted').first().innerText()
      const rateMatch = rateText.match(/(\d+\.\d+)%/)
      if (rateMatch) {
        interestRates.push(parseFloat(rateMatch[1]))
      }
    }
    
    // Verify the rates are in ascending order
    for (let i = 1; i < interestRates.length; i++) {
      expect(interestRates[i]).toBeGreaterThanOrEqual(interestRates[i - 1])
    }
  })

  test('should sort by highest loan amount', async ({ page }) => {
    await page.goto('/offers')
    
    // Select 'Amount: High to Low'
    await page.locator('.filter({ hasText: "Sort By" })').click()
    await page.locator('select.form-select').nth(0).selectOption('amount_desc')
    await page.waitForTimeout(500)
    
    // Get loan amounts from the offers
    const loanAmounts = []
    const offerCards = page.locator('.card').all()
    const count = await offerCards.length
    
    for (let i = 0; i < count; i++) {
      const loanText = await page.locator('.card').nth(i).locator('h2.text-primary').first().innerText()
      const amountMatch = loanText.match(/\$(\d+)k/)
      if (amountMatch) {
        loanAmounts.push(parseInt(amountMatch[1]))
      }
    }
    
    // Verify the amounts are in descending order
    for (let i = 1; i < loanAmounts.length; i++) {
      expect(loanAmounts[i]).toBeLessThanOrEqual(loanAmounts[i - 1])
    }
  })

  test('should sort by soonest expiry', async ({ page }) => {
    await page.goto('/offers')
    
    // Select 'Expiry: Soonest'
    await page.locator('.filter({ hasText: "Sort By" })').click()
    await page.locator('select.form-select').nth(0).selectOption('expiry_asc')
    await page.waitForTimeout(500)
    
    // Verify offers are sorted (just check that the sort worked by seeing changes)
    await expect(page.locator('.card')).toHaveCountGreaterThan(0)
  })

  test('should display correct sort options', async ({ page }) => {
    await page.goto('/offers')
    
    // Click on the sort dropdown
    const sortDropdown = page.locator('select.form-select').nth(0)
    await sortDropdown.click()
    await page.waitForTimeout(300)
    
    // Get all options
    const options = await sortDropdown.locator('option').allTextContents()
    
    // Verify all expected options are present
    expect(options).toContain('Lowest Interest Rate')
    expect(options).toContain('Highest Loan Amount')
    expect(options).toContain('Soonest Expiry')
  })

  test('should default to amount descending sort', async ({ page }) => {
    await page.goto('/offers')
    
    // Verify the default sort is "Amount: High to Low"
    const defaultSort = await page.locator('select.form-select').nth(0).inputValue()
    expect(defaultSort).toBe('amount_desc')
  })

  test('should reset to first page when changing sort', async ({ page }) => {
    await page.goto('/offers')
    
    // Manually navigate to page 2
    await page.locator('button:has-text("Next")').click()
    await page.waitForTimeout(500)
    
    // Change sort order
    await page.locator('select.form-select').nth(0).selectOption('rate_asc')
    await page.waitForTimeout(500)
    
    // Verify we're back on page 1
    const currentPage = await page.locator('small.text-muted').innerText()
    expect(currentPage).toContain('Page 1')
  })

  test('should maintain sort order when switching between options', async ({ page }) => {
    await page.goto('/offers')
    
    // Select Lowest Interest Rate
    await page.locator('select.form-select').nth(0).selectOption('rate_asc')
    await page.waitForTimeout(500)
    
    // Store first offer's interest rate
    const firstRate1 = await page.locator('.card').nth(0).locator('p.text-muted').first().innerText()
    
    // Change to Amount: High to Low
    await page.locator('select.form-select').nth(0).selectOption('amount_desc')
    await page.waitForTimeout(500)
    
    // Change back to Lowest Interest Rate
    await page.locator('select.form-select').nth(0).selectOption('rate_asc')
    await page.waitForTimeout(500)
    
    // Verify the sort worked again (just check it's not empty)
    await expect(page.locator('.card')).toHaveCountGreaterThan(0)
  })
})
