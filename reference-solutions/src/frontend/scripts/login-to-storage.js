/**
 * Login as alice using Playwright and save auth state to storage/auth.json
 * 
 * Usage: node scripts/login-to-storage.js
 * 
 * Requirements:
 * 1. Django backend should be running on http://localhost:3000
 * 2. Frontend deve server should be running on http://localhost:5173
 * 3. Alice user should exist in the database (created via seed_public.py)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function loginAndSaveStorage() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Opening login page...');
  
  const LOGIN_URL = 'http://localhost:3000';
  const FRONTEND_URL = 'http://localhost:5173';
  
  try {
    // Go to the Django server to login via API or frontend
    await page.goto(FRONTEND_URL + '/login');
    console.log('Navigated to login page');

    // Fill the login form
    await page.fill('input[name="username"]', 'alice');
    console.log('Filled username');

    await page.fill('input[name="password"]', 'test@123');
    console.log('Filled password');

    // Click login button
    await page.click('button[type="submit"]');
    console.log('Clicked login button');

    // Wait for login to complete
    await page.waitForSelector('h1', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get the auth token from localStorage (if it worked)
    const storageState = await context.storageState();
    
    // Save to file
    const storagePath = path.join(__dirname, '../../src/frontend/storage/auth.json');
    if (fs.existsSync(path.dirname(storagePath))) {
      fs.writeFileSync(storagePath, JSON.stringify(storageState, null, 2));
      console.log('✓ Auth state saved to:', storagePath);
      console.log('✓ Tokens:', {
        hasAuth: !!storageState.origins?.[0]?.localStorage?.find(l => l.name === 'authToken'),
        hasRefresh: !!storageState.origins?.[0]?.localStorage?.find(l => l.name === 'refreshToken')
      });
    }

  } catch (error) {
    console.error('Login process encountered an error:', error.message);
    
    // Try to save whatever state we got
    const storageState = await context.storageState();
    const storagePath = path.join(__dirname, '../../src/frontend/storage/auth.json');
    if (storageState) {
      fs.writeFileSync(storagePath, JSON.stringify(storageState, null, 2));
      console.log('✗ Partial auth state saved to:', storagePath);
    }
  } finally {
    await browser.close();
  }
}

loginAndSaveStorage();
