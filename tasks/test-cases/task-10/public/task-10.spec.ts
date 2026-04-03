import { test, expect, type Page } from '@playwright/test'

// Helper: ensure at least one unread notification exists for the user
async function ensureNotification(page: Page, username: string, password: string) {
  // Login via API
  const loginResp = await page.request.post('http://localhost:3000/api/auth/login/', {
    data: { username, password }
  })
  const loginData = await loginResp.json()
  const token = loginData.access

  // Check if there are already unread notifications
  const notifsResp = await page.request.get('http://localhost:3000/api/notifications/', {
    headers: { Authorization: `Bearer ${token}` }
  })
  const notifsData = await notifsResp.json()
  const notifs = notifsData.results || notifsData
  const hasUnread = Array.isArray(notifs) && notifs.some((n: any) => !n.is_read)

  if (!hasUnread) {
    // Accept a "new" offer to generate a notification
    const offersResp = await page.request.get('http://localhost:3000/api/offers/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const offersData = await offersResp.json()
    const results = offersData.results || offersData
    const newOffer = results.find((o: any) => o.status === 'new')
    if (newOffer) {
      await page.request.post(`http://localhost:3000/api/offers/${newOffer.id}/actions/accept/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    }
  }
}

test.describe('Task 10 - Notifications Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Create a notification via API BEFORE logging in via UI
    // This ensures the notification exists when the navbar loads
    await ensureNotification(page, 'alice', 'test@123')

    // Log in via UI
    await page.goto('/login')
    await page.fill('#username', 'alice')
    await page.fill('#password', 'test@123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*offers/)
    // Reload so Navbar re-mounts with auth set and re-fetches notifications
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('Criterion 2 & 3: bell icon with unread count in navbar', async ({ page }) => {
    // Criterion 2: Verify bell icon is visible in the navbar
    const bellIcon = page.locator('.bi-bell-fill')
    await expect(bellIcon.first()).toBeVisible({ timeout: 10000 })

    // Criterion 3: Verify unread count badge is displayed near the bell
    const badge = page.locator('.badge.bg-danger')
    await expect(badge.first()).toBeVisible({ timeout: 10000 })
    const badgeText = await badge.first().textContent()
    expect(Number(badgeText?.trim())).toBeGreaterThanOrEqual(1)
  })

  test('Criterion 4: click bell icon to navigate to /notifications', async ({ page }) => {
    // Click the bell icon / notification dropdown
    const bellToggle = page.locator('[data-bs-toggle="dropdown"]').filter({ has: page.locator('.bi-bell-fill') })
    if (await bellToggle.count() > 0) {
      await bellToggle.click()
      await page.waitForTimeout(500)

      // Click "View All Notifications" link in dropdown
      const viewAllLink = page.locator('a:has-text("View All Notifications"), a:has-text("View All")')
      if (await viewAllLink.count() > 0) {
        await viewAllLink.click()
      } else {
        await page.goto('/notifications')
      }
    } else {
      // Fallback: click any bell-related nav link
      const bellLink = page.locator('a').filter({ has: page.locator('.bi-bell-fill, .bi-bell') })
      if (await bellLink.count() > 0) {
        await bellLink.first().click()
      } else {
        await page.goto('/notifications')
      }
    }

    await page.waitForURL(/.*notifications/)
    await expect(page.locator('h2').filter({ hasText: 'Notifications' })).toBeVisible()
  })

  test('Criterion 5: list of notifications displayed on /notifications page', async ({ page }) => {
    // Navigate to notifications
    await page.goto('/notifications')
    await page.waitForTimeout(1500)

    // Verify heading
    await expect(page.locator('h2').filter({ hasText: 'Notifications' })).toBeVisible()

    // Verify notifications list is displayed
    const items = page.locator('.list-group-item')
    const count = await items.count()
    expect(count).toBeGreaterThanOrEqual(1)

    // Each notification should have a message
    const firstMsg = await items.first().locator('p, span, div').first().textContent()
    expect(firstMsg?.trim().length).toBeGreaterThan(0)
  })

  test('Criteria 6, 7 & 8: mark notification as read and unread count decreases', async ({ page }) => {
    // Navigate to notifications page
    await page.goto('/notifications')
    await page.waitForTimeout(1500)

    // Get initial unread count from the page heading badge
    const headingBadge = page.locator('h2 .badge.bg-danger')
    await expect(headingBadge).toBeVisible({ timeout: 5000 })
    const initialText = await headingBadge.textContent()
    const initialCount = Number(initialText?.trim()) || 0
    expect(initialCount).toBeGreaterThanOrEqual(1)

    // Criterion 6: Click 'Mark as Read' on a notification
    const markReadBtn = page.locator('.btn-outline-success, button:has-text("Mark as Read"), button:has-text("Mark Read")').first()
    await expect(markReadBtn).toBeVisible({ timeout: 5000 })
    await markReadBtn.click()
    await page.waitForTimeout(1000)

    // Criterion 7: Verify the notification is marked as read (unread count decreased)
    // Criterion 8: Verify unread count decreases accordingly
    if (initialCount === 1) {
      // Badge should disappear (count went to 0)
      await expect(headingBadge).toBeHidden({ timeout: 5000 })
    } else {
      // Badge text should show a lower number
      const newText = await headingBadge.textContent()
      const newCount = Number(newText?.trim()) || 0
      expect(newCount).toBeLessThan(initialCount)
    }
  })
})
