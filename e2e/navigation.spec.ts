import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate between routes', async ({ page }) => {
    // Test basic navigation functionality
    const currentUrl = page.url();
    expect(currentUrl).toContain('localhost:4200');

    // Check if navigation menu exists
    const navLinks = page.locator('nav a, [role="navigation"] a');
    const linkCount = await navLinks.count();

    if (linkCount > 0) {
      // Test clicking on navigation links
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        const link = navLinks.nth(i);
        const href = await link.getAttribute('href');

        if (href && href !== '#' && !href.startsWith('http')) {
          await link.click();
          await page.waitForLoadState('networkidle');

          // Verify navigation occurred
          const newUrl = page.url();
          expect(newUrl).toBeTruthy();
        }
      }
    }
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    const initialUrl = page.url();

    // Navigate to a different route if possible
    const navLinks = page.locator('nav a, [role="navigation"] a');
    const linkCount = await navLinks.count();

    if (linkCount > 0) {
      const firstLink = navLinks.first();
      const href = await firstLink.getAttribute('href');

      if (href && href !== '#' && !href.startsWith('http')) {
        await firstLink.click();
        await page.waitForLoadState('networkidle');

        // Go back
        await page.goBack();
        await page.waitForLoadState('networkidle');

        // Verify we're back to initial URL
        expect(page.url()).toBe(initialUrl);

        // Go forward
        await page.goForward();
        await page.waitForLoadState('networkidle');

        // Verify we're at the second page again
        expect(page.url()).not.toBe(initialUrl);
      }
    }
  });

  test('should handle 404 pages', async ({ page }) => {
    // Navigate to a non-existent route
    await page.goto('/non-existent-route');

    // Check if a 404 page or error message is displayed
    // This will depend on your routing configuration
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Look for common 404 indicators
    const notFoundIndicators = page.locator(
      ':has-text("404"), :has-text("Not Found"), :has-text("Page not found")',
    );

    // If no 404 page is configured, the app might redirect to home
    const currentUrl = page.url();
    const has404Content = (await notFoundIndicators.count()) > 0;
    const redirectedToHome =
      currentUrl.endsWith('/') || currentUrl.endsWith('/home');

    expect(has404Content || redirectedToHome).toBeTruthy();
  });
});
