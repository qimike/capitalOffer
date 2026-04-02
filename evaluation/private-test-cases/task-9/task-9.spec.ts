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

    // Eligibility labels should appear on the cards
    const eligibilityBadges = page.locator('.card .badge.fs-6')
    const count = await eligibilityBadges.count()
    expect(count).toBeGreaterThan(0)

    // Each label should be one of the three categories
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

    // Good Fit = bg-success, Possible = bg-warning, Unlikely = bg-danger
    const greenBadges = await page.locator('.card .badge.fs-6.bg-success').count()
    const yellowBadges = await page.locator('.card .badge.fs-6.bg-warning').count()
    const redBadges = await page.locator('.card .badge.fs-6.bg-danger').count()

    // At least one eligibility badge type should be present
    expect(greenBadges + yellowBadges + redBadges).toBeGreaterThan(0)
  })

  test('should display eligibility icons alongside labels', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })

    // Eligibility badges should contain icons
    const badgesWithIcons = page.locator('.card .badge.fs-6 i')
    const count = await badgesWithIcons.count()
    expect(count).toBeGreaterThan(0)

    // Check that correct icon classes are used
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

    // Each offer card should have an eligibility badge
    const eligibilityBadges = await page.locator('.card .badge.fs-6').count()
    const offerCards = await page.locator('.card .btn-outline-primary').count()

    // Every offer should have an eligibility label
    expect(eligibilityBadges).toBe(offerCards)
  })
})
