# E2E Testing with Playwright

This directory contains end-to-end tests for the Angular Starter Template using Playwright.

## Setup

The E2E testing environment is already configured. To run tests:

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

## Test Structure

### Test Files

- `app.spec.ts` - Basic app functionality tests
- `auth.spec.ts` - Authentication flow tests
- `navigation.spec.ts` - Navigation and routing tests
- `performance.spec.ts` - Performance and accessibility tests
- `user-journey.spec.ts` - Complete user journey tests

### Helpers

- `helpers/test-helpers.ts` - Reusable test utilities
- `fixtures/test-data.ts` - Test data and selectors

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should do something", async ({ page }) => {
    // Test implementation
    await expect(page.locator("selector")).toBeVisible();
  });
});
```

### Using Helpers

```typescript
import { login, waitForAngular, mockApiResponse } from "./helpers/test-helpers";
import { testUsers, selectors } from "./fixtures/test-data";

test("authenticated user flow", async ({ page }) => {
  await login(page, testUsers.validUser.username, testUsers.validUser.password);
  await waitForAngular(page);
  // Continue with authenticated actions
});
```

### Mocking API Responses

```typescript
await mockApiResponse(page, "**/api/users", { users: [] });
```

## Configuration

The Playwright configuration is in `playwright.config.ts` at the project root. Key settings:

- **Base URL**: `http://localhost:4200`
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Web Server**: Automatically starts `npm run start` before tests
- **Retries**: 2 retries on CI, 0 locally
- **Reporter**: HTML report

## Best Practices

### 1. Use Page Object Model for Complex Pages

```typescript
class LoginPage {
  constructor(private page: Page) {}

  async login(username: string, password: string) {
    await this.page.fill(selectors.auth.usernameInput, username);
    await this.page.fill(selectors.auth.passwordInput, password);
    await this.page.click(selectors.auth.submitButton);
  }
}
```

### 2. Wait for Elements Properly

```typescript
// Good - wait for element to be visible
await expect(page.locator("button")).toBeVisible();

// Good - wait for network to be idle
await page.waitForLoadState("networkidle");

// Avoid - arbitrary timeouts
await page.waitForTimeout(1000); // Only when necessary
```

### 3. Use Descriptive Selectors

```typescript
// Good - semantic selectors
page.locator('button[type="submit"]');
page.locator('input[name="username"]');

// Avoid - fragile selectors
page.locator(".btn-primary"); // CSS classes can change
page.locator("div:nth-child(3)"); // Position-based selectors
```

### 4. Test User Journeys, Not Implementation

```typescript
// Good - test user behavior
test("user can complete checkout process", async ({ page }) => {
  await addItemToCart(page);
  await proceedToCheckout(page);
  await fillShippingInfo(page);
  await completePayment(page);
  await expect(page.locator(".order-confirmation")).toBeVisible();
});

// Avoid - testing implementation details
test("checkout button calls API", async ({ page }) => {
  // This tests implementation, not user value
});
```

### 5. Clean Up Between Tests

```typescript
test.beforeEach(async ({ page }) => {
  await clearStorage(page);
  await page.goto("/");
});
```

## Debugging

### Visual Debugging

```bash
# Run with headed browser
npm run test:e2e:headed

# Run with debug mode (step through)
npm run test:e2e:debug

# Run with UI mode (interactive)
npm run test:e2e:ui
```

### Screenshots and Videos

Playwright automatically captures screenshots on failure. For custom screenshots:

```typescript
await page.screenshot({ path: "debug-screenshot.png" });
```

### Console Logs

```typescript
page.on("console", (msg) => console.log(msg.text()));
```

## CI/CD Integration

E2E tests run automatically on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

The GitHub Actions workflow:

1. Sets up Node.js environment
2. Installs dependencies
3. Installs Playwright browsers
4. Builds the application
5. Runs E2E tests
6. Uploads test reports as artifacts

## Troubleshooting

### Common Issues

1. **Tests timeout**: Increase timeout in `playwright.config.ts`
2. **Element not found**: Check if element exists with `elementExists()` helper
3. **Flaky tests**: Add proper waits and use `waitForAngular()`
4. **CI failures**: Ensure all dependencies are installed in CI environment

### Performance Issues

- Use `page.waitForLoadState('networkidle')` instead of arbitrary timeouts
- Mock external API calls to avoid network dependencies
- Run tests in parallel (configured by default)

### Browser-Specific Issues

- Test across all configured browsers locally before pushing
- Use browser-specific configurations if needed
- Check browser console for JavaScript errors
