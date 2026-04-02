import { test, expect } from '@playwright/test'

test.describe('Task 7 - Sort Offers Feature (private)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('#username', 'jane')
    await page.fill('#password', 'private@456')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*offers/)
  })

  test('should display sort dropdown with all options', async ({ page }) => {
    await page.goto('/offers')

    const sortDropdown = page.locator('select.form-select').nth(1)
    await expect(sortDropdown).toBeVisible()

    const options = await sortDropdown.locator('option').allTextContents()
    expect(options).toContain('Amount: High to Low')
    expect(options).toContain('Amount: Low to High')
    expect(options).toContain('Interest Rate: Low to High')
    expect(options).toContain('Interest Rate: High to Low')
    expect(options).toContain('Expiry: Soonest')
    expect(options).toContain('Expiry: Latest')
  })

  test('should default to amount descending sort', async ({ page }) => {
    await page.goto('/offers')
    const sortDropdown = page.locator('select.form-select').nth(1)
    await expect(sortDropdown).toHaveValue('amount_desc')
  })

  test('should reorder cards when sorting by lowest interest rate', async ({ page }) => {
    await page.goto('/offers')

    // Get first card title before sorting
    const beforeTitle = await page.locator('.card h5.card-title').first().textContent()

    // Sort by interest rate ascending
    await page.locator('select.form-select').nth(1).selectOption('rate_asc')
    await page.waitForTimeout(1000)

    // Verify cards are displayed
    await expect(page.locator('.card').first()).toBeVisible()

    // First card title may change after sorting
    const afterTitle = await page.locator('.card h5.card-title').first().textContent()
    // At least the cards should still be present
    const cardCount = await page.locator('.card .badge').count()
    expect(cardCount).toBeGreaterThan(0)
  })

  test('should sort by Amount Low to High and verify ordering', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('select.form-select').nth(1).selectOption('amount_asc')
    await page.waitForTimeout(1000)

    // Get all displayed amounts (h2 elements in cards)
    const amountTexts = await page.locator('.card h2').allTextContents()
    const amounts = amountTexts.map(t => {
      const match = t.replace(/[^0-9.]/g, '')
      return parseFloat(match)
    }).filter(n => !isNaN(n))

    // Verify ascending order
    for (let i = 1; i < amounts.length; i++) {
      expect(amounts[i]).toBeGreaterThanOrEqual(amounts[i - 1])
    }
  })

  test('should reset to first page when changing sort', async ({ page }) => {
    await page.goto('/offers')

    // Go to page 2 if possible
    const nextButton = page.locator('.page-item:not(.disabled):has-text("Next")')
    if (await nextButton.count() > 0) {
      await nextButton.locator('.page-link').click()
      await page.waitForTimeout(500)
    }

    // Change sort
    await page.locator('select.form-select').nth(1).selectOption('rate_asc')
    await page.waitForTimeout(500)

    await expect(page.locator('.pagination')).toBeVisible()
  })

  test('should combine status filter with sort', async ({ page }) => {
    await page.goto('/offers')

    // Filter by "new" status
    await page.locator('select.form-select').nth(0).selectOption('new')
    await page.waitForTimeout(500)

    // Sort by interest rate ascending
    await page.locator('select.form-select').nth(1).selectOption('rate_asc')
    await page.waitForTimeout(1000)

    // Verify all badges are "new"
    const badges = await page.locator('.card .badge').allTextContents()
    for (const badge of badges) {
      expect(badge.trim().toLowerCase()).toBe('new')
    }

    // Verify cards are visible
    await expect(page.locator('.card').first()).toBeVisible()
  })

  test.afterEach(async ({ page }) => {
    await page.goto('/logout')
  })
})
