import { test, expect } from '@playwright/test'

test.describe('Task 8 - Accept and Decline Offers (private)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'jane');
    await page.fill('#password', 'private@456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should navigate to offer detail page from offers list', async ({ page }) => {
    await page.goto('/offers')

    await page.locator('.card .btn-outline-primary').first().click()

    await expect(page).toHaveURL(/\/offers\/\d+$/)

    const acceptBtn = page.locator('button:has-text("Accept Offer")')
    const declineBtn = page.locator('button:has-text("Decline Offer")')
    await expect(acceptBtn).toBeVisible()
    await expect(declineBtn).toBeVisible()
  })

  test('should accept an offer and update status to accepted', async ({ page }) => {
    await page.goto('/offers')

    await page.locator('select.form-select').nth(0).selectOption('new')
    await page.waitForTimeout(1000)

    await page.locator('.card .btn-outline-primary').first().click()
    await page.waitForURL(/\/offers\/\d+$/)

    const offerUrl = page.url()

    page.on('dialog', dialog => dialog.accept())
    await page.locator('button:has-text("Accept Offer")').click()

    await page.waitForTimeout(2000)

    await page.goto(offerUrl)
    await page.waitForTimeout(1000)

    const badge = page.locator('span.badge')
    await expect(badge).toBeVisible({ timeout: 10000 })
    const badgeText = await badge.textContent()
    expect(badgeText?.toUpperCase()).toContain('ACCEPTED')
  })

  test('should mark other offers as expired after accepting one', async ({ page }) => {
    await page.goto('/offers')

    await page.locator('select.form-select').nth(0).selectOption('expired')
    await page.waitForTimeout(1000)

    const expiredCards = page.locator('.card')
    const count = await expiredCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should decline an offer with a reason and update status to declined', async ({ page }) => {
    await page.goto('/offers')

    await page.locator('select.form-select').nth(0).selectOption('new')
    await page.waitForTimeout(1000)

    const viewBtn = page.locator('.card .btn-outline-primary').first()
    await expect(viewBtn).toBeVisible({ timeout: 5000 })
    await viewBtn.click()
    await page.waitForURL(/\/offers\/\d+$/)

    const offerUrl = page.url()

    page.on('dialog', async dialog => {
      await dialog.accept()
    })
    await page.locator('button:has-text("Decline Offer")').click()

    await page.waitForTimeout(2000)

    await page.goto(offerUrl)
    await page.waitForTimeout(1000)

    const badge = page.locator('span.badge')
    await expect(badge).toBeVisible({ timeout: 10000 })
    const badgeText = await badge.textContent()
    expect(badgeText?.toUpperCase()).toContain('DECLINED')
  })

  test('should show disabled buttons on an accepted offer', async ({ page }) => {
    await page.goto('/offers')

    await page.locator('select.form-select').nth(0).selectOption('accepted')
    await page.waitForTimeout(1000)

    const viewBtn = page.locator('.card .btn-outline-primary').first()
    if (await viewBtn.count() > 0) {
      await viewBtn.click()
      await page.waitForURL(/\/offers\/\d+$/)

      const badge = page.locator('span.badge')
      await expect(badge).toBeVisible({ timeout: 10000 })
      const badgeText = await badge.textContent()
      expect(badgeText?.toUpperCase()).toContain('ACCEPTED')

      const acceptBtn = page.locator('button:has-text("Accept Offer")')
      const declineBtn = page.locator('button:has-text("Decline Offer")')
      await expect(acceptBtn).toBeDisabled()
      await expect(declineBtn).toBeDisabled()
    }
  })

  test('should display correct status badge on detail page', async ({ page }) => {
    await page.goto('/offers')
    await page.locator('.card .btn-outline-primary').first().click()
    await page.waitForURL(/\/offers\/\d+$/)
    await page.waitForTimeout(500)

    const badge = page.locator('span.badge')
    await expect(badge).toBeVisible()
    const text = await badge.textContent()
    expect(['NEW', 'ACCEPTED', 'EXPIRED', 'PENDING', 'DECLINED'].some(s => text?.toUpperCase().includes(s))).toBe(true)
  })
})
