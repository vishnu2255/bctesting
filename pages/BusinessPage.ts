import { Page, expect } from '@playwright/test';

/**
 * BusinessPage
 * Covers: Business search, adding existing business, business details
 */
export class BusinessPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ──────────────────────────────────────────────────────────

  async gotoDecideBusiness() {
    await this.page.goto('/decide-business');
    await this.page.waitForLoadState('networkidle');
  }

  // ── Add Existing Business ────────────────────────────────────────────────

  async searchBusiness(identifier: string) {
    // Business number / incorporation number field
    const searchInput = this.page.getByPlaceholder(/Incorporation Number|Business Number|Enter/i)
      .or(this.page.getByLabel(/Business Identifier|Incorporation Number/i));
    await searchInput.fill(identifier);
    await this.page.getByRole('button', { name: /Search|Find/i }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async fillPasscode(passcode: string) {
    await this.page.getByLabel(/Passcode|Password/i).fill(passcode);
  }

  async submitAddBusiness() {
    await this.page.getByRole('button', { name: /Add|Confirm|Submit/i }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Business type selection (decide-business page) ───────────────────────

  async selectIncorporateBenefitCompany() {
    await this.page.getByRole('button', { name: /Benefit Company/i }).click();
  }

  async selectRegisterSoleProprietorship() {
    await this.page.getByRole('button', { name: /Sole Proprietorship|Proprietorship/i }).click();
  }

  async selectNameRequest() {
    await this.page.getByRole('link', { name: /Request a Name|Name Request/i }).click();
  }

  // ── Assertions ───────────────────────────────────────────────────────────

  async assertBusinessFound(businessName: string) {
    await expect(this.page.getByText(businessName, { exact: false })).toBeVisible({ timeout: 15_000 });
  }

  async assertBusinessNotFound() {
    await expect(
      this.page.getByText(/not found|no business|invalid/i)
    ).toBeVisible({ timeout: 10_000 });
  }

  async assertDecideBusinessPageLoaded() {
    await expect(this.page).toHaveURL(/decide-business/);
    await expect(
      this.page.getByRole('heading', { name: /What would you like to do|How do you want/i })
    ).toBeVisible();
  }

  async assertOnBusinessDashboard() {
    await expect(this.page).toHaveURL(/\/business$/);
  }
}
