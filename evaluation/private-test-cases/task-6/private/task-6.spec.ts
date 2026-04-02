import { test, expect } from '@playwright/test'

test.describe('Task 6 - Shortlist an Offer (private)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'jane');
    await page.fill('#password', 'private@456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should navigate to shortlist page and see heading', async ({ page }) => {
    await page.goto('/shortlist')
    await expect(page.locator('h2')).toContainText('Shortlist')
    await expect(page.locator('.btn:has-text("Back to Offers")')).toBeVisible()
  })

  test('should add an offer to shortlist via bookmark icon', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })

    // Find a bookmark button (unfilled) and click to shortlist
    const bookmarkBtn = page.locator('.card button:has(i.bi-bookmark)').first()
    await bookmarkBtn.click()
    await page.waitForTimeout(500)

    // After clicking, icon should change to filled bookmark
    const filledBookmarks = await page.locator('.card button:has(i.bi-bookmark-fill)').count()
    expect(filledBookmarks).toBeGreaterThanOrEqual(1)
  })

  test('should see shortlisted offer on shortlist page with private lender name', async ({ page }) => {
    // First shortlist an offer
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })
    const bookmarkBtn = page.locator('.card button:has(i.bi-bookmark)').first()
    await bookmarkBtn.click()
    await page.waitForTimeout(500)

    // Navigate to shortlist page
    await page.goto('/shortlist')
    await page.waitForTimeout(1000)

    // Should see at least one card with a private lender name
    const cardTitles = await page.locator('.card h5.card-title').allTextContents()
    expect(cardTitles.length).toBeGreaterThan(0)
    const privateLenders = ['PrivateLend', 'EliteCapital', 'PremierFinance']
    const hasPrivateLender = cardTitles.some(t => privateLenders.includes(t.trim()))
    expect(hasPrivateLender).toBe(true)
  })

  test('should remove an offer from shortlist page', async ({ page }) => {
    // First make sure there's something on the shortlist
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })
    const bookmarkBtn = page.locator('.card button:has(i.bi-bookmark)').first()
    if (await bookmarkBtn.count() > 0) {
      await bookmarkBtn.click()
      await page.waitForTimeout(500)
    }

    await page.goto('/shortlist')
    await page.waitForTimeout(1000)

    const initialCount = await page.locator('.card h5.card-title').count()
    if (initialCount > 0) {
      // Handle the confirm dialog for removal
      page.on('dialog', async dialog => {
        await dialog.accept()
      })

      // Click remove button on first shortlisted offer
      await page.locator('.card button.btn-outline-danger').first().click()
      await page.waitForTimeout(500)

      // Count should decrease by 1
      const newCount = await page.locator('.card h5.card-title').count()
      expect(newCount).toBeLessThan(initialCount)
    }
  })

  test('should navigate back to offers from shortlist', async ({ page }) => {
    await page.goto('/shortlist')
    await page.locator('.btn:has-text("Back to Offers")').click()
    await expect(page).toHaveURL(/\/offers/)
    await expect(page.locator('h2')).toContainText('My Offers')
  })
})
