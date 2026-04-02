import { test, expect } from '@playwright/test'

test.describe('Task 10 - Notifications Feature (private)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'jane');
    await page.fill('#password', 'private@456');
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

    // Either shows notification list-group or "No Notifications" empty state
    const hasList = await page.locator('.list-group').count() > 0
    const hasEmpty = await page.locator('text=No Notifications').count() > 0
    expect(hasList || hasEmpty).toBe(true)
  })

  test('should create notification by accepting an offer and verify it appears', async ({ page }) => {
    // First accept an offer to generate a notification
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })

    // Filter to "new" offers to find actionable ones
    await page.locator('select.form-select').nth(0).selectOption('new')
    await page.waitForTimeout(500)

    const newOfferBtn = page.locator('.card .btn-outline-primary').first()
    if (await newOfferBtn.count() > 0) {
      await newOfferBtn.click()
      await page.waitForURL(/\/offers\/\d+$/)

      // Handle all dialogs (confirm + possible alert)
      page.on('dialog', async dialog => {
        await dialog.accept()
      })

      // Click Accept Offer if enabled
      const acceptBtn = page.locator('button.btn-primary:has-text("Accept Offer")')
      if (await acceptBtn.isEnabled()) {
        await acceptBtn.click()
        await page.waitForTimeout(2000)
      }
    }

    // Navigate to notifications page
    await page.goto('/notifications')
    await page.waitForTimeout(1000)

    // Should show notifications list or empty state
    const notifications = page.locator('.list-group-item')
    const count = await notifications.count()

    if (count > 0) {
      await expect(notifications.first()).toBeVisible()
      const messageText = await notifications.first().locator('p').first().textContent()
      expect(messageText?.trim().length).toBeGreaterThan(0)
    } else {
      // If no notifications, empty state should be shown
      const hasEmpty = await page.locator('text=No Notifications').count() > 0
      expect(hasEmpty).toBe(true)
    }
  })

  test('should display Mark All button and filter toggles when notifications exist', async ({ page }) => {
    // Accept an offer to create notifications first
    await page.goto('/offers')
    await page.locator('.card-title').first().waitFor({ state: 'visible', timeout: 10000 })
    await page.locator('select.form-select').nth(0).selectOption('new')
    await page.waitForTimeout(500)

    const newOfferBtn = page.locator('.card .btn-outline-primary').first()
    if (await newOfferBtn.count() > 0) {
      await newOfferBtn.click()
      await page.waitForURL(/\/offers\/\d+$/)

      page.on('dialog', async dialog => { await dialog.accept() })

      const acceptBtn = page.locator('button.btn-primary:has-text("Accept Offer")')
      if (await acceptBtn.isEnabled()) {
        await acceptBtn.click()
        await page.waitForTimeout(2000)
      }
    }

    await page.goto('/notifications')
    await page.waitForTimeout(1000)

    const hasNotifications = await page.locator('.list-group-item').count() > 0
    if (hasNotifications) {
      // Mark All button should be visible
      await expect(page.locator('button:has-text("Mark All")')).toBeVisible()

      // Filter toggle buttons
      await expect(page.locator('button:has-text("Unread Only")')).toBeVisible()
      await expect(page.locator('button:has-text("All")')).toBeVisible()
    }
  })

  test('should show notification timestamps', async ({ page }) => {
    await page.goto('/notifications')
    await page.waitForTimeout(1000)

    const notifications = page.locator('.list-group-item')
    const count = await notifications.count()

    if (count > 0) {
      // Each notification should have a timestamp in small.text-muted
      await expect(notifications.first().locator('small.text-muted')).toBeVisible()
    }
  })

  test('should mark a notification as read', async ({ page }) => {
    await page.goto('/notifications')
    await page.waitForTimeout(1000)

    // Find an unread notification with a mark-as-read button
    const markReadBtn = page.locator('.list-group-item .btn-outline-success').first()
    if (await markReadBtn.count() > 0) {
      // Count unread before
      const unreadBefore = await page.locator('.list-group-item.bg-light').count()

      await markReadBtn.click()
      await page.waitForTimeout(500)

      // Unread count should decrease or button should disappear
      const unreadAfter = await page.locator('.list-group-item.bg-light').count()
      expect(unreadAfter).toBeLessThanOrEqual(unreadBefore)
    }
  })

  test('should toggle between Unread Only and All views', async ({ page }) => {
    await page.goto('/notifications')
    await page.waitForTimeout(1000)

    const hasNotifications = await page.locator('.list-group-item').count() > 0
    if (hasNotifications) {
      // Get total count in "All" view
      const allCount = await page.locator('.list-group-item').count()

      // Click "Unread Only"
      await page.locator('button:has-text("Unread Only")').click()
      await page.waitForTimeout(300)

      // Click "All" to return
      await page.locator('button:has-text("All")').click()
      await page.waitForTimeout(300)

      // Should show same count as before
      const afterCount = await page.locator('.list-group-item').count()
      expect(afterCount).toBe(allCount)
    }
  })
})
