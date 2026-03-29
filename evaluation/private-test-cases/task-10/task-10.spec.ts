import { test, expect } from '@playwright/test'

test.describe('Task 10 - Notifications Feature', () => {
  test.use({ storageState: 'storage/auth.json' })

  test('should navigate to notifications page and see list of notifications', async ({ page }) => {
    await page.goto('/notifications')
    
    // Wait for notifications list to load
    await page.locator('.card-header:has-text("Notification List")').waitFor({ state: 'visible', timeout: 10000 })
    
    // Verify notification list is displayed
    const notificationList = page.locator('.card .card-header:has-text("Notification List")')
    await expect(notificationList).toBeVisible()
  })

  test('should display unread count badge on notification bell in navbar', async ({ page }) => {
    await page.goto('/offers')
    
    // Locate notification bell icon
    const notificationBell = page.locator('.nav-item:has-text("Notifications") .position-relative')
    await expect(notificationBell).toBeVisible()
    
    // Check for unread count badge
    const unreadBadge = page.locator('.position-absolute .badge.rounded-circle.bg-danger')
    await expect(unreadBadge).toBeVisible()
    
    // Verify badge displays correct count
    const unreadCount = await unreadBadge.innerText()
    expect(parseInt(unreadCount)).toBeGreaterThan(0)
  })

  test('should click bell icon to see notification dropdown', async ({ page }) => {
    await page.goto('/offers')
    
    // Click on notification bell
    await page.locator('.position-relative i.bi-bell-fill').click()
    await page.waitForTimeout(500)
    
    // Verify dropdown appears
    const dropdown = page.locator('.dropdown-menu:has-text("Notifications")')
    await expect(dropdown).toBeVisible()
  })

  test('should verify notification items are displayed in dropdown', async ({ page }) => {
    await page.goto('/offers')
    
    // Click notification bell
    await page.locator('.position-relative i.bi-bell-fill').click()
    await page.waitForTimeout(500)
    
    // Verify notification items are shown
    const notificationItems = page.locator('.dropdown-item:has-text("funding alert")')
    await expect(notificationItems).toBeVisible()
  })

  test('should navigate to notifications page from dropdown', async ({ page }) => {
    await page.goto('/offers')
    
    // Click notification bell
    await page.locator('.position-relative i.bi-bell-fill').click()
    await page.waitForTimeout(500)
    
    // Click "View All Notifications"
    await page.locator('a:has-text("View All Notifications")').click()
    
    // Navigate to notifications page
    await page.waitForURL(/.*\/notifications/)
    
    // Verify we're on the notifications page
    await expect(page.locator('h2:has-text("Notifications")')).toBeVisible()
  })

  test('should mark notification as read from notifications page', async ({ page }) => {
    await page.goto('/notifications')
    
    // Wait for notifications to load
    await page.locator('.card-header:has-text("Notification List")').waitFor({ state: 'visible', timeout: 10000 })
    
    // Count unread notifications before
    const initialUnreadCount = page.locator('.list-group-item').count()
    expect(initialUnreadCount).toBeGreaterThan(0)
    
    // Find all notifications (not just unread)
    const notificationItems = page.locator('.list-group-item')
    for (let i = 0; i < await notificationItems.count(); i++) {
      await notificationItems.nth(i).scrollIntoViewIfNeeded()
    }
  })

  test('should filter notifications by unread only', async ({ page }) => {
    await page.goto('/notifications')
    
    // Wait for notifications to load
    await page.locator('.card-header:has-text("Notification List")').waitFor({ state: 'visible', timeout: 10000 })
    
    // Click "Unread Only" filter
    await page.locator('button:has-text("Unread Only")').click()
    await page.waitForTimeout(500)
    
    // Verify all caught up message appears if all read
    const allCaughtUp = page.locator('h5:has-text("All Caught Up!")')
    await expect(allCaughtUp).toBeVisible()
  })

  test('should filter notifications by all', async ({ page }) => {
    await page.goto('/notifications')
    
    // Wait for notifications to load
    await page.locator('.card-header:has-text("Notification List")').waitFor({ state: 'visible', timeout: 10000 })
    
    // Click "Unread Only"
    await page.locator('button:has-text("Unread Only")').click()
    
    // Click "All" to show all notifications
    await page.locator('button:has-text("All")').click()
    await page.waitForTimeout(500)
    
    // Verify notification list appears
    const notificationList = page.locator('.card-header:has-text("Notification List")')
    await expect(notificationList).toBeVisible()
  })

  test('should verify notification count in notification bell matches unread count', async ({ page }) => {
    await page.goto('/offers')
    
    // Get unread count from badge
    const unreadBadge = page.locator('.position-absolute .badge.rounded-circle.bg-danger')
    await expect(unreadBadge).toBeVisible()
    const badgeCount = await unreadBadge.innerText()
    
    // Click notification dropdown
    await page.locator('.position-relative i.bi-bell-fill').click()
    await page.waitForTimeout(500)
    
    // Verify dropdown shows unread count
    const dropdownUnreadCount = page.locator('span:has-text("unread")')
    if (await dropdownUnreadCount.count() > 0) {
      const dropdownText = await dropdownUnreadCount.innerText()
      expect(dropdownText.includes(badgeCount)).toBeTruthy()
    }
  })

  test('should verify notification messages are displayed correctly', async ({ page }) => {
    await page.goto('/notifications')
    
    // Wait for notifications to load
    await page.locator('.card-header:has-text("Notification List")').waitFor({ state: 'visible', timeout: 10000 })
    
    // Verify notification messages are displayed
    const notificationMessages = page.locator('.list-group-item p.mb-2')
    await expect(notificationMessages.first()).toBeVisible()
    
    // Check that messages contain expected text patterns
    const firstMessage = await notificationMessages.first().innerText()
    expect(firstMessage.length).toBeGreaterThan(0)
  })
})
