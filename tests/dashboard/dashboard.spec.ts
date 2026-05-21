import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

/**
 * Home Page / Dashboard Tests
 *
 * TC-DASH-01  Home page loads after IDIR login
 * TC-DASH-02  Page title is correct
 * TC-DASH-03  BC Gov header / nav is visible
 * TC-DASH-04  No 404 or error on home route
 * TC-DASH-05  No JS errors on home page
 * TC-DASH-06  Search bar is visible
 * TC-DASH-07  User account menu is accessible
 * TC-DASH-08  Home page URL is correct
 */

test.describe('Home Page (Post-Login Dashboard)', () => {
  let homePage: HomePage;

  test.beforeEach(({ page }) => {
    homePage = new HomePage(page);
  });

  test('TC-DASH-01: Home page loads successfully after IDIR login', async () => {
    await homePage.goto();
    await homePage.assertHomePageLoaded();
  });

  test('TC-DASH-02: Page title contains "BC Registries"', async ({ page }) => {
    await homePage.goto();
    await expect(page).toHaveTitle(/BC Registries/i);
  });

  test('TC-DASH-03: BC Gov header / navigation bar is visible', async () => {
    await homePage.goto();
    await homePage.assertNavBarVisible();
  });

  test('TC-DASH-04: No 404 or error page on home route', async ({ page }) => {
    await homePage.goto();

    const errorText = page.getByText(/404|Page Not Found|Something went wrong|Error/i);
    const hasError = await errorText.isVisible().catch(() => false);
    expect(hasError).toBeFalsy();
  });

  test('TC-DASH-05: No JavaScript errors on home page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await homePage.goto();
    await page.waitForLoadState('networkidle');

    expect(errors, `Unexpected JS errors: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('TC-DASH-06: Search bar is visible on home page', async () => {
    await homePage.goto();
    await homePage.assertSearchBarVisible();
  });

  test('TC-DASH-07: User is shown as logged in', async () => {
    await homePage.goto();
    await homePage.assertUserIsLoggedIn();
  });

  test('TC-DASH-08: Home page URL is on test.bcregistry domain', async ({ page }) => {
    await homePage.goto();
    await expect(page).toHaveURL(/test\.bcregistry\.gov\.bc\.ca/);
  });
});
