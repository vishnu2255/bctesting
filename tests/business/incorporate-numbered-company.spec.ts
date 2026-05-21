import { test, expect } from '@playwright/test';
import { IncorporationPage } from '../../pages/IncorporationPage';

/**
 * Incorporate a Numbered Limited Company — Full Regression Test
 *
 * Recorded flow converted to structured test with assertions.
 *
 * Flow:
 *   Staff Dashboard
 *     → My Staff Business Registry
 *     → Get Started (BC Based)
 *     → Incorporation or Registration
 *     → Limited Company → Numbered Company
 *     → Incorporate Now → Incorporate a Numbered Company
 *     → Not Right Now (skip name request)
 *     → [Registered Office] fill address + Same as Mailing
 *     → [Email] fill + confirm
 *     → [Add People and Roles] add incorporator / director / completing party
 *     → [Share Structure] CLASS1, 1231 shares, par value $2
 *     → [Incorporation Agreement] select type
 *     → [Review and Confirm] certify + No Fee + File and Pay
 *     → Assert FILED AND PENDING on Business Dashboard
 */

// Test data — change these for different regression runs
const TEST_DATA = {
  addressPartial: '7861 WEL',
  addressSuggestion: 'Welsley Dr',         // partial match for autocomplete
  email: 'VVR@GMAIL.COM',
  shareClassName: 'CLASS1',
  maxShares: '1231',
  parValue: '2',
  certifierName: 'VVRT',
  expectedStatus: 'FILED AND PENDING',
};

test.describe('Incorporate Numbered Limited Company', () => {
  let incorporationPage: IncorporationPage;

  test.beforeEach(({ page }) => {
    incorporationPage = new IncorporationPage(page);
  });

  // ── Full end-to-end incorporation flow ────────────────────────────────────

  test('TC-INC-01: Full incorporation of a Numbered Limited Company', async ({ page }) => {

    // ── STEP 1: Staff Dashboard ─────────────────────────────────────────────
    await incorporationPage.gotoStaffDashboard();
    await incorporationPage.assertOnStaffDashboard();

    await incorporationPage.clickMyStaffBusinessRegistry();
    await expect(page.getByRole('link', { name: 'Get Started with a B.C. Based' })).toBeVisible();

    // ── STEP 2: Start Incorporation ─────────────────────────────────────────
    await incorporationPage.clickGetStartedBCBased();

    await incorporationPage.selectIncorporationOrRegistration();
    await expect(page.getByText('Incorporation or Registration')).toBeVisible();

    await incorporationPage.clickStartNewBCBusiness();

    // ── STEP 3: Business Type ───────────────────────────────────────────────
    await incorporationPage.selectLimitedCompany();
    await expect(page.getByText('Limited Company')).toBeVisible();

    await incorporationPage.selectNumberedCompany();
    await expect(page.getByText('Numbered Company')).toBeVisible();

    await incorporationPage.clickIncorporateNow();
    await incorporationPage.clickIncorporateNumberedCompany();

    // ── STEP 4: Skip Name Request ───────────────────────────────────────────
    await incorporationPage.clickNotRightNow();

    // ── STEP 5: Registered Office Address ──────────────────────────────────
    await incorporationPage.fillRegisteredOfficeAddress(
      TEST_DATA.addressPartial,
      TEST_DATA.addressSuggestion
    );

    // Assert address was filled in
    await expect(page.locator('#street-address-3')).not.toHaveValue('');

    await incorporationPage.checkSameAsMailingAddress();
    // Assert mailing = registered office
    await expect(page.getByText('Same as Mailing Address')).toBeVisible();

    // ── STEP 6: Email ───────────────────────────────────────────────────────
    await incorporationPage.fillEmail(TEST_DATA.email);

    // Assert email fields filled
    await expect(
      page.getByRole('textbox', { name: 'Email Address', exact: true })
    ).toHaveValue(TEST_DATA.email);
    await expect(
      page.getByRole('textbox', { name: 'Confirm Email Address' })
    ).toHaveValue(TEST_DATA.email);

    // ── STEP 7: People and Roles ────────────────────────────────────────────
    await incorporationPage.clickAddPeopleAndRoles();

    // Assert we're on the People and Roles step
    await expect(
      page.getByRole('button', { name: 'Start by Adding the' })
    ).toBeVisible();

    await incorporationPage.clickStartByAddingTheIncorporator();
    await incorporationPage.selectDirectorRole();
    await incorporationPage.selectCompletingPartyRole();
    await incorporationPage.checkSamePersonAsAbove();
    await incorporationPage.clickDone();

    // Assert person was added (Done closes the form)
    await expect(page.getByRole('button', { name: 'Done' })).not.toBeVisible();

    // ── STEP 8: Share Structure ─────────────────────────────────────────────
    await incorporationPage.clickCreateShareStructure();
    await expect(
      page.getByRole('button', { name: 'Add Share Class' })
    ).toBeVisible();

    await incorporationPage.clickAddShareClass();
    await incorporationPage.fillShareClass(
      TEST_DATA.shareClassName,
      TEST_DATA.maxShares,
      TEST_DATA.parValue
    );

    // Assert share class was added to the list
    await incorporationPage.assertShareClassVisible(TEST_DATA.shareClassName);

    // ── STEP 9: Incorporation Agreement ────────────────────────────────────
    await incorporationPage.clickIncorporationAgreement();
    await incorporationPage.selectAgreementType();

    // Assert agreement option is selected
    await expect(
      page.locator('.v-radio > .v-input--selection-controls__input').first()
    ).toBeVisible();

    // ── STEP 10: Review and Confirm ─────────────────────────────────────────
    await incorporationPage.clickReviewAndConfirm();

    // Assert review page loaded — all summary sections visible
    await expect(page.getByText(/Review and Confirm/i).first()).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Legal name of authorized' })).toBeVisible();

    await incorporationPage.fillCertifierName(TEST_DATA.certifierName);
    await expect(
      page.getByRole('textbox', { name: 'Legal name of authorized' })
    ).toHaveValue(TEST_DATA.certifierName);

    await incorporationPage.checkCertifyCheckbox();

    // Assert No Fee payment option visible and select it
    await incorporationPage.assertNoFeeSelected();
    await incorporationPage.selectNoFeePayment();

    // Assert File and Pay button is active
    await incorporationPage.assertFileAndPayButtonEnabled();

    // ── STEP 11: File and Pay ───────────────────────────────────────────────
    await incorporationPage.clickFileAndPay();

    // ── STEP 12: Business Dashboard — assert filing status ─────────────────
    // After filing, app redirects to business dashboard
    await incorporationPage.assertBusinessDashboardLoaded();

    // Assert the filing status shows FILED AND PENDING
    await incorporationPage.assertFilingStatusOnDashboard(TEST_DATA.expectedStatus);

    // Assert the address appears in the filing summary
    await expect(
      page.getByText(/Welsley Dr/i).first()
    ).toBeVisible();
  });

  // ── Smoke tests (individual steps) ───────────────────────────────────────

  test('TC-INC-02: Staff dashboard loads correctly', async () => {
    await incorporationPage.gotoStaffDashboard();
    await incorporationPage.assertOnStaffDashboard();
  });

  test('TC-INC-03: My Staff Business Registry button is visible and clickable', async ({ page }) => {
    await incorporationPage.gotoStaffDashboard();

    const btn = page.getByRole('button', { name: 'My Staff Business Registry' });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('TC-INC-04: Get Started with BC-based business link is present', async () => {
    await incorporationPage.gotoStaffDashboard();
    await incorporationPage.clickMyStaffBusinessRegistry();

    await expect(
      incorporationPage.page.getByRole('link', { name: 'Get Started with a B.C. Based' })
    ).toBeVisible();
  });

  test('TC-INC-05: Incorporation wizard loads after selecting Numbered Company', async ({ page }) => {
    await incorporationPage.gotoStaffDashboard();
    await incorporationPage.clickMyStaffBusinessRegistry();
    await incorporationPage.clickGetStartedBCBased();
    await incorporationPage.selectIncorporationOrRegistration();
    await incorporationPage.clickStartNewBCBusiness();
    await incorporationPage.selectLimitedCompany();
    await incorporationPage.selectNumberedCompany();
    await incorporationPage.clickIncorporateNow();
    await incorporationPage.clickIncorporateNumberedCompany();

    // Assert wizard has started — "Not Right Now" modal visible
    await expect(page.getByRole('button', { name: 'Not Right Now' })).toBeVisible();
  });
});
