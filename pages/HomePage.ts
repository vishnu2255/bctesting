import { Page, expect } from '@playwright/test';

/**
 * HomePage
 * The BC Registries home page after IDIR login.
 * URL: https://test.bcregistry.gov.bc.ca/en-CA/
 *
 * Contains: business search, filings navigation, account menu
 */
export class HomePage {
  readonly page: Page;
  readonly baseURL = 'https://test.bcregistry.gov.bc.ca';

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto(`${this.baseURL}/en-CA/`);
    await this.page.waitForLoadState('networkidle');
  }

  // ── Header / User menu ───────────────────────────────────────────────────

  async openUserMenu() {
    const userMenu = this.page
      .getByRole('button', { name: /My Account|Account|Profile/i })
      .or(this.page.locator('[data-test="user-menu"], [aria-label*="account" i]'))
      .first();
    await userMenu.click();
  }

  async logout() {
    await this.openUserMenu();
    const logoutBtn = this.page.getByRole('menuitem', { name: /Log out|Sign out/i })
      .or(this.page.getByRole('link', { name: /Log out|Sign out/i }));
    await logoutBtn.click();
    await this.page.waitForURL(/\/en-CA\/login/, { timeout: 20_000 });
  }

  // ── Business Search ──────────────────────────────────────────────────────

  async searchBusiness(query: string) {
    const searchInput = this.page
      .getByPlaceholder(/Search businesses|Enter a business name/i)
      .or(this.page.getByRole('searchbox'))
      .or(this.page.locator('input[type="search"], input[name*="search" i]'))
      .first();

    await searchInput.fill(query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async clickSearchButton() {
    await this.page.getByRole('button', { name: /Search/i }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Navigation Links ─────────────────────────────────────────────────────

  async clickBusinessRegistryLink() {
    await this.page.getByRole('link', { name: /Business Registry/i }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickMyBusinessesLink() {
    await this.page.getByRole('link', { name: /My Businesses|My Registries/i }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Assertions ───────────────────────────────────────────────────────────

  async assertHomePageLoaded() {
    await expect(this.page).toHaveURL(/test\.bcregistry\.gov\.bc\.ca\/en-CA/, { timeout: 20_000 });
    await expect(this.page).toHaveTitle(/BC Registries/i);
  }

  async assertUserIsLoggedIn() {
    // After IDIR login the user avatar / account menu appears
    const loggedInIndicator = this.page
      .getByRole('button', { name: /My Account|Account|Profile/i })
      .or(this.page.locator('[data-test="user-menu"]'))
      .or(this.page.getByText(/My Account|Logged in/i));
    await expect(loggedInIndicator.first()).toBeVisible({ timeout: 15_000 });
  }

  async assertNavBarVisible() {
    await expect(this.page.locator('header, nav').first()).toBeVisible();
  }

  async assertSearchBarVisible() {
    const search = this.page
      .getByPlaceholder(/Search/i)
      .or(this.page.getByRole('searchbox'));
    await expect(search.first()).toBeVisible({ timeout: 10_000 });
  }

  async assertLoggedOut() {
    await expect(this.page).toHaveURL(/\/en-CA\/login/);
  }
}
