import { Page, Locator } from '@playwright/test';

/**
 * Helper functions for E2E tests
 */

/**
 * Wait for Angular to be ready
 */
export async function waitForAngular(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      // Check if Angular testabilities are present and stable
      const getAllAngularTestabilities = (
        window as Window & {
          getAllAngularTestabilities?: () => { isStable: () => boolean }[];
        }
      ).getAllAngularTestabilities;

      if (typeof getAllAngularTestabilities !== 'function') {
        return false;
      }

      return getAllAngularTestabilities().every((testability) =>
        testability.isStable(),
      );
    },
    { timeout: 10000 },
  );
}

/**
 * Fill a form field by label text
 */
export async function fillByLabel(
  page: Page,
  labelText: string,
  value: string,
): Promise<void> {
  const field = page.locator(
    `label:has-text("${labelText}") + input, label:has-text("${labelText}") input`,
  );
  await field.fill(value);
}

/**
 * Click a button by text content
 */
export async function clickButtonByText(
  page: Page,
  buttonText: string,
): Promise<void> {
  const button = page.locator(
    `button:has-text("${buttonText}"), input[type="submit"][value="${buttonText}"]`,
  );
  await button.click();
}

/**
 * Wait for a specific route to load
 */
export async function waitForRoute(page: Page, route: string): Promise<void> {
  await page.waitForURL(`**${route}**`);
  await page.waitForLoadState('networkidle');
}

/**
 * Check if an element exists without throwing
 */
export async function elementExists(locator: Locator): Promise<boolean> {
  try {
    await locator.waitFor({ timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Take a screenshot with timestamp
 */
export async function takeTimestampedScreenshot(
  page: Page,
  name: string,
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `e2e/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Mock API responses for testing
 */
export async function mockApiResponse(
  page: Page,
  url: string,
  response: unknown,
): Promise<void> {
  await page.route(url, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Login helper for authenticated tests
 */
export async function login(
  page: Page,
  username = 'test-user',
  password = 'mock-password',
): Promise<void> {
  await page.goto('/auth');

  const usernameField = page
    .locator('input[name="username"], input[type="text"]')
    .first();
  const passwordField = page
    .locator('input[name="password"], input[type="password"]')
    .first();
  const submitButton = page
    .locator('button[type="submit"], button:has-text("Login")')
    .first();

  if (
    (await elementExists(usernameField)) &&
    (await elementExists(passwordField))
  ) {
    await usernameField.fill(username);
    await passwordField.fill(password);

    if (await elementExists(submitButton)) {
      await submitButton.click();
      await page.waitForLoadState('networkidle');
    }
  }
}

/**
 * Clear browser storage
 */
export async function clearStorage(page: Page): Promise<void> {
  try {
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        // Ignore security errors in some browsers
        console.log('Storage clear failed:', e);
      }
    });
  } catch (e) {
    // Ignore if storage is not accessible
    console.log('Storage not accessible:', e);
  }
}

/**
 * Set viewport for different device testing
 */
export const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  smallDesktop: { width: 1366, height: 768 },
};

/**
 * Test responsive behavior
 */
export async function testResponsive(
  page: Page,
  callback: () => Promise<void>,
): Promise<void> {
  for (const [device, viewport] of Object.entries(viewports)) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(500); // Allow time for responsive changes

    try {
      await callback();
    } catch (error) {
      throw new Error(`Responsive test failed on ${device}: ${error}`);
    }
  }
}
