import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

/**
 * Home Page Regression Tests (post-IDIR login)
 *
 * Uses saved IDIR session from auth.setup.ts.
 * Share a screenshot of the home page to add more precise content tests.
 */

test.describe('Home Page (Post IDIR Login)', () => {
  let homePage: HomePage;

  test.beforeEach(({ page }) => {
    homePage = new HomePage(page);
  });

  test('TC-DASH-01: Home page loads and is not the login page', async () => {
    await homePage.goto();
    await homePage.assertHomePageLoaded();
    await homePage.assertNotOnLoginPage();
  });

  test('TC-DASH-02: Page title contains "BC Registries"', async ({ page }) => {
    await homePage.goto();
    await expect(page).toHaveTitle(/BC Registries/i);
  });

  test('TC-DASH-03: BC Gov header (connect-header-wrapper) is visible', async () => {
    await homePage.goto();
    await homePage.assertHeaderVisible();
  });

  test('TC-DASH-04: Footer (connect-main-footer) is visible', async () => {
    await homePage.goto();
    await homePage.assertFooterVisible();
  });

  test('TC-DASH-05: No 404 or error content on home route', async ({ page }) => {
    await homePage.goto();

    const body = await page.textContent('body');
    expect(body).not.toMatch(/404|Page Not Found|Something went wrong|Internal Server Error/i);
  });

  test('TC-DASH-06: No JavaScript console errors on home page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await homePage.goto();
    await page.waitForLoadState('networkidle');

    expect(errors, `Unexpected JS errors: ${errors.join(' | ')}`).toHaveLength(0);
  });

  test('TC-DASH-07: URL is on test.bcregistry.gov.bc.ca domain', async ({ page }) => {
    await homePage.goto();
    await expect(page).toHaveURL(/bcregistry\.gov\.bc\.ca/);
  });

  test('TC-DASH-08: No "Unauthorized" or "403" message after login', async ({ page }) => {
    await homePage.goto();
    const body = await page.textContent('body');
    expect(body).not.toMatch(/403|Unauthorized|Forbidden|Access Denied/i);
  });

  test('TC-DASH-09: Page responds within acceptable time', async ({ page }) => {
    const start = Date.now();
    await homePage.goto();
    const elapsed = Date.now() - start;

    // Home page should load within 15 seconds
    expect(elapsed).toBeLessThan(15_000);
  });

  test('TC-DASH-10: Footer has expected navigation links', async ({ page }) => {
    await homePage.goto();

    const footer = page.locator('#connect-main-footer');
    await expect(footer.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Fees' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Disclaimer' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Privacy' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Accessibility' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Copyright' })).toBeVisible();
  });
});
