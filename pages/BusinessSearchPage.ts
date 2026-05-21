import { Page, expect, BrowserContext } from '@playwright/test';

/**
 * BusinessSearchPage
 * URL: test.search.bcregistry.gov.bc.ca/en-CA
 *
 * Opens as a popup from the Staff Dashboard "Business Search" link.
 * DOM (verified from recording):
 *   - data-testid="search-textfield"  → main search input
 *   - Business result card with name, BC number, status, type
 *   - Tabs: "View documents"
 *   - Document search: textbox[name="Business Name"]
 */
export class BusinessSearchPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Open from Staff Dashboard (handles popup) ─────────────────────────────

  static async openFromDashboard(context: BrowserContext, dashboardPage: Page): Promise<BusinessSearchPage> {
    const popupPromise = dashboardPage.waitForEvent('popup');
    await dashboardPage.getByRole('link', { name: 'Business Search' }).click();
    const popup = await popupPromise;
    await popup.waitForLoadState('networkidle');
    return new BusinessSearchPage(popup);
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto('https://test.search.bcregistry.gov.bc.ca/en-CA');
    await this.page.waitForLoadState('networkidle');
  }

  // ── Search ────────────────────────────────────────────────────────────────

  async searchBusiness(query: string) {
    // data-testid="search-textfield" — exact from recording
    await this.page.getByTestId('search-textfield').click();
    await this.page.getByTestId('search-textfield').fill(query);
    await this.page.getByTestId('search-textfield').press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async clickBusinessResult(businessName: string) {
    // Exact business name card from recording
    await this.page
      .locator('div')
      .filter({ hasText: new RegExp(`^${businessName}$`) })
      .nth(1)
      .click();
  }

  // ── Business Detail ───────────────────────────────────────────────────────

  async clickViewDocumentsTab() {
    await this.page.getByRole('tab', { name: 'View documents' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async searchDocumentsByName(query: string) {
    await this.page.getByRole('textbox', { name: 'Business Name' }).click();
    await this.page.getByRole('textbox', { name: 'Business Name' }).fill(query);
    await this.page.getByRole('textbox', { name: 'Business Name' }).press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertSearchPageLoaded() {
    await expect(this.page).toHaveURL(/test\.search\.bcregistry\.gov\.bc\.ca/);
    await expect(this.page.getByTestId('search-textfield')).toBeVisible();
  }

  async assertResultCount(countText: string) {
    // e.g. "(1 Business)" from recording
    await expect(this.page.getByText(countText)).toBeVisible({ timeout: 15_000 });
  }

  async assertBusinessVisible(businessName: string) {
    await expect(this.page.getByText(businessName)).toBeVisible({ timeout: 15_000 });
  }

  async assertBusinessDetails(opts: {
    bcNumber: string;
    status: string;
    type: string;
  }) {
    await expect(this.page.getByText(opts.bcNumber)).toBeVisible();
    await expect(this.page.getByText(opts.status)).toBeVisible();
    await expect(this.page.getByText(opts.type)).toBeVisible();
  }

  async assertViewDocumentsTabVisible() {
    await expect(this.page.getByRole('tab', { name: 'View documents' })).toBeVisible();
  }

  async assertSearchFieldEmpty() {
    await expect(this.page.getByTestId('search-textfield')).toHaveValue('');
  }

  async assertNoResultsFound() {
    await expect(
      this.page.getByText(/no results|0 business|no business found/i)
    ).toBeVisible({ timeout: 10_000 });
  }
}
