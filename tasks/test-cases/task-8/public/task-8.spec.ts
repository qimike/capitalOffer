import { test, expect } from '@playwright/test'

test.describe('Task 8 - Accept and Decline Offers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'alice');
    await page.fill('#password', 'test@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should show disabled buttons on an accepted offer', async ({ page }) => {
    await page.goto('/offers')

    await page.locator('select.form-select').nth(0).selectOption('accepted')
    await page.waitForTimeout(1000)

    const viewBtn = page.locator('.card .btn-outline-primary').first()
    if (await viewBtn.count() > 0) {
      await viewBtn.click()
      await page.waitForURL(/\/offers\/\d+$/)

      await expect(page.locator('span.badge:has-text("ACCEPTED")')).toBeVisible({ timeout: 10000 })

      const acceptBtn = page.locator('button.btn-primary:has-text("Accept Offer")')
      const declineBtn = page.locator('button.btn-outline-danger:has-text("Decline Offer")')
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
    expect(['NEW', 'ACCEPTED', 'EXPIRED', 'PENDING', 'DECLINED'].some(s => text?.includes(s))).toBe(true)
  })
})
