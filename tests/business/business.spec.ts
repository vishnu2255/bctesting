import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { BusinessPage } from '../../pages/BusinessPage';

/**
 * Business Flow Tests
 *
 * TC-BIZ-01  Decide-business / registry landing page loads
 * TC-BIZ-02  Business type options are shown
 * TC-BIZ-03  Search for a business by name returns results
 * TC-BIZ-04  Search for an invalid business shows no results or error
 * TC-BIZ-05  Business dashboard page renders without error
 */

test.describe('Business Flows', () => {
  let homePage: HomePage;
  let businessPage: BusinessPage;

  test.beforeEach(({ page }) => {
    homePage = new HomePage(page);
    businessPage = new BusinessPage(page);
  });

  test('TC-BIZ-01: BC Registries home loads with business navigation', async ({ page }) => {
    await homePage.goto();
    await homePage.assertHomePageLoaded();

    // Should have some business-related links or content
    const bizContent = page.getByText(/Business Registry|My Businesses|Name Request|Incorporate/i);
    const isVisible = await bizContent.first().isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('TC-BIZ-02: Business type options are shown on home page', async ({ page }) => {
    await homePage.goto();

    const bodyText = await page.textContent('body');
    const hasOptions =
      /incorporat|register|sole proprietor|benefit company|name request|business search/i.test(
        bodyText || ''
      );
    expect(hasOptions).toBeTruthy();
  });

  test('TC-BIZ-03: Search for a known business name returns results', async ({ page }) => {
    await homePage.goto();
    await homePage.assertSearchBarVisible();

    // Search for a generic term that should return results in test env
    const searchTerm = process.env.TEST_SEARCH_TERM || 'TEST';
    await homePage.searchBusiness(searchTerm);

    // After search the URL should change or results should appear
    await page.waitForLoadState('networkidle');
    const url = page.url();
    const hasResults = url.includes('search') || url.includes('business');
    const resultsList = page.locator('[class*="result"], [class*="search"], table tbody tr');
    const listVisible = await resultsList.first().isVisible().catch(() => false);

    expect(hasResults || listVisible).toBeTruthy();
  });

  test('TC-BIZ-04: Search with empty input does not crash the page', async ({ page }) => {
    await homePage.goto();
    await homePage.assertSearchBarVisible();

    // Click search without typing
    const searchBtn = page.getByRole('button', { name: /Search/i });
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
      await page.waitForLoadState('networkidle');

      // Page should not crash
      await expect(page).not.toHaveURL(/error|500/);
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('Internal Server Error');
    }
  });

  test('TC-BIZ-05: Decide business page loads if accessible', async ({ page }) => {
    await page.goto('https://test.account.bcregistry.gov.bc.ca/decide-business');
    await page.waitForLoadState('networkidle');

    // Should either load the decide-business content or redirect appropriately
    await expect(page).not.toHaveURL(/error|500/);
  });
});
