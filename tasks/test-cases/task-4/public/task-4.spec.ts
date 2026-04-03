import { test, expect } from '@playwright/test';

test.describe('Task 4 - Edit borrower profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'alice');
    await page.fill('#password', 'test@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should navigate to profile page', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('h2').filter({ hasText: 'My Profile' })).toBeVisible();
  });

  test('should display Edit Profile button', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.locator('button.btn-primary').filter({ hasText: 'Edit Profile' })).toBeVisible();
  });

  test('should click Edit Profile and show edit form', async ({ page }) => {
    await page.goto('/profile');

    await page.locator('button:has-text("Edit Profile")').first().click();
    await page.waitForTimeout(500);

    await expect(page.locator('input.form-control[type="text"]').first()).toBeVisible();
    await expect(page.locator('input.form-control[type="tel"]')).toBeVisible();
  });

  test('should update full name', async ({ page }) => {
    await page.goto('/profile');

    await page.locator('button:has-text("Edit Profile")').first().click();
    await page.waitForTimeout(500);

    const currentName = await page.locator('input.form-control[type="text"]').first().inputValue();

    await page.locator('input.form-control[type="text"]').first().fill(`Test User ${Date.now()}`);
    await page.waitForTimeout(300);

    await page.locator('button.btn-success').first().click();
    await page.waitForTimeout(500);

    await expect(page.locator('.col-md-6:has-text("Full Name:")')).toContainText(/Test User/);
  });

  test('should update phone number', async ({ page }) => {
    await page.goto('/profile');

    await page.locator('button:has-text("Edit Profile")').first().click();
    await page.waitForTimeout(500);

    await page.locator('input.form-control[type="tel"]').first().fill('123-456-7890');
    await page.waitForTimeout(300);

    await page.locator('button.btn-success').first().click();
    await page.waitForTimeout(500);

    await expect(page.locator('.col-md-6:has-text("Phone:")')).toContainText('123-456-7890');
  });

  test('should save profile and update navbar immediately', async ({ page }) => {
    await page.goto('/profile');

    const initialUserName = await page.locator('.nav-link:has-text("User")').first().innerText();

    await page.locator('button:has-text("Edit Profile")').first().click();
    await page.waitForTimeout(500);

    const newName = `Updated User ${Date.now()}`;
    await page.locator('input.form-control[type="text"]').first().fill(newName);
    await page.waitForTimeout(300);

    await page.locator('button.btn-success').first().click();
    await page.waitForTimeout(500);

    const navbarUserName = await page.locator('.nav-link:has-text("User")').first().innerText();
    expect(navbarUserName).not.toBe(initialUserName);
  });

  test('should display updated values after save', async ({ page }) => {
    await page.goto('/profile');

    await page.locator('button:has-text("Edit Profile")').first().click();
    await page.waitForTimeout(500);

    await page.locator('input.form-control[type="text"]').first().fill('Test Account Holder');
    await page.locator('input.form-control[type="tel"]').first().fill('555-TEST-123');
    await page.waitForTimeout(300);

    await page.locator('button.btn-success').first().click();
    await page.waitForTimeout(500);

    await expect(page.locator('.col-md-6:has-text("Full Name:")')).toHaveText(/Test Account Holder/);

  });

  test('should cancel edit and return to view mode', async ({ page }) => {
    await page.goto('/profile');

    await page.locator('button:has-text("Edit Profile")').first().click();
    await page.waitForTimeout(500);

    await page.locator('input.form-control[type="text"]').first().fill('Test User');

    await page.locator('button.btn-outline-secondary').first().click();
    await page.waitForTimeout(500);

    const inputsVisible = await page.locator('input.form-control').count();
    expect(inputsVisible).toBe(0);
  });

  test('should persist changes after page refresh', async ({ page }) => {
    await page.goto('/profile');

    await page.locator('button:has-text("Edit Profile")').first().click();
    await page.waitForTimeout(500);

    const newName = `Persisted User ${Date.now()}`;
    await page.locator('input.form-control[type="text"]').first().fill(newName);
    await page.waitForTimeout(300);

    await page.locator('button.btn-success').first().click();
    await page.waitForTimeout(500);

    await page.reload();
    await page.waitForTimeout(500);

    await expect(page.locator('.col-md-6:has-text("Full Name:")')).toContainText('Persisted User');
  });

  test('should handle empty full name (keep existing)', async ({ page }) => {
    await page.goto('/profile');

    await page.locator('button:has-text("Edit Profile")').first().click();
    await page.waitForTimeout(500);

    await page.locator('input.form-control[type="text"]').first().fill('');
    await page.waitForTimeout(300);

    await page.locator('button.btn-success').first().click();
    await page.waitForTimeout(500);

    await expect(page.locator('h2').filter({ hasText: 'My Profile' })).toBeVisible();
  });
});
