import { test, expect } from '@playwright/test';
import { BusinessSearchPage } from '../../pages/BusinessSearchPage';

/**
 * Business Search Regression Tests
 *
 * Converted from recorded flow with assertions added at every key step.
 *
 * Scenarios covered:
 *   TC-SEARCH-01  Search page opens as popup from Staff Dashboard
 *   TC-SEARCH-02  Search by business name returns correct result count
 *   TC-SEARCH-03  Business name appears in search results
 *   TC-SEARCH-04  Business detail shows BC number, status, type
 *   TC-SEARCH-05  "View documents" tab is accessible
 *   TC-SEARCH-06  Document search by name works
 *   TC-SEARCH-07  Navigating back to search clears results
 *   TC-SEARCH-08  Search field is present and interactive
 *   TC-SEARCH-09  Empty search does not crash the page
 *   TC-SEARCH-10  Search with invalid name shows no results
 */

// Test data — verified from live recording
const BUSINESS = {
  searchQuery:  '130 west hastings holdings ltd',
  fullName:     '130 WEST HASTINGS HOLDINGS LTD.',
  bcNumber:     'BC0840434',
  status:       'Active',
  type:         'BC Limited Company',
  resultCount:  '(1 Business)',
  docQuery:     '13022',
};

test.describe('Business Search', () => {

  // ── TC-SEARCH-01: Full search flow from Staff Dashboard ──────────────────

  test('TC-SEARCH-01: Business Search opens as popup from Staff Dashboard', async ({ page }) => {
    await page.goto('https://test.account.bcregistry.gov.bc.ca/staff/dashboard/active');
    await page.waitForLoadState('networkidle');

    // "Business Search" link opens in a new popup tab
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Business Search' }).click();
    const popup = await popupPromise;

    await popup.waitForLoadState('networkidle');

    // Assert popup opened on the correct domain
    await expect(popup).toHaveURL(/test\.search\.bcregistry\.gov\.bc\.ca/);

    // Assert search field is present (data-testid="search-textfield")
    await expect(popup.getByTestId('search-textfield')).toBeVisible();
  });

  // ── TC-SEARCH-02 to 06: Search by name + verify details ─────────────────

  test('TC-SEARCH-02: Search by business name returns correct result count', async ({ page }) => {
    await page.goto('https://test.account.bcregistry.gov.bc.ca/staff/dashboard/active');
    await page.waitForLoadState('networkidle');

    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Business Search' }).click();
    const popup = await popupPromise;
    await popup.waitForLoadState('networkidle');

    const searchPage = new BusinessSearchPage(popup);

    // Search for the business
    await searchPage.searchBusiness(BUSINESS.searchQuery);

    // Assert result count shown — "(1 Business)"
    await searchPage.assertResultCount(BUSINESS.resultCount);
  });

  test('TC-SEARCH-03: Business name appears correctly in search results', async ({ page }) => {
    await page.goto('https://test.account.bcregistry.gov.bc.ca/staff/dashboard/active');
    await page.waitForLoadState('networkidle');

    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Business Search' }).click();
    const popup = await popupPromise;
    await popup.waitForLoadState('networkidle');

    const searchPage = new BusinessSearchPage(popup);
    await searchPage.searchBusiness(BUSINESS.searchQuery);

    // Assert the exact business name is in results
    await searchPage.assertBusinessVisible(BUSINESS.fullName);
  });

  test('TC-SEARCH-04: Business detail card shows BC number, status, and type', async ({ page }) => {
    await page.goto('https://test.account.bcregistry.gov.bc.ca/staff/dashboard/active');
    await page.waitForLoadState('networkidle');

    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Business Search' }).click();
    const popup = await popupPromise;
    await popup.waitForLoadState('networkidle');

    const searchPage = new BusinessSearchPage(popup);
    await searchPage.searchBusiness(BUSINESS.searchQuery);
    await searchPage.assertResultCount(BUSINESS.resultCount);

    // Click on the business result
    await searchPage.clickBusinessResult(BUSINESS.fullName);

    // Assert all key business details are shown
    await searchPage.assertBusinessDetails({
      bcNumber: BUSINESS.bcNumber,   // BC0840434
      status:   BUSINESS.status,     // Active
      type:     BUSINESS.type,       // BC Limited Company
    });
  });

  test('TC-SEARCH-05: "View documents" tab is visible on business detail', async ({ page }) => {
    await page.goto('https://test.account.bcregistry.gov.bc.ca/staff/dashboard/active');
    await page.waitForLoadState('networkidle');

    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Business Search' }).click();
    const popup = await popupPromise;
    await popup.waitForLoadState('networkidle');

    const searchPage = new BusinessSearchPage(popup);
    await searchPage.searchBusiness(BUSINESS.searchQuery);
    await searchPage.clickBusinessResult(BUSINESS.fullName);

    // Assert tab is present
    await searchPage.assertViewDocumentsTabVisible();
  });

  test('TC-SEARCH-06: Document search by business name works on View Documents tab', async ({ page }) => {
    await page.goto('https://test.account.bcregistry.gov.bc.ca/staff/dashboard/active');
    await page.waitForLoadState('networkidle');

    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Business Search' }).click();
    const popup = await popupPromise;
    await popup.waitForLoadState('networkidle');

    const searchPage = new BusinessSearchPage(popup);
    await searchPage.searchBusiness(BUSINESS.searchQuery);
    await searchPage.clickBusinessResult(BUSINESS.fullName);

    // Switch to View Documents tab
    await searchPage.clickViewDocumentsTab();
    await expect(
      popup.getByRole('textbox', { name: 'Business Name' })
    ).toBeVisible();

    // Search documents
    await searchPage.searchDocumentsByName(BUSINESS.docQuery);

    // Assert page does not crash
    await expect(popup).not.toHaveURL(/error|500/);
    const body = await popup.textContent('body');
    expect(body).not.toMatch(/Something went wrong|Internal Server Error/i);
  });

  // ── TC-SEARCH-07: Navigate back resets search ────────────────────────────

  test('TC-SEARCH-07: Navigating back to search home resets the results', async ({ page }) => {
    await page.goto('https://test.account.bcregistry.gov.bc.ca/staff/dashboard/active');
    await page.waitForLoadState('networkidle');

    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Business Search' }).click();
    const popup = await popupPromise;
    await popup.waitForLoadState('networkidle');

    const searchPage = new BusinessSearchPage(popup);
    await searchPage.searchBusiness(BUSINESS.searchQuery);
    await searchPage.assertResultCount(BUSINESS.resultCount);

    // Navigate back to search home
    await searchPage.goto();

    // Assert search field is empty and results are gone
    await searchPage.assertSearchPageLoaded();
    await searchPage.assertSearchFieldEmpty();
    await expect(popup.getByText(BUSINESS.resultCount)).not.toBeVisible();
  });

  // ── TC-SEARCH-08: Search page standalone ────────────────────────────────

  test('TC-SEARCH-08: Business Search page loads directly and search field is interactive', async ({ page }) => {
    await page.goto('https://test.search.bcregistry.gov.bc.ca/en-CA');
    await page.waitForLoadState('networkidle');

    const searchPage = new BusinessSearchPage(page);
    await searchPage.assertSearchPageLoaded();

    // Type and clear
    await page.getByTestId('search-textfield').fill('test input');
    await expect(page.getByTestId('search-textfield')).toHaveValue('test input');
  });

  // ── TC-SEARCH-09: Empty search ───────────────────────────────────────────

  test('TC-SEARCH-09: Pressing Enter with empty search does not crash the page', async ({ page }) => {
    await page.goto('https://test.search.bcregistry.gov.bc.ca/en-CA');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('search-textfield').click();
    await page.getByTestId('search-textfield').press('Enter');
    await page.waitForLoadState('networkidle');

    // Page should still be functional
    await expect(page).not.toHaveURL(/error|500/);
    await expect(page.getByTestId('search-textfield')).toBeVisible();
  });

  // ── TC-SEARCH-10: Invalid search ─────────────────────────────────────────

  test('TC-SEARCH-10: Searching for a non-existent business shows no results', async ({ page }) => {
    await page.goto('https://test.search.bcregistry.gov.bc.ca/en-CA');
    await page.waitForLoadState('networkidle');

    const searchPage = new BusinessSearchPage(page);
    await searchPage.searchBusiness('ZZZZINVALIDBUSINESSZZZ99999');

    // Should show 0 results or no-results message
    const body = await page.textContent('body');
    const hasNoResults =
      /no results|0 business|no business/i.test(body || '') ||
      !(body || '').includes('Business)');
    expect(hasNoResults).toBeTruthy();
  });
});
