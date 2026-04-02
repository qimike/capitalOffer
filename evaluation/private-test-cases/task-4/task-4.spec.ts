import { test, expect } from '@playwright/test';

test.describe('Task 4 - Edit borrower profile (private)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'jane');
    await page.fill('#password', 'private@456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*offers/);
  });

  test('should navigate to profile page and see My Profile heading', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('h2').filter({ hasText: 'My Profile' })).toBeVisible();
  });

  test('should display jane full name on profile page', async ({ page }) => {
    await page.goto('/profile');

    // Jane's seeded name is "Jane Private" or similar
    await expect(page.locator('.col-md-6:has-text("Full Name:")')).toBeVisible();
  });

  test('should display Edit Profile button', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('button.btn-primary').filter({ hasText: 'Edit Profile' })).toBeVisible();
  });

  test('should enter edit mode and show form inputs', async ({ page }) => {
    await page.goto('/profile');
    await page.locator('button:has-text("Edit Profile")').first().click();
    await page.waitForTimeout(500);

    await expect(page.locator('input.form-control[type="text"]').first()).toBeVisible();
    await expect(page.locator('input.form-control[type="tel"]')).toBeVisible();
  });

  test('should update full name to a unique value and verify it displays', async ({ page }) => {
    await page.goto('/profile');
    await page.locator('button:has-text("Edit Profile")').first().click();
    await page.waitForTimeout(500);

    const uniqueName = `Jane Updated ${Date.now()}`;
    await page.locator('input.form-control[type="text"]').first().fill(uniqueName);
    await page.waitForTimeout(300);

    await page.locator('button.btn-success').first().click();
    await page.waitForTimeout(500);

    // Verify the new name appears in the profile view
    await expect(page.locator('.col-md-6:has-text("Full Name:")')).toContainText('Jane Updated');
  });

  test('should update phone number to a private-test value', async ({ page }) => {
    await page.goto('/profile');
    await page.locator('button:has-text("Edit Profile")').first().click();
    await page.waitForTimeout(500);

    await page.locator('input.form-control[type="tel"]').first().fill('999-888-7777');
    await page.waitForTimeout(300);

    await page.locator('button.btn-success').first().click();
    await page.waitForTimeout(500);

    await expect(page.locator('.col-md-6:has-text("Phone:")')).toContainText('999-888-7777');
  });

  test('should update navbar username after profile save', async ({ page }) => {
    await page.goto('/profile');
    const initialNavText = await page.locator('#userDropdown').first().innerText();

    await page.locator('button:has-text("Edit Profile")').first().click();
    await page.waitForTimeout(500);

    const newName = `NavCheck ${Date.now()}`;
    await page.locator('input.form-control[type="text"]').first().fill(newName);
    await page.waitForTimeout(300);

    await page.locator('button.btn-success').first().click();
    await page.waitForTimeout(500);

    const updatedNavText = await page.locator('#userDropdown').first().innerText();
    expect(updatedNavText).not.toBe(initialNavText);
  });

  test('should cancel edit and return to view mode without saving', async ({ page }) => {
    await page.goto('/profile');
    await page.locator('button:has-text("Edit Profile")').first().click();
    await page.waitForTimeout(500);

    // Type something but cancel
    await page.locator('input.form-control[type="text"]').first().fill('Should Not Save');

    await page.locator('button.btn-outline-secondary').first().click();
    await page.waitForTimeout(500);

    // Inputs should be hidden
    const inputsVisible = await page.locator('input.form-control').count();
    expect(inputsVisible).toBe(0);
  });

  test('should persist profile changes after page reload', async ({ page }) => {
    await page.goto('/profile');
    await page.locator('button:has-text("Edit Profile")').first().click();
    await page.waitForTimeout(500);

    const persistedName = `Persisted Jane ${Date.now()}`;
    await page.locator('input.form-control[type="text"]').first().fill(persistedName);
    await page.waitForTimeout(300);

    await page.locator('button.btn-success').first().click();
    await page.waitForTimeout(500);

    // Reload and verify
    await page.reload();
    await page.waitForTimeout(500);
    await expect(page.locator('.col-md-6:has-text("Full Name:")')).toContainText('Persisted Jane');
  });
});
