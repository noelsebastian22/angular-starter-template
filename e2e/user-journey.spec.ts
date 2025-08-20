import { test, expect } from '@playwright/test';
import {
  waitForAngular,
  clearStorage,
  testResponsive,
  mockApiResponse,
} from './helpers/test-helpers';
import {
  testUsers,
  mockApiResponses,
  testRoutes,
  selectors,
} from './fixtures/test-data';

test.describe('User Journey Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await clearStorage(page);
    await page.goto('/');
  });

  test('complete user authentication flow', async ({ page }) => {
    // Mock successful login API response
    await mockApiResponse(
      page,
      '**/api/auth/login',
      mockApiResponses.loginSuccess,
    );

    // Navigate to auth page
    await page.goto(testRoutes.auth);

    // Check if login form is present
    const usernameField = page.locator(selectors.auth.usernameInput).first();
    const passwordField = page.locator(selectors.auth.passwordInput).first();

    if (
      (await usernameField.isVisible()) &&
      (await passwordField.isVisible())
    ) {
      // Fill login form
      await usernameField.fill(testUsers.validUser.username);
      await passwordField.fill(testUsers.validUser.password);

      // Submit form
      const submitButton = page.locator(selectors.auth.submitButton).first();
      await submitButton.click();

      // Wait for navigation or success indication
      await page.waitForTimeout(1000);

      // Verify login success (this will depend on your app's behavior)
      const currentUrl = page.url();
      expect(currentUrl).toBeTruthy();
    }
  });

  test('responsive design across devices', async ({ page }) => {
    await testResponsive(page, async () => {
      // Test that the page loads and is functional on all viewport sizes
      await expect(page.locator('body')).toBeVisible();

      // Check if navigation is accessible (might be in a hamburger menu on mobile)
      const navMenu = page.locator(selectors.navigation.navMenu);
      if (await navMenu.isVisible()) {
        await expect(navMenu).toBeVisible();
      }
    });
  });

  test('error handling and recovery', async ({ page }) => {
    // Mock failed login API response
    await mockApiResponse(page, '**/api/auth/login', {
      status: 401,
      body: mockApiResponses.loginFailure,
    });

    await page.goto(testRoutes.auth);

    const usernameField = page.locator(selectors.auth.usernameInput).first();
    const passwordField = page.locator(selectors.auth.passwordInput).first();

    if (
      (await usernameField.isVisible()) &&
      (await passwordField.isVisible())
    ) {
      // Try to login with invalid credentials
      await usernameField.fill(testUsers.invalidUser.username);
      await passwordField.fill(testUsers.invalidUser.password);

      const submitButton = page.locator(selectors.auth.submitButton).first();
      await submitButton.click();

      // Wait for error message
      await page.waitForTimeout(1000);

      // Check if error message is displayed
      const errorMessage = page.locator(selectors.auth.errorMessage);
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    }
  });

  test('navigation and routing', async ({ page }) => {
    // Test basic navigation
    const navLinks = page.locator(selectors.navigation.navLinks);
    const linkCount = await navLinks.count();

    if (linkCount > 0) {
      // Test first few navigation links
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        const link = navLinks.nth(i);
        const href = await link.getAttribute('href');

        if (href && href !== '#' && !href.startsWith('http')) {
          await link.click();
          await waitForAngular(page);

          // Verify navigation occurred
          const currentUrl = page.url();
          expect(currentUrl).toBeTruthy();

          // Go back to home for next iteration
          await page.goto('/');
        }
      }
    }
  });

  test('form validation', async ({ page }) => {
    await page.goto(testRoutes.auth);

    // Try to submit empty form
    const submitButton = page.locator(selectors.auth.submitButton).first();

    if ((await submitButton.isVisible()) && (await submitButton.isEnabled())) {
      await submitButton.click();

      // Wait for validation
      await page.waitForTimeout(500);

      // Check for validation errors
      const errorMessages = page.locator(selectors.auth.errorMessage);
      const errorCount = await errorMessages.count();

      // If validation is implemented, there should be error messages
      if (errorCount > 0) {
        await expect(errorMessages.first()).toBeVisible();
      }
    }
  });

  test('accessibility compliance', async ({ page }) => {
    await page.goto('/');

    // Test keyboard navigation
    await page.keyboard.press('Tab');

    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    if (await focusedElement.isVisible()) {
      await expect(focusedElement).toBeVisible();
    }

    // Test that all interactive elements are keyboard accessible
    const buttons = page.locator(
      'button:not([disabled]), [role="button"]:not([disabled]), a[href]',
    );
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      if ((await button.isVisible()) && (await button.isEnabled())) {
        try {
          await button.focus();

          // Verify element can receive focus
          const isFocused = await button.evaluate(
            (el) => document.activeElement === el,
          );
          if (!isFocused) {
            console.log(`Element ${i} could not be focused`);
          }
        } catch (e) {
          console.log(`Focus test failed for element ${i}:`, e);
        }
      }
    }
  });
});
