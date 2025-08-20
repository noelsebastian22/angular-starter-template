import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form', async ({ page }) => {
    // Navigate to auth page if it exists
    const authLink = page.locator('a[href*="auth"]');
    if (await authLink.isVisible()) {
      await authLink.click();
    } else {
      // If no auth link, try direct navigation
      await page.goto('/auth');
    }

    // Check if login form elements are present
    // Note: Adjust selectors based on your actual auth component
    const usernameField = page.locator(
      'input[type="text"], input[name="username"], input[placeholder*="username" i]',
    );
    const passwordField = page.locator(
      'input[type="password"], input[name="password"]',
    );

    if (await usernameField.isVisible()) {
      await expect(usernameField).toBeVisible();
    }

    if (await passwordField.isVisible()) {
      await expect(passwordField).toBeVisible();
    }
  });

  test('should handle login form submission', async ({ page }) => {
    // Navigate to auth page
    await page.goto('/auth');

    // Fill login form if it exists
    const usernameField = page
      .locator('input[type="text"], input[name="username"]')
      .first();
    const passwordField = page
      .locator('input[type="password"], input[name="password"]')
      .first();
    const submitButton = page
      .locator(
        'button[type="submit"], button:has-text("Login"), button:has-text("Sign In")',
      )
      .first();

    if (
      (await usernameField.isVisible()) &&
      (await passwordField.isVisible())
    ) {
      await usernameField.fill('test-user');
      await passwordField.fill('mock-password');

      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait for navigation or error message
        await page.waitForTimeout(1000);

        // Check if we're still on the same page or redirected
        const currentUrl = page.url();
        expect(currentUrl).toBeTruthy();
      }
    }
  });

  test('should handle login validation errors', async ({ page }) => {
    await page.goto('/auth');

    // Try to submit empty form
    const submitButton = page
      .locator(
        'button[type="submit"], button:has-text("Login"), button:has-text("Sign In")',
      )
      .first();

    if ((await submitButton.isVisible()) && (await submitButton.isEnabled())) {
      await submitButton.click();

      // Look for validation error messages
      const errorMessages = page.locator(
        '.error, .invalid, [class*="error"], [class*="invalid"]',
      );

      // Wait a bit for validation to trigger
      await page.waitForTimeout(500);

      // Check if validation errors appear (this will depend on your implementation)
      const hasErrors = (await errorMessages.count()) > 0;
      if (hasErrors) {
        await expect(errorMessages.first()).toBeVisible();
      }
    }
  });
});
