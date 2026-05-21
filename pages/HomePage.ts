import { Page, expect } from '@playwright/test';

/**
 * HomePage — test.bcregistry.gov.bc.ca/en-CA/
 *
 * The main page after IDIR login.
 * Share a screenshot of this page so selectors can be made exact.
 */
export class HomePage {
  readonly page: Page;
  readonly url = 'https://test.bcregistry.gov.bc.ca/en-CA/';  // or test.account.bcregistry.gov.bc.ca after IDIR

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  // ── Header ───────────────────────────────────────────────────────────────

  async getHeaderElement() {
    return this.page.locator('#connect-header-wrapper');
  }

  async openUserMenu() {
    // After login the "Log in" button in nav becomes account/user menu
    const userMenuBtn = this.page
      .locator('#connect-header-wrapper')
      .getByRole('button')
      .filter({ hasNotText: /What's New/i })
      .first();
    await userMenuBtn.click();
  }

  async logout() {
    await this.openUserMenu();
    await this.page.getByRole('menuitem', { name: /Log out|Sign out/i }).click();
    await this.page.waitForURL(/\/en-CA\/login/, { timeout: 20_000 });
  }

  // ── Assertions ───────────────────────────────────────────────────────────

  async assertHomePageLoaded() {
    await expect(this.page).toHaveURL(/bcregistry\.gov\.bc\.ca\//en-CA/);
    await expect(this.page).toHaveTitle(/BC Registries/i);
  }

  async assertNotOnLoginPage() {
    await expect(this.page).not.toHaveURL(/\/en-CA\/login/);
  }

  async assertHeaderVisible() {
    await expect(this.page.locator('#connect-header-wrapper')).toBeVisible();
  }

  async assertFooterVisible() {
    await expect(this.page.locator('#connect-main-footer')).toBeVisible();
  }

  async assertLoggedOut() {
    await expect(this.page).toHaveURL(/\/en-CA\/login/);
  }

  async assertNoJSErrors() {
    // Call after goto() - attach listener before navigation for accurate results
    const errors = await this.page.evaluate(() => (window as any).__jsErrors || []);
    expect(errors).toHaveLength(0);
  }
}
