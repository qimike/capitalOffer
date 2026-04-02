import { test, expect } from '@playwright/test'

test.describe('Task 9 - Eligibility Label Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('#username', 'alice')
    await page.fill('#password', 'test@123')
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

  test('should have eligibility label on every offer card', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })

    const eligibilityBadges = await page.locator('.card .badge.fs-6').count()
    const offerCards = await page.locator('.card .btn-outline-primary').count()

    expect(eligibilityBadges).toBe(offerCards)
  })
})
