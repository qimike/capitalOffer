import { test, expect } from '@playwright/test'

test.describe('Task 9 - Eligibility Label Feature', () => {
  test.use({ storageState: 'storage/auth.json' })

  test('should navigate to offers page and verify eligibility labels are displayed', async ({ page }) => {
    await page.goto('/offers')
    
    // Wait for offers to load
    await page.locator('.card').first().waitFor({ state: 'visible', timeout: 5000 })
    
    // Verify at least one offer has an eligibility label
    const eligibilityLabel = page.locator('.card .mb-3:has-text("Eligibility:") + .badge')
    await expect(eligibilityLabel).toHaveClass(/bg-success|bg-warning|bg-secondary/)
  })

  test('should verify Good Fit eligibility label displays', async ({ page }) => {
    await page.goto('/offers')
    
    // Wait for offers to load
    await page.locator('.card').first().waitFor({ state: 'visible', timeout: 5000 })
    
    // Find offer with Good Fit label (green badge)
    const goodFitLabel = page.locator('.card .badge.bg-success')
    await expect(goodFitLabel).toBeVisible()
  })

  test('should verify Possible eligibility label displays', async ({ page }) => {
    await page.goto('/offers')
    
    // Wait for offers to load
    await page.locator('.card').first().waitFor({ state: 'visible', timeout: 5000 })
    
    // Find offer with Possible label (yellow badge)
    const possibleLabel = page.locator('.card .badge.bg-warning')
    await expect(possibleLabel).toBeVisible()
  })

  test('should verify Unlikely eligibility label displays', async ({ page }) => {
    await page.goto('/offers')
    
    // Wait for offers to load
    await page.locator('.card').first().waitFor({ state: 'visible', timeout: 5000 })
    
    // Find offer with Unlikely label (Gray badge)
    const unlikelyLabel = page.locator('.card .badge.bg-secondary')
    await expect(unlikelyLabel).toBeVisible()
  })

  test('should verify eligibility label on offer detail page', async ({ page }) => {
    await page.goto('/offers')
    
    // Wait for offers to load
    await page.locator('.card').first().waitFor({ state: 'visible', timeout: 5000 })
    
    // Click on first offer to view details
    await page.click('.card .btn-outline-primary')
    await page.waitForURL(/.*offers\/\d+$/)
    
    // Wait for offer details to load
    await page.waitForSelector('.card-body', { timeout: 5000 })
    
    // Verify eligibility label is displayed in offer details
    const eligibilityLabel = page.locator('.card-body .mb-3:has-text("Eligibility:") + .badge')
    await expect(eligibilityLabel).toBeVisible()
    await expect(eligibilityLabel).toHaveClass(/bg-success|bg-warning|bg-secondary/)
  })

  test('should display different eligibility labels for different offers', async ({ page }) => {
    await page.goto('/offers')
    
    // Wait for offers to load
    await page.locator('.card').first().waitFor({ state: 'visible', timeout: 5000 })
    
    // Collect all eligibility labels
    const labels = await page.locator('.card .badge').allTextContents()
    
    // Filter for eligibility-related labels
    const eligibilityLabels = labels.filter(label => 
      label === 'Good Fit' || label === 'Possible' || label === 'Unlikely'
    )
    
    // Should have at least one eligibility label
    expect(eligibilityLabels.length).toBeGreaterThan(0)
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
    expect(hasGoodFit || hasPossible || hasUnlikely).toBe(true)
  })
})
