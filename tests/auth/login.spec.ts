import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';

/**
 * Login Flow Tests
 *
 * TC-LOGIN-01  Login page loads and shows IDIR option
 * TC-LOGIN-02  Session reuse — authenticated user goes directly to home
 * TC-LOGIN-03  Home page loaded correctly after IDIR login
 * TC-LOGIN-04  User menu is visible after login
 * TC-LOGIN-05  Logout redirects back to /en-CA/login
 * TC-LOGIN-06  Unauthenticated access to protected page redirects to login
 */

test.describe('IDIR Login Flow', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;

  test.beforeEach(({ page }) => {
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
  });

  // ── Login page structure ────────────────────────────────────────────────

  test('TC-LOGIN-01: Login page loads and IDIR button is visible', async ({ page }) => {
    await loginPage.goto();

    await expect(page).toHaveTitle(/BC Registries/i);
    await expect(page).toHaveURL(/\/en-CA\/login/);
    await loginPage.assertIDIRButtonVisible();
  });

  test('TC-LOGIN-02: Login page has no JS errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await loginPage.goto();
    await page.waitForLoadState('networkidle');

    expect(errors, `JS errors found: ${errors.join(', ')}`).toHaveLength(0);
  });

  // ── Authenticated session ────────────────────────────────────────────────
  // (These use the saved storageState from auth.setup.ts)

  test('TC-LOGIN-03: Authenticated session — home page loads', async () => {
    await homePage.goto();
    await homePage.assertHomePageLoaded();
  });

  test('TC-LOGIN-04: User menu is visible after IDIR login', async () => {
    await homePage.goto();
    await homePage.assertUserIsLoggedIn();
  });

  test('TC-LOGIN-05: Nav bar is rendered on home page', async () => {
    await homePage.goto();
    await homePage.assertNavBarVisible();
  });

  // ── Logout ───────────────────────────────────────────────────────────────

  test('TC-LOGIN-06: Logout redirects to /en-CA/login', async () => {
    await homePage.goto();
    await homePage.assertHomePageLoaded();
    await homePage.logout();
    await homePage.assertLoggedOut();
  });

  // ── Unauthenticated redirect ─────────────────────────────────────────────

  test('TC-LOGIN-07: Unauthenticated access redirects to login', async ({ browser }) => {
    // Use a fresh context — no saved session
    const ctx = await browser.newContext();
    const freshPage = await ctx.newPage();

    await freshPage.goto('https://test.bcregistry.gov.bc.ca/en-CA/');
    await freshPage.waitForLoadState('networkidle');

    // Should be pushed to login page
    await expect(freshPage).toHaveURL(/\/en-CA\/login|\/login/);
    await ctx.close();
  });
});
