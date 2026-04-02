import { test, expect } from '@playwright/test'

test.describe('Task 10 - Notifications Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'alice');
    await page.fill('#password', 'test@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should navigate to notifications page and see Notifications heading', async ({ page }) => {
    await page.goto('/notifications')
    await expect(page.locator('h2').filter({ hasText: 'Notifications' })).toBeVisible()
  })

  test('should display notification list or empty state message', async ({ page }) => {
    await page.goto('/notifications')
    await page.waitForTimeout(1000)

    const hasList = await page.locator('.list-group').count() > 0
    const hasEmpty = await page.locator('text=No Notifications').count() > 0
    expect(hasList || hasEmpty).toBe(true)
  })

  test('should display notification items with messages and timestamps', async ({ page }) => {
    await page.goto('/notifications')
    await page.waitForTimeout(1000)

    const notifications = page.locator('.list-group-item')
    const count = await notifications.count()

    if (count > 0) {
      const messageText = await notifications.first().locator('p').first().textContent()
      expect(messageText?.trim().length).toBeGreaterThan(0)

      await expect(notifications.first().locator('small.text-muted')).toBeVisible()
    }
  })

  test('should display Mark All button and filter toggles', async ({ page }) => {
    await page.goto('/notifications')
    await page.waitForTimeout(1000)

    const hasNotifications = await page.locator('.list-group-item').count() > 0
    if (hasNotifications) {
      await expect(page.locator('button:has-text("Mark All")')).toBeVisible()

      await expect(page.locator('button:has-text("Unread Only")')).toBeVisible()
      await expect(page.locator('button:has-text("All")')).toBeVisible()
    }
  })

  test('should toggle between Unread Only and All views', async ({ page }) => {
    await page.goto('/notifications')
    await page.waitForTimeout(1000)

    const hasNotifications = await page.locator('.list-group-item').count() > 0
    if (hasNotifications) {
      const allCount = await page.locator('.list-group-item').count()

      await page.locator('button:has-text("Unread Only")').click()
      await page.waitForTimeout(300)

      await page.locator('button:has-text("All")').click()
      await page.waitForTimeout(300)

      const afterCount = await page.locator('.list-group-item').count()
      expect(afterCount).toBe(allCount)
    }
  })
})
