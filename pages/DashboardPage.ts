import { Page, expect } from '@playwright/test';

/**
 * DashboardPage
 * The main authenticated landing page after login.
 * Shows registered businesses, quick links, and account info.
 */
export class DashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ──────────────────────────────────────────────────────────

  async goto(accountId?: string) {
    const url = accountId ? `/account/${accountId}/business` : '/home';
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  // ── Header / Nav actions ─────────────────────────────────────────────────

  async openAccountMenu() {
    // Account switcher / user menu in the top-right nav
    await this.page.getByRole('button', { name: /My Account|Account/i }).first().click();
  }

  async logout() {
    await this.openAccountMenu();
    await this.page.getByRole('menuitem', { name: /Log out|Sign out/i }).click();
    await this.page.waitForURL(/choose-authentication-method|\/$/, { timeout: 20_000 });
  }

  async switchAccount(accountName: string) {
    await this.openAccountMenu();
    await this.page.getByRole('menuitem', { name: accountName }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Dashboard content ────────────────────────────────────────────────────

  async clickAddBusiness() {
    await this.page.getByRole('button', { name: /Add an Existing Business|Add Business/i }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickManageBusiness(businessName: string) {
    const row = this.page.getByRole('row', { name: new RegExp(businessName, 'i') });
    await row.getByRole('button', { name: /Manage/i }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Assertions ───────────────────────────────────────────────────────────

  async assertDashboardLoaded() {
    await expect(this.page).toHaveURL(/\/home|\/account|\/business/, { timeout: 20_000 });
    // The BC header banner should be present
    await expect(this.page.locator('header, nav').first()).toBeVisible();
  }

  async assertBusinessListVisible() {
    // Either a table with businesses OR an empty-state message
    const businessTable = this.page.getByRole('table');
    const emptyState = this.page.getByText(/No businesses|no registered businesses/i);
    const hasTable = await businessTable.isVisible().catch(() => false);
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    expect(hasTable || hasEmpty).toBeTruthy();
  }

  async assertAccountNameVisible(accountName: string) {
    await expect(this.page.getByText(accountName)).toBeVisible();
  }

  async assertUserMenuVisible() {
    await expect(
      this.page.getByRole('button', { name: /My Account|Account|user/i }).first()
    ).toBeVisible();
  }

  async assertLoggedOut() {
    await expect(this.page).toHaveURL(/choose-authentication-method|\/$/, { timeout: 20_000 });
  }
}
