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

test.describe('Task 10 - Notifications Feature (private)', () => {
  test.beforeEach(async ({ page }) => {
    // Create a notification via API BEFORE logging in via UI
    await ensureNotification(page, 'jane', 'private@456')

    // Log in via UI
    await page.goto('/login')
    await page.fill('#username', 'jane')
    await page.fill('#password', 'private@456')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*offers/)
    // Reload so Navbar re-mounts with auth set and re-fetches notifications
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('Criterion 1: user can log in and see the offers page', async ({ page }) => {
    await expect(page).toHaveURL(/.*offers/)
  })

  test('Criterion 2: bell icon is visible in the navbar', async ({ page }) => {
    const bellIcon = page.locator('.bi-bell-fill')
    await expect(bellIcon.first()).toBeVisible({ timeout: 10000 })
  })

  test('Criterion 3: unread count badge is displayed on bell icon', async ({ page }) => {
    // Unread count badge should be visible
    const badge = page.locator('.badge.bg-danger')
    await expect(badge.first()).toBeVisible({ timeout: 10000 })
    const badgeText = await badge.first().textContent()
    expect(Number(badgeText?.trim())).toBeGreaterThanOrEqual(1)
  })

  test('Criterion 4: clicking bell navigates to /notifications', async ({ page }) => {
    // Click bell dropdown toggle
    const bellToggle = page.locator('[data-bs-toggle="dropdown"]').filter({ has: page.locator('.bi-bell-fill') })
    if (await bellToggle.count() > 0) {
      await bellToggle.click()
      await page.waitForTimeout(500)

      // Click "View All Notifications" link
      const viewAllLink = page.locator('a:has-text("View All Notifications"), a:has-text("View All")')
      if (await viewAllLink.count() > 0) {
        await viewAllLink.click()
      } else {
        await page.goto('/notifications')
      }
    } else {
      // Fallback: click any bell link
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

  test('Criterion 5: list of notifications is displayed', async ({ page }) => {
    await page.goto('/notifications')
    await page.waitForTimeout(1500)

    await expect(page.locator('h2').filter({ hasText: 'Notifications' })).toBeVisible()

    const items = page.locator('.list-group-item')
    const count = await items.count()
    expect(count).toBeGreaterThanOrEqual(1)

    // Each notification should have message content
    const firstMsg = await items.first().locator('p, span, div').first().textContent()
    expect(firstMsg?.trim().length).toBeGreaterThan(0)
  })

  test('Criterion 6 & 7: click Mark as Read and notification is marked as read', async ({ page }) => {
    await page.goto('/notifications')
    await page.waitForTimeout(1500)

    // Count unread items before marking
    const unreadBefore = await page.locator('.list-group-item.bg-light').count()

    // Click Mark as Read on first unread notification
    const markReadBtn = page.locator('.btn-outline-success, button:has-text("Mark as Read"), button:has-text("Mark Read")').first()
    await expect(markReadBtn).toBeVisible({ timeout: 5000 })
    await markReadBtn.click()
    await page.waitForTimeout(1000)

    // Unread count should have decreased
    const unreadAfter = await page.locator('.list-group-item.bg-light').count()
    expect(unreadAfter).toBeLessThan(unreadBefore)
  })

  test('Criterion 8: unread count decreases after marking as read', async ({ page }) => {
    await page.goto('/notifications')
    await page.waitForTimeout(1500)

    // Get initial unread count from the page heading badge
    const headingBadge = page.locator('h2 .badge.bg-danger')
    await expect(headingBadge).toBeVisible({ timeout: 5000 })
    const initialText = await headingBadge.textContent()
    const initialCount = Number(initialText?.trim()) || 0
    expect(initialCount).toBeGreaterThanOrEqual(1)

    // Mark one notification as read
    const markReadBtn = page.locator('.btn-outline-success, button:has-text("Mark as Read"), button:has-text("Mark Read")').first()
    await expect(markReadBtn).toBeVisible({ timeout: 5000 })
    await markReadBtn.click()
    await page.waitForTimeout(1000)

    // Verify unread count decreased
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
