import { Page, expect } from '@playwright/test';

/**
 * IncorporationPage
 * Covers the full "Incorporate a Numbered Limited Company" wizard.
 *
 * Steps (from recorded flow):
 *   1. Staff Dashboard → My Staff Business Registry
 *   2. Get Started → Incorporation or Registration
 *   3. Select Limited Company → Numbered Company
 *   4. Incorporate Now → skip name request
 *   5. Registered Office address (autocomplete)
 *   6. Email address
 *   7. Add People and Roles (incorporator / director / completing party)
 *   8. Share Structure (class name, max shares, par value)
 *   9. Incorporation Agreement
 *  10. Review and Confirm → certify → File and Pay
 *  11. Assert filing status on Business Dashboard
 */
export class IncorporationPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Step 1: Staff Dashboard ───────────────────────────────────────────────

  async gotoStaffDashboard() {
    await this.page.goto('https://test.account.bcregistry.gov.bc.ca/staff/dashboard/active');
    await this.page.waitForLoadState('networkidle');
  }

  async clickMyStaffBusinessRegistry() {
    await this.page.getByRole('button', { name: 'My Staff Business Registry' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Step 2: Start incorporation ───────────────────────────────────────────

  async clickGetStartedBCBased() {
    await this.page.getByRole('link', { name: 'Get Started with a B.C. Based' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectIncorporationOrRegistration() {
    await this.page.getByRole('textbox', { name: 'Action', exact: true }).click();
    await this.page.getByText('Incorporation or Registration').click();
  }

  async clickStartNewBCBusiness() {
    await this.page.getByRole('button', { name: 'Action Start a new BC-based' }).click();
    await this.page.getByText('Incorporation or Registration').click();
  }

  // ── Step 3: Business type ─────────────────────────────────────────────────

  async selectLimitedCompany() {
    await this.page.getByRole('textbox', { name: 'Select type of business in B.' }).click();
    await this.page.getByText('Limited Company').click();
  }

  async selectNumberedCompany() {
    await this.page.getByText('Numbered Company').click();
  }

  async clickIncorporateNow() {
    await this.page.getByRole('button', { name: 'Incorporate Now' }).click();
  }

  async clickIncorporateNumberedCompany() {
    await this.page.getByRole('button', { name: 'Incorporate a Numbered Company' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickNotRightNow() {
    await this.page.getByRole('button', { name: 'Not Right Now' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Step 5: Registered Office address ────────────────────────────────────

  async fillRegisteredOfficeAddress(streetPartial: string, fullAddressSuggestion: string) {
    await this.page.locator('#street-address-3').click();
    await this.page.locator('#street-address-3').fill(streetPartial);
    // Wait for autocomplete and select
    await this.page.getByText(fullAddressSuggestion).click();
  }

  async checkSameAsMailingAddress() {
    await this.page.getByText('Same as Mailing Address').click();
  }

  // ── Step 6: Email ─────────────────────────────────────────────────────────

  async fillEmail(email: string) {
    await this.page.getByRole('textbox', { name: 'Email Address', exact: true }).fill(email);
    await this.page.getByRole('textbox', { name: 'Confirm Email Address' }).fill(email);
  }

  // ── Step 7: Add People and Roles ──────────────────────────────────────────

  async clickAddPeopleAndRoles() {
    await this.page.getByRole('link', { name: 'Add People and Roles' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickStartByAddingTheIncorporator() {
    await this.page.getByRole('button', { name: 'Start by Adding the' }).click();
  }

  async selectDirectorRole() {
    // Checkbox for Director role (2nd checkbox in row)
    await this.page.locator('.row.align-center > div:nth-child(2) > .v-input > .v-input__control > .v-input__slot > .v-input--selection-controls__input > .v-input--selection-controls__ripple').click();
  }

  async selectCompletingPartyRole() {
    // Checkbox for Completing Party role (3rd checkbox in row)
    await this.page.locator('div:nth-child(3) > .v-input > .v-input__control > .v-input__slot > .v-input--selection-controls__input > .v-input--selection-controls__ripple').click();
  }

  async checkSamePersonAsAbove() {
    await this.page.locator('.v-form > div > .v-input.inherit-checkbox > .v-input__control > .v-input__slot > .v-input--selection-controls__input > .v-input--selection-controls__ripple').click();
  }

  async clickDone() {
    await this.page.getByRole('button', { name: 'Done' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Step 8: Share Structure ───────────────────────────────────────────────

  async clickCreateShareStructure() {
    await this.page.getByRole('link', { name: 'Create Share Structure' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddShareClass() {
    await this.page.getByRole('button', { name: 'Add Share Class' }).click();
  }

  async fillShareClass(className: string, maxShares: string, parValue: string) {
    await this.page.getByRole('textbox', { name: 'Class Name [Shares]' }).fill(className);
    await this.page.getByRole('spinbutton', { name: 'Maximum Number of Shares' }).fill(maxShares);
    await this.page.getByRole('spinbutton', { name: 'Par Value' }).fill(parValue);
    await this.clickDone();
  }

  // ── Step 9: Incorporation Agreement ──────────────────────────────────────

  async clickIncorporationAgreement() {
    await this.page.getByRole('link', { name: 'Incorporation Agreement' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectAgreementType() {
    await this.page.locator('.v-radio > .v-input--selection-controls__input > .v-input--selection-controls__ripple').first().click();
  }

  // ── Step 10: Review and Confirm ───────────────────────────────────────────

  async clickReviewAndConfirm() {
    await this.page.getByRole('link', { name: 'Review and Confirm' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async fillCertifierName(name: string) {
    await this.page.getByRole('textbox', { name: 'Legal name of authorized' }).fill(name);
  }

  async checkCertifyCheckbox() {
    await this.page.locator('.v-input.mt-0.pa-5 > .v-input__control > .v-input__slot > .v-input--selection-controls__input > .v-input--selection-controls__ripple').click();
  }

  async selectNoFeePayment() {
    await this.page.getByText('No Fee').click();
  }

  async clickFileAndPay() {
    await this.page.getByRole('button', { name: 'File and Pay' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertOnStaffDashboard() {
    await expect(this.page).toHaveURL(/staff\/dashboard/);
    await expect(
      this.page.getByRole('button', { name: 'My Staff Business Registry' })
    ).toBeVisible();
  }

  async assertOnIncorporationWizard() {
    await expect(this.page).toHaveURL(/incorporate|registration|ia/i);
  }

  async assertAddressFilledCorrectly(expectedAddress: string) {
    const addressField = this.page.locator('#street-address-3');
    await expect(addressField).not.toHaveValue('');
    const value = await addressField.inputValue();
    expect(value.toLowerCase()).toContain(expectedAddress.toLowerCase().split(' ')[0]);
  }

  async assertEmailFilledCorrectly(email: string) {
    const emailField = this.page.getByRole('textbox', { name: 'Email Address', exact: true });
    await expect(emailField).toHaveValue(email);
  }

  async assertShareClassVisible(className: string) {
    await expect(this.page.getByText(className)).toBeVisible();
  }

  async assertOnReviewPage() {
    await expect(
      this.page.getByRole('link', { name: 'Review and Confirm' })
    ).toBeVisible();
  }

  async assertFilingStatusOnDashboard(expectedStatus: string) {
    // Wait for status badge to appear on the business dashboard
    await expect(
      this.page.getByText(expectedStatus)
    ).toBeVisible({ timeout: 30_000 });
  }

  async assertBusinessDashboardLoaded() {
    await expect(this.page).toHaveURL(/business-dashboard\.bcregistry\.gov\.bc\.ca/);
    // The page should not show an error
    const body = await this.page.textContent('body');
    expect(body).not.toMatch(/404|Page Not Found|Error/i);
  }

  async assertNoFeeSelected() {
    await expect(this.page.getByText('No Fee')).toBeVisible();
  }

  async assertFileAndPayButtonEnabled() {
    await expect(
      this.page.getByRole('button', { name: 'File and Pay' })
    ).toBeEnabled();
  }
}
