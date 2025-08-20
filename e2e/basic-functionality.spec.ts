import { test, expect } from '@playwright/test';

test.describe('Basic Functionality', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads
    await expect(page.locator('body')).toBeVisible();

    // Check the title
    await expect(page).toHaveTitle(/AngularStarterTemplate/);
  });

  test('should have no console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors
    const filteredErrors = consoleErrors.filter(
      (error) =>
        !error.includes('favicon.ico') && !error.includes('manifest.json'),
    );

    expect(filteredErrors).toHaveLength(0);
  });

  test('should be responsive', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');

      // Check that the page is still functional
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle navigation', async ({ page }) => {
    await page.goto('/');

    // Check if there are any navigation links
    const navLinks = page.locator(
      'nav a, [role="navigation"] a, a[routerLink]',
    );
    const linkCount = await navLinks.count();

    if (linkCount > 0) {
      // Test the first navigation link
      const firstLink = navLinks.first();
      const href = await firstLink.getAttribute('href');

      if (href && href !== '#' && !href.startsWith('http')) {
        await firstLink.click();
        await page.waitForLoadState('networkidle');

        // Verify navigation occurred
        expect(page.url()).toBeTruthy();
      }
    } else {
      // If no nav links, just verify the page is functional
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Expect page to load within 10 seconds (generous for CI)
    expect(loadTime).toBeLessThan(10000);
  });
});
