import { test, expect } from '@playwright/test'

test.describe('Task 9 - Eligibility Label Feature (private)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('#username', 'jane')
    await page.fill('#password', 'private@456')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*offers/)
  })

  test('should display eligibility badges on offer cards', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })

    const eligibilityBadges = page.locator('.card .badge.fs-6')
    const count = await eligibilityBadges.count()
    expect(count).toBeGreaterThan(0)

    const validLabels = ['Good Fit', 'Possible', 'Unlikely']
    const labelTexts = await eligibilityBadges.allTextContents()
    for (const text of labelTexts) {
      const trimmed = text.trim()
      expect(validLabels.some(v => trimmed.includes(v))).toBe(true)
    }
  })

  test('should show correct badge color classes for eligibility labels', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })

    const greenBadges = await page.locator('.card .badge.fs-6.bg-success').count()
    const yellowBadges = await page.locator('.card .badge.fs-6.bg-warning').count()
    const redBadges = await page.locator('.card .badge.fs-6.bg-danger').count()

    expect(greenBadges + yellowBadges + redBadges).toBeGreaterThan(0)
  })

  test('should display eligibility icons alongside labels', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })

    const badgesWithIcons = page.locator('.card .badge.fs-6 i')
    const count = await badgesWithIcons.count()
    expect(count).toBeGreaterThan(0)

    const allIcons = await badgesWithIcons.all()
    const validIconClasses = ['bi-check-circle-fill', 'bi-question-circle-fill', 'bi-x-circle-fill']
    for (const icon of allIcons) {
      const classes = await icon.getAttribute('class')
      expect(validIconClasses.some(c => classes?.includes(c))).toBe(true)
    }
  })

  test('should have eligibility label on every offer card', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })

    const eligibilityBadges = await page.locator('.card .badge.fs-6').count()
    const offerCards = await page.locator('.card .btn-outline-primary').count()

    expect(eligibilityBadges).toBe(offerCards)
  })

  test('should display eligibility label on offer detail page', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })

    // Record the eligibility label from the first card
    const firstCardBadge = page.locator('.card .badge.fs-6').first()
    const listLabel = (await firstCardBadge.textContent())!.trim()

    // Click "View Details" on the first offer card
    await page.locator('.card .btn-outline-primary').first().click()
    await page.waitForURL(/.*offers\/\d+/)

    // The detail page should show an eligibility badge with one of the valid labels
    const validLabels = ['Good Fit', 'Possible', 'Unlikely']
    const detailBadge = page.locator('.badge.fs-6').filter({ hasText: /Good Fit|Possible|Unlikely/ })
    await expect(detailBadge).toBeVisible({ timeout: 10000 })

    const detailLabel = (await detailBadge.textContent())!.trim()
    expect(validLabels.some(v => detailLabel.includes(v))).toBe(true)
  })

  test('should update eligibility labels when profile data changes', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })

    // Capture current eligibility labels
    const beforeLabels = await page.locator('.card .badge.fs-6').allTextContents()
    const beforeTrimmed = beforeLabels.map(t => t.trim())
    expect(beforeTrimmed.length).toBeGreaterThan(0)

    // Get auth token from localStorage
    const token = await page.evaluate(() => localStorage.getItem('authToken'))

    // Set profile to "excellent" credit with high income → should yield "Good Fit"
    await page.request.put('http://localhost:3000/api/profile/', {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { credit_band: 'excellent', annual_income: 200000, employment_status: 'employed_full_time' }
    })

    // Reload offers page to pick up recalculated labels
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })

    const afterLabels = await page.locator('.card .badge.fs-6').allTextContents()
    const afterTrimmed = afterLabels.map(t => t.trim())
    expect(afterTrimmed.length).toBeGreaterThan(0)

    // The labels should have changed (all should now be "Good Fit" with excellent profile)
    const allGoodFit = afterTrimmed.every(l => l.includes('Good Fit'))
    expect(allGoodFit).toBe(true)

    // Restore profile to defaults
    await page.request.put('http://localhost:3000/api/profile/', {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { credit_band: null, annual_income: null, employment_status: null }
    })
  })
})
