import { test, expect } from '@playwright/test'

test.describe('Task 6 - Shortlist an Offer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'alice');
    await page.fill('#password', 'test@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should display shortlist page with header and back button', async ({ page }) => {
    await page.goto('/shortlist')
    await expect(page.locator('h2').filter({ hasText: 'Shortlist' })).toBeVisible()

    await expect(page.locator('.btn:has-text("Back to Offers")')).toBeVisible()
  })

  test('should shortlist an offer from offers page and see it on shortlist page', async ({ page }) => {
    await page.goto('/offers')

    const bookmarkBtn = page.locator('.card-body .d-flex button.btn-outline-secondary i.bi-bookmark').first()
    await bookmarkBtn.click()
    await page.waitForTimeout(1500)

    await page.goto('/shortlist')
    await page.waitForTimeout(1000)

    await expect(page.locator('.card').first()).toBeVisible()
  })

  test('should remove an offer from shortlist page', async ({ page }) => {
    await page.goto('/offers')
    const bookmarkBtn = page.locator('.card-body .d-flex button.btn-outline-secondary i.bi-bookmark').first()
    await bookmarkBtn.click()
    await page.waitForTimeout(1500)

    await page.goto('/shortlist')
    await page.waitForTimeout(1000)

    page.on('dialog', dialog => dialog.accept())
    await page.locator('.card button.btn-outline-danger').first().click()
    await page.waitForTimeout(1000)
  })

  test('should navigate back to offers from shortlist', async ({ page }) => {
    await page.goto('/shortlist')

    await page.locator('.btn:has-text("Back to Offers")').click()

    await expect(page).toHaveURL(/\/offers/)
    await expect(page.locator('h2').filter({ hasText: 'My Offers' })).toBeVisible()
  })

})
