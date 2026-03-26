# Playwright Tests

E2E tests for capitalOffer frontend using Playwright.

## Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run all tests
npm run test:e2e

# Run a specific test file
npm run test:e2e -- offers.spec.ts

# Run with UI mode
npm run test:e2e:ui
```

## Test Coverage

### ✅ Authentication Tests
- Login page display
- Signup page display
- Valid login with credentials
- Invalid login validation
- Navigation from login to signup

### ✅ Offers Page Tests
- Offers page display
- Filter options visibility
- Offers grid display
- API integration
- Offer detail navigation
- Status filtering
- Search filtering
- Pagination controls

### ✅ Profile Page Tests
- Profile page display
- User information display
- Account status
- Navbar navigation

### ✅ Navigation Tests
- Navbar components
- Authentication state
- Route protection

## Running Tests

### CI/CD
```bash
# Run in headless mode
npm run test:e2e

# Generate HTML report
npm run test:e2e:report
```

### Debugging
```bash
# Run with debug mode
playwright test --debug

# Run specific test
playwright test --grep "login"
```

## Report View

```bash
# Open HTML report
playwright show-report
```

## Adding New Tests

1. Create new `.spec.ts` file in `tests/e2e/`
2. Use `test.describe()` for organizing test suites
3. Use `test()` for individual test cases
4. Always use `expect()` for assertions

Example:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/route');
    await expect(page.locator('.selector')).toBeVisible();
  });
});
```

## Test Files

- `auth.spec.ts` - Login/Signup tests
- `offers.spec.ts` - Offers page tests
- `profile.spec.ts` - Profile page tests
- `navigation.spec.ts` - Navigation tests
