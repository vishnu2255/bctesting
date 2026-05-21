import { Page, expect } from '@playwright/test';

/**
 * LoginPage — test.bcregistry.gov.bc.ca/en-CA/login
 *
 * DOM (verified from live page source):
 *   h1: "BC Registries Account Login"
 *   button[0]: "Login with BC Services Card"  (filled blue)
 *   button[1]: "Login with BCeID"             (outlined)
 *   button[2]: "Login with IDIR"              (outlined)
 *
 * IDIR SSO page — logontest7.gov.bc.ca:
 *   input#user        → IDIR Username
 *   input#password    → Password
 *   input[value="Continue"] → Submit
 */
export class LoginPage {
  readonly page: Page;
  readonly url = 'https://test.bcregistry.gov.bc.ca/en-CA/login';

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  // ── Login page actions ───────────────────────────────────────────────────

  async clickLoginWithIDIR() {
    // Exact text from DOM: "Login with IDIR"
    await this.page.getByRole('button', { name: 'Login with IDIR' }).click();
  }

  async clickLoginWithBCeID() {
    await this.page.getByRole('button', { name: 'Login with BCeID' }).click();
  }

  async clickLoginWithBCServicesCard() {
    await this.page.getByRole('button', { name: 'Login with BC Services Card' }).click();
  }

  // ── IDIR SSO page (logontest7.gov.bc.ca) ─────────────────────────────────

  async waitForIDIRSSOPage() {
    await this.page.waitForURL(/logontest7\.gov\.bc\.ca/, { timeout: 30_000 });
    await this.page.waitForLoadState('domcontentloaded');
  }

  async fillIDIRUsername(username: string) {
    // DOM: <input name="user" id="user" class="form-control">
    await this.page.locator('#user').fill(username);
  }

  async fillIDIRPassword(password: string) {
    // DOM: <input name="password" id="password" class="form-control">
    await this.page.locator('#password').fill(password);
  }

  async clickContinue() {
    // DOM: <input type="submit" value="Continue" class="btn btn-primary">
    await this.page.locator('input[value="Continue"]').click();
  }

  async waitForRedirectBackToRegistry() {
    await this.page.waitForURL(/bcregistry\.gov\.bc\.ca/, { timeout: 30_000 });
    await this.page.waitForLoadState('networkidle');
  }

  // ── Full IDIR login flow (one call) ──────────────────────────────────────

  async loginWithIDIR(username: string, password: string) {
    await this.goto();
    await this.clickLoginWithIDIR();
    await this.waitForIDIRSSOPage();
    await this.fillIDIRUsername(username);
    await this.fillIDIRPassword(password);
    await this.clickContinue();
    await this.waitForRedirectBackToRegistry();
  }

  // ── Assertions ───────────────────────────────────────────────────────────

  async assertLoginPageLoaded() {
    await expect(this.page).toHaveURL(/\/en-CA\/login/);
    await expect(this.page.getByRole('heading', { name: 'BC Registries Account Login' })).toBeVisible();
  }

  async assertIDIRButtonVisible() {
    await expect(this.page.getByRole('button', { name: 'Login with IDIR' })).toBeVisible();
  }

  async assertAllLoginOptionsVisible() {
    await expect(this.page.getByRole('button', { name: 'Login with BC Services Card' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Login with BCeID' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Login with IDIR' })).toBeVisible();
  }

  async assertOnIDIRSSOPage() {
    await expect(this.page).toHaveURL(/logontest7\.gov\.bc\.ca/);
    // DOM: <label for="username">IDIR Username</label>
    await expect(this.page.locator('#user')).toBeVisible();
    await expect(this.page.locator('#password')).toBeVisible();
  }

  async assertIDIRSSOErrorShown() {
    // DOM: <div class="bg-error"> shown on bad credentials
    await expect(this.page.locator('.bg-error:not(.hidden)')).toBeVisible({ timeout: 10_000 });
  }
}
