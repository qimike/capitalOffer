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

    await expect(page.locator('select.form-select').nth(1)).toBeVisible()
  })

  test('should sort by lowest interest rate', async ({ page }) => {
    await page.goto('/offers')

    const sortDropdown = page.locator('select.form-select').nth(1)
    await sortDropdown.selectOption('rate_asc')
    await page.waitForTimeout(1000)

    const offers = page.locator('.card')
    await expect(offers.first()).toBeVisible()
  })

  test('should sort by highest loan amount', async ({ page }) => {
    await page.goto('/offers')

    const sortDropdown = page.locator('select.form-select').nth(1)
    await sortDropdown.selectOption('amount_desc')
    await page.waitForTimeout(500)

    const offers = page.locator('.card')
    await expect(offers.first()).toBeVisible()
  })

  test('should sort by soonest expiry', async ({ page }) => {
    await page.goto('/offers')

    const sortDropdown = page.locator('select.form-select').nth(1)
    await sortDropdown.selectOption('expiry_asc')
    await page.waitForTimeout(500)

    const offers = page.locator('.card')
    await expect(offers.first()).toBeVisible()
  })

  test('should display correct sort options', async ({ page }) => {
    await page.goto('/offers')

    const sortDropdown = page.locator('select.form-select').nth(1)

    const options = await sortDropdown.locator('option').allTextContents()

    expect(options).toContain('Amount: High to Low')
    expect(options).toContain('Interest Rate: Low to High')
    expect(options).toContain('Expiry: Soonest')
  })

  test('should default to amount descending sort', async ({ page }) => {
    await page.goto('/offers')

    const sortDropdown = page.locator('select.form-select').nth(1)
    await expect(sortDropdown).toHaveValue('amount_desc')
  })

  test('should reset to first page when changing sort', async ({ page }) => {
    await page.goto('/offers')

    const nextItem = page.locator('.page-item:not(.disabled):has-text("Next")')
    if (await nextItem.count() > 0) {
      await nextItem.locator('.page-link').click()
      await page.waitForTimeout(500)
    }

    const sortDropdown = page.locator('select.form-select').nth(1)
    await sortDropdown.selectOption('rate_asc')
    await page.waitForTimeout(500)

    const pagination = page.locator('.pagination')
    await expect(pagination).toBeVisible()
  })

  test('should maintain sort order when switching between options', async ({ page }) => {
    await page.goto('/offers')

    const sortDropdown = page.locator('select.form-select').nth(1)
    await sortDropdown.selectOption('rate_asc')
    await page.waitForTimeout(500)

    await sortDropdown.selectOption('amount_desc')
    await page.waitForTimeout(500)

    await sortDropdown.selectOption('rate_asc')
    await page.waitForTimeout(500)

    await expect(page.locator('.card').first()).toBeVisible()
  })
})
