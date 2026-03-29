import { test, expect } from '@playwright/test'

test.describe('Task 6 - Shortlist an offer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('#username', 'alice')
    await page.fill('#password', 'test@123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*offers/)
  })

  test('should add an offer to shortlist', async ({ page }) => {
    await page.goto('/offers')
    
    // Find an offer that is not shortlisted
    const firstUnshortlistedOffer = page.locator(
      '.card .card-body > div:nth-child(2) > button.btn-outline-secondary'
    ).first()
    
    await expect(firstUnshortlistedOffer).toBeVisible()
    await firstUnshortlistedOffer.click()
    await page.waitForTimeout(500)
    
    // Verify the bookmark icon is filled (blue)
    await expect(page.locator(
      '.card .card-body > div:nth-child(2) > button.btn-primary'
    )).toBeVisible()
  })

  test('should remove an offer from shortlist', async ({ page }) => {
    await page.goto('/offers')
    
    // Find an offer that is shortlisted
    const firstShortlistedOffer = page.locator(
      '.card .card-body > div:nth-child(2) > button.btn-primary'
    ).nth(0)
    
    await expect(firstShortlistedOffer).toBeVisible()
    await firstShortlistedOffer.click()
    await page.waitForTimeout(500)
    
    // Verify the bookmark icon is outline (gray)
    await expect(page.locator(
      '.card .card-body > div:nth-child(2) > button.btn-outline-secondary'
    )).toBeVisible()
  })

  test('should navigate to shortlist page and verify offers', async ({ page }) => {
    await page.goto('/offers')
    
    // Navigate to shortlist page
    await page.goto('/shortlist')
    
    // Verify the shortlist page loads
    await expect(page.locator('h2:has-text("Shortlist")')).toBeVisible()
    await expect(page.locator('.btn:has-text("Back to Offers")')).toBeVisible()
  })

  test('should verify shortlisted offers are displayed on shortlist page', async ({ page }) => {
    await page.goto('/offers')
    
    // Find a shortlisted offer (blue filled bookmark)
    const shortlistedOffer = page.locator(
      '.card .card-body > div:nth-child(2) > button.btn-primary'
    ).first()
    
    // Click on remove to understand current state
    // Get the lender name from the offer card
    const lenderName = await page.locator(
      '.card .card-body h5.card-title'
    ).first().textContent()
    
    await page.goto('/shortlist')
    await page.waitForTimeout(500)
    
    // Wait for shortlist page to load
    await expect(page.locator('h2:has-text("Shortlist")')).toBeVisible()
    
    // Check if offers are displayed
    const offersOnShortlist = await page.locator('.card').count()
    
    if (offersOnShortlist > 0) {
      // If there are shortlisted offers, verify they appear
      const shortlistedLenders = await page.locator(
        '.card .card-body h5.card-title'
      ).allTextContents()
      expect(shortlistedLenders).not.toEqual([])
    } else {
      // If no shortlisted offers, verify the empty state message
      await expect(
        page.locator('p:has-text("No shortlisted offers yet")')
      ).toBeVisible()
    }
  })

  test('should remove an offer from shortlist on shortlist page', async ({ page }) => {
    await page.goto('/offers')
    
    // Find a shortlisted offer
    const shortlistedOffer = page.locator(
      '.card .card-body > div:nth-child(2) > button.btn-primary'
    ).first()
    
    // Get the lender name to use as reference
    const lenderName = await page.locator(
      '.card .card-body h5.card-title'
    ).first().textContent()
    
    await page.goto('/shortlist')
    await page.waitForTimeout(500)
    
    const offersOnShortlistBefore = await page.locator('.card').count()
    
    if (offersOnShortlistBefore > 0) {
      // Find and click the remove button
      await page.locator(
        '.card .card-body > div:last-child button.btn-outline-danger'
      ).first().click()
      
      await page.waitForTimeout(500)
      
      // Verify the offer is removed
      const offersOnShortlistAfter = await page.locator('.card').count()
      expect(offersOnShortlistAfter).toBeLessThan(offersOnShortlistBefore)
    }
  })

  test('should display bookmark icon on offer cards', async ({ page }) => {
    await page.goto('/offers')
    
    // Wait for offers to load
    await page.waitForTimeout(500)
    
    // Check that all offer cards have bookmark icons
    const bookmarkIcons = await page.locator(
      '.card .card-body > div:nth-child(2) button'
    ).count()
    
    expect(bookmarkIcons).toBeGreaterThan(0)
  })

  test('should navigate back to offers from shortlist', async ({ page }) => {
    await page.goto('/shortlist')
    
    // Click Back to Offers button
    await page.click('.btn:has-text("Back to Offers")')
    await page.waitForTimeout(500)
    
    // Verify we're back on the offers page
    await expect(page.locator('h2:has-text("My Offers")')).toBeVisible()
  })

  test('should show empty state when no shortlisted offers', async ({ page }) => {
    // Use a user that has no shortlisted offers or clear the shortlist first
    await page.goto('/signup')
    
    // Fill the signup form
    await page.fill('#username', 'testshortlist10')
    await page.fill('#email', `test${Date.now()}@gmail.com`)
    await page.fill('#password', 'test@123')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(500)
    
    // Go to shortlist page
    await page.goto('/shortlist')
    await page.waitForTimeout(500)
    
    // Verify empty state
    await expect(
      page.locator('i.bi-heart.display-1')
    ).toBeVisible()
    await expect(
      page.locator('p:has-text("No shortlisted offers yet")')
    ).toBeVisible()
  })
})
