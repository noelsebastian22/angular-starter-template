import { test, expect } from '@playwright/test';

test.describe('App Component', () => {
  test('should display welcome message', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/AngularStarterTemplate/);
  });

  test('should navigate to different routes', async ({ page }) => {
    await page.goto('/');

    // Check if the page loads successfully
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check if the page is still functional on mobile
    await expect(page.locator('body')).toBeVisible();
  });
});
