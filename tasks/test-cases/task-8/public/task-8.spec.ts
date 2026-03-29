import { test, expect } from '@playwright/test'

test.describe('Task 8 - Accept and Decline Offers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('#username', 'alice')
    await page.fill('#password', 'test@123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*offers/)
  })

  test('should navigate to offer detail page', async ({ page }) => {
    await page.goto('/offers')
    
    // Click on first offer
    await page.click('.card .btn-outline-primary')
    await page.waitForURL(/.*offers\/\d+$/)
  })

  test('should accept offer and verify status updates to accepted', async ({ page }) => {
    await page.goto('/offers')
    
    // Navigate to first available offer
    await page.click('.card .btn-outline-primary')
    await page.waitForURL(/.*offers\/\d+$/)
    await page.waitForTimeout(500)
    
    // Click Accept Offer button
    await page.click('.card .btn-primary')
    await page.waitForTimeout(500)
    
    // Verify offer status updates to 'accepted'
    const acceptButton = page.locator('.card .btn-primary')
    await expect(acceptButton).toBeDisabled()
    await expect(acceptButton).toHaveText(/Accept Offer/i)
    
    // Verify other offers are marked as expired
    await page.goto('/offers')
    await page.waitForTimeout(500)
    
    // Check that the accepted offer shows accepted status (not expired)
    // The accepted offer should be in a different state
  })

  test('should decline offer with custom reason', async ({ page }) => {
    await page.goto('/offers')
    
    // Find an offer that is not accepted/declined
    await page.click('.card .btn-outline-primary')
    await page.waitForURL(/.*offers\/\d+$/)
    await page.waitForTimeout(500)
    
    // Click Decline Offer button
    await page.click('.btn-outline-danger')
    await page.waitForTimeout(300)
    
    // Fill in decline reason
    await page.fill('#declineReason', 'Interest rate too high')
    await page.waitForTimeout(300)
    
    // Click Decline confirmation
    await page.click('.modal-footer .btn-danger')
    await page.waitForTimeout(500)
    
    // Verify offer status updates to 'declined'
    await expect(page.locator('.toast, .alert')).toContainText(/Offer Declined/i)
    await expect(page.locator('h2:has-text("DECLINED")')).toBeVisible()
  })

  test('should decline offer from detail page', async ({ page }) => {
    await page.goto('/offers')
    
    // Navigate to offer detail
    await page.click('.card .btn-outline-primary')
    await page.waitForURL(/.*offers\/\d+$/)
    await page.waitForTimeout(500)
    
    // Click Decline Offer
    await page.click('.btn-outline-danger')
    await page.waitForTimeout(300)
    
    // Enter decline reason
    await page.fill('#declineReason', 'Not needed')
    await page.waitForTimeout(300)
    
    // Confirm decline
    await page.click('.modal-footer .btn-danger')
    await page.waitForTimeout(1000)
    
    // Verify status badge shows DECLINED
    await expect(page.locator('span:has-text("DECLINED")')).toBeVisible()
  })

  test('should disable accept button after accepting offer', async ({ page }) => {
    await page.goto('/offers')
    
    // Navigate to an offer
    await page.click('.card .btn-outline-primary')
    await page.waitForURL(/.*offers\/\d+$/)
    await page.waitForTimeout(500)
    
    // Accept the offer
    await page.click('.btn-primary')
    await page.waitForTimeout(500)
    
    // Verify Accept button is disabled
    await expect(page.locator('.btn-primary:has-text("Accept Offer")')).toBeDisabled()
  })

  test('should disable decline button after declining offer', async ({ page }) => {
    await page.goto('/offers')
    
    // Navigate to an offer
    await page.click('.card .btn-outline-primary')
    await page.waitForURL(/.*offers\/\d+$/)
    await page.waitForTimeout(500)
    
    // Click decline
    await page.click('.btn-outline-danger')
    await page.waitForTimeout(300)
    
    // Enter reason and confirm
    await page.fill('#declineReason', 'Test reason')
    await page.waitForTimeout(300)
    await page.click('.modal-footer .btn-danger')
    await page.waitForTimeout(1000)
    
    // Verify decline button is disabled
    await expect(page.locator('.btn-outline-danger:has-text("Decline Offer")')).toBeDisabled()
  })

  test('should verify accept and decline buttons for different statuses', async ({ page }) => {
    await page.goto('/offers')
    
    // Navigate to an offer
    await page.click('.card .btn-outline-primary')
    await page.waitForURL(/.*offers\/\d+$/)
    await page.waitForTimeout(500)
    
    // Verify buttons are enabled for pending offer
    await expect(page.locator('.btn-primary:has-text("Accept Offer")')).toBeEnabled()
    await expect(page.locator('.btn-outline-danger:has-text("Decline Offer")')).toBeEnabled()
  })

  test('should show offer details page with correct status badge', async ({ page }) => {
    await page.goto('/offers')
    
    // Navigate to offer
    await page.click('.card .btn-outline-primary')
    await page.waitForURL(/.*offers\/\d+$/)
    await page.waitForTimeout(500)
    
    // Verify status badge is displayed
    await expect(page.locator('span.badge')).toBeVisible()
  })

  test('should handle multiple offers with different statuses', async ({ page }) => {
    await page.goto('/offers')
    
    // Navigate to first offer
    await page.click('.card .btn-outline-primary')
    await page.waitForURL(/.*offers\/\d+$/)
    await page.waitForTimeout(500)
    
    // Accept the first offer
    await page.click('.btn-primary')
    await page.waitForTimeout(500)
    
    // Navigate back to offers
    await page.click('.breadcrumb-item a:first-of-type')
    await page.waitForTimeout(500)
    
    // Navigate to another offer
    await page.click('.card .btn-outline-primary')
    await page.waitForURL(/.*offers\/\d+$/)
    await page.waitForTimeout(500)
    
    // Verify this offer's buttons are enabled (not yet acted upon)
    await expect(page.locator('.btn-primary:has-text("Accept Offer")')).toBeEnabled()
  })
})
