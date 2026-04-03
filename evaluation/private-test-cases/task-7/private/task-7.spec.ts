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

  test('should sort by lowest interest rate and verify ascending order', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })

    await page.locator('select.form-select').nth(1).selectOption('rate_asc')
    await page.waitForTimeout(1000)

    const rateTexts = await page.locator('.card .text-muted.mb-0').allTextContents()
    const rates = rateTexts
      .map(t => { const m = t.match(/([\d.]+)%/); return m ? parseFloat(m[1]) : NaN })
      .filter(n => !isNaN(n))

    expect(rates.length).toBeGreaterThan(1)
    for (let i = 1; i < rates.length; i++) {
      expect(rates[i]).toBeGreaterThanOrEqual(rates[i - 1])
    }
  })

  test('should sort by highest loan amount and verify descending order', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })

    await page.locator('select.form-select').nth(1).selectOption('amount_desc')
    await page.waitForTimeout(1000)

    const amountTexts = await page.locator('.card h2.text-primary').allTextContents()
    const amounts = amountTexts
      .map(t => { const m = t.replace(/[^0-9.]/g, ''); return parseFloat(m) })
      .filter(n => !isNaN(n))

    expect(amounts.length).toBeGreaterThan(1)
    for (let i = 1; i < amounts.length; i++) {
      expect(amounts[i]).toBeLessThanOrEqual(amounts[i - 1])
    }
  })

  test('should sort by soonest expiry and verify order via API', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })

    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/offers') && resp.url().includes('expiry')),
      page.locator('select.form-select').nth(1).selectOption('expiry_asc'),
    ])

    const json = await response.json()
    const results = json.results || json
    const expiryDates = results.map((o: any) => o.expiry_date)

    expect(expiryDates.length).toBeGreaterThan(1)
    for (let i = 1; i < expiryDates.length; i++) {
      expect(new Date(expiryDates[i]).getTime()).toBeGreaterThanOrEqual(new Date(expiryDates[i - 1]).getTime())
    }
  })

  test('should reset to first page when changing sort', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })

    const nextButton = page.locator('.page-item:not(.disabled):has-text("Next")')
    if (await nextButton.count() > 0) {
      await nextButton.locator('.page-link').click()
      await page.waitForTimeout(500)
    }

    await page.locator('select.form-select').nth(1).selectOption('rate_asc')
    await page.waitForTimeout(500)

    await expect(page.locator('.text-muted.ms-3')).toContainText('Page 1')
  })

  test('should combine status filter with sort', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })

    await page.locator('select.form-select').nth(0).selectOption('new')
    await page.waitForTimeout(500)

    await page.locator('select.form-select').nth(1).selectOption('rate_asc')
    await page.waitForTimeout(1000)

    const badges = await page.locator('.card .badge').allTextContents()
    expect(badges.length).toBeGreaterThan(0)
    for (const badge of badges) {
      expect(badge.trim().toLowerCase()).toBe('new')
    }
  })
})
