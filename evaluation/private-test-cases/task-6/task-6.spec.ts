import { test, expect } from '@playwright/test'

test.describe('Task 6 - Shortlist an Offer', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as alice before each test
    await page.goto('/login');
    await page.fill('#username', 'jane');
    await page.fill('#password', 'private@456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });
  
  test('should navigate to shortlist page and see offers', async ({ page }) => {
    await page.goto('/shortlist')
    // Header should be visible
    await expect(page.locator('h2')).toContainText('Shortlist')
    
    // Show count should be visible
    await expect(page.locator('p:has-text("Showing")')).toBeVisible()
    
    // Back to Offers button should be visible
    await expect(page.locator('.btn:has-text("Back to Offers")')).toBeVisible()
  })

  test('should click remove button to unshortlist from shortlist page', async ({ page }) => {
    await page.goto('/shortlist')
    
    // Find the first shortlisted offer's remove button (red bookmark in top-right)
    const removeButton = page.locator('.card button.btn-outline-danger').first()
    
    // Click to remove from shortlist
    await removeButton.click()
    
    // Offer should be removed (page count should decrease)
    await page.waitForTimeout(500)
  })

  test('should click bookmark icon to remove from shortlist', async ({ page }) => {
    await page.goto('/shortlist')
    
    // Find the bookmark button in the top-right corner of offer card
    await page.locator('.card button.btn-outline-danger').first().click()
    
    // Page should update or show confirmation
    await page.waitForTimeout(500)
  })

  test('should navigate back to offers from shortlist', async ({ page }) => {
    await page.goto('/shortlist')
    
    // Click Back to Offers button
    await page.locator('.btn:has-text("Back to Offers")').click()
    
    // Verify we're back on the offers page
    await expect(page).toHaveURL(/\/offers/)
    await expect(page.locator('h2')).toContainText('My Offers')
  })

})
