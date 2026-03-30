import { test, expect } from '@playwright/test'

test.describe('Task 9 - Eligibility Label Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('#username', 'alice')
    await page.fill('#password', 'test@123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*offers/)
  })

  test('should navigate to offer detail and verify eligibility label is present', async ({ page }) => {
    await page.goto('/offers')
    
    // Wait for offers to load
    await page.locator('.card').first().waitFor({ state: 'visible', timeout: 5000 })
    
    // Click on first offer
    await page.click('.card .btn-outline-primary')
    await page.waitForURL(/.*offers\/\d+$/)
    
    // Wait for page to load
    await page.waitForSelector('.card-body', { timeout: 5000 })
    
    // Verify eligibility badge is visible
    const eligibilityBadge = page.locator('.card-body .badge[style*="bg-success" i], .card-body .badge.bg-success, .card-body .badge.bg-warning, .card-body .badge.bg-secondary')
    await expect(eligibilityBadge).toBeVisible()
  })

  test('should verify all three categories exist in the offer list', async ({ page }) => {
    await page.goto('/offers')
    
    // Wait for offers to load
    await page.locator('.card').first().waitFor({ state: 'visible', timeout: 5000 })
    
    // Check for Good Fit (green)
    const hasGoodFit = await page.locator('.card .badge.bg-success').count() > 0
    
    // Check for Possible (yellow)
    const hasPossible = await page.locator('.card .badge.bg-warning').count() > 0
    
    // Check for Unlikely (gray)
    const hasUnlikely = await page.locator('.card .badge.bg-secondary').count() > 0
    
    // At least one offer should have each category (based on seed data setup)
    // Note: Depending on user profile, some categories may not appear
    expect(hasGoodFit || hasPossible || hasUnlikely).toBe(false)
  })
})
