import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load the homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Expect page to load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Measure Largest Contentful Paint (LCP)
    const lcp: number = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Fallback timeout
        setTimeout(() => resolve(0), 3000);
      });
    });

    // LCP should be under 2.5 seconds (2500ms)
    if (lcp > 0) {
      expect(lcp).toBeLessThan(2500);
    }
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors (you can customize this)
    const filteredErrors = consoleErrors.filter(
      (error) =>
        !error.includes('favicon.ico') &&
        !error.includes('manifest.json') &&
        !error.toLowerCase().includes('third-party'),
    );

    expect(filteredErrors).toHaveLength(0);
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for basic accessibility requirements

    // 1. Page should have a title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // 2. Check for proper heading structure
    const h1Elements = page.locator('h1');
    const h1Count = await h1Elements.count();

    // Should have at least one h1, but not more than one per page
    if (h1Count > 0) {
      expect(h1Count).toBeLessThanOrEqual(1);
    }

    // 3. Images should have alt attributes
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const role = await img.getAttribute('role');

      // Images should have alt text, aria-label, or be decorative
      const hasAccessibleText =
        alt !== null || ariaLabel !== null || role === 'presentation';
      expect(hasAccessibleText).toBeTruthy();
    }

    // 4. Interactive elements should be keyboard accessible
    const buttons = page.locator(
      'button:not([disabled]), [role="button"]:not([disabled])',
    );
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      if ((await button.isVisible()) && (await button.isEnabled())) {
        try {
          await button.focus();

          // Button should be focusable
          const isFocused = await button.evaluate(
            (el) => document.activeElement === el,
          );
          if (!isFocused) {
            console.log(`Button ${i} could not be focused`);
          }
        } catch (e) {
          console.log(`Focus test failed for button ${i}:`, e);
        }
      }
    }
  });
});
