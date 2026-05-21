import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

/**
 * Login Flow Regression Tests
 *
 * All selectors verified against live DOM:
 *   - test.bcregistry.gov.bc.ca/en-CA/login
 *   - logontest7.gov.bc.ca (IDIR SSO)
 */

test.describe('BC Registries Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(({ page }) => {
    loginPage = new LoginPage(page);
  });

  // ── Login page structure ─────────────────────────────────────────────────

  test('TC-LOGIN-01: Login page loads with correct heading', async ({ page }) => {
    await loginPage.goto();

    // h1 exact text from DOM
    await expect(page.getByRole('heading', { name: 'BC Registries Account Login' })).toBeVisible();
    await expect(page).toHaveURL(/\/en-CA\/login/);
    await expect(page).toHaveTitle(/BC Registries/i);
  });

  test('TC-LOGIN-02: All three login options are visible', async () => {
    await loginPage.goto();
    await loginPage.assertAllLoginOptionsVisible();
  });

  test('TC-LOGIN-03: "Login with IDIR" button is visible and enabled', async ({ page }) => {
    await loginPage.goto();

    const idirBtn = page.getByRole('button', { name: 'Login with IDIR' });
    await expect(idirBtn).toBeVisible();
    await expect(idirBtn).toBeEnabled();
  });

  test('TC-LOGIN-04: "Login with BCeID" button is visible and enabled', async ({ page }) => {
    await loginPage.goto();

    const bceidBtn = page.getByRole('button', { name: 'Login with BCeID' });
    await expect(bceidBtn).toBeVisible();
    await expect(bceidBtn).toBeEnabled();
  });

  test('TC-LOGIN-05: "Login with BC Services Card" is the primary (filled) button', async ({ page }) => {
    await loginPage.goto();

    const bcscBtn = page.getByRole('button', { name: 'Login with BC Services Card' });
    await expect(bcscBtn).toBeVisible();
    // Primary button has blue bg class
    await expect(bcscBtn).toHaveClass(/bg-primary/);
  });

  test('TC-LOGIN-06: Info banner is visible on login page', async ({ page }) => {
    await loginPage.goto();

    // Yellow banner: "BC Registry Services has resumed priority service..."
    await expect(
      page.getByText(/BC Registry Services has resumed priority service/i)
    ).toBeVisible();
  });

  test('TC-LOGIN-07: Header shows "Log in" and "Create Account" options', async ({ page }) => {
    await loginPage.goto();

    // From DOM: aria-label="Select log in method" + "Create Account" link
    await expect(page.getByRole('button', { name: /Log in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create Account' })).toBeVisible();
  });

  test('TC-LOGIN-08: No JS errors on login page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await loginPage.goto();
    await page.waitForLoadState('networkidle');

    expect(errors, `JS errors: ${errors.join(', ')}`).toHaveLength(0);
  });

  // ── IDIR redirect ────────────────────────────────────────────────────────

  test('TC-LOGIN-09: Clicking "Login with IDIR" redirects to logontest7.gov.bc.ca', async ({ page }) => {
    await loginPage.goto();
    await loginPage.clickLoginWithIDIR();

    // Should redirect to BC Gov SiteMinder IDIR SSO
    await expect(page).toHaveURL(/logontest7\.gov\.bc\.ca/, { timeout: 30_000 });
  });

  test('TC-LOGIN-10: IDIR SSO page has username and password fields', async ({ page }) => {
    await loginPage.goto();
    await loginPage.clickLoginWithIDIR();
    await loginPage.waitForIDIRSSOPage();

    // Exact IDs from DOM: id="user", id="password"
    await expect(page.locator('#user')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('input[value="Continue"]')).toBeVisible();
  });

  test('TC-LOGIN-11: IDIR SSO page has correct "IDIR Username" label', async ({ page }) => {
    await loginPage.goto();
    await loginPage.clickLoginWithIDIR();
    await loginPage.waitForIDIRSSOPage();

    // From DOM: <label class="control-label" for="username">IDIR Username</label>
    await expect(page.getByText('IDIR Username')).toBeVisible();
    await expect(page.getByText('Password')).toBeVisible();
  });

  test('TC-LOGIN-12: Empty credentials show validation error on IDIR SSO page', async ({ page }) => {
    await loginPage.goto();
    await loginPage.clickLoginWithIDIR();
    await loginPage.waitForIDIRSSOPage();

    // Click Continue without filling credentials
    await page.locator('input[value="Continue"]').click();

    // From DOM: <div class="bg-error hidden"> → toggled to visible on error
    // JS validation: shows "Enter an IDIR username and password"
    await expect(
      page.getByText('Enter an IDIR username and password')
    ).toBeVisible({ timeout: 5_000 });
  });

  // ── Session / authenticated state ────────────────────────────────────────
  // (Uses saved storageState from auth.setup.ts)

  test('TC-LOGIN-13: Authenticated session — accessing home does not redirect to login', async ({ page }) => {
    await page.goto('https://test.bcregistry.gov.bc.ca/en-CA/');
    await page.waitForLoadState('networkidle');

    // Should NOT be on the login page
    await expect(page).not.toHaveURL(/\/en-CA\/login/);
  });

  test('TC-LOGIN-14: Unauthenticated access to home redirects to login', async ({ browser }) => {
    // Fresh context — no saved session
    const ctx = await browser.newContext();
    const freshPage = await ctx.newPage();

    await freshPage.goto('https://test.bcregistry.gov.bc.ca/en-CA/');
    await freshPage.waitForLoadState('networkidle');

    await expect(freshPage).toHaveURL(/\/en-CA\/login/);
    await ctx.close();
  });
});
