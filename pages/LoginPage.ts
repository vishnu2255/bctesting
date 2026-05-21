import { Page, expect } from '@playwright/test';

/**
 * LoginPage
 * Handles BC Registries login via IDIR (BC Government employees).
 *
 * Flow:
 *   1. https://test.bcregistry.gov.bc.ca/en-CA/login
 *   2. Click "Login with IDIR"
 *   3. Redirect → logon.gov.bc.ca (IDIR IdP)
 *   4. Enter IDIR username + password
 *   5. Redirect back → home page
 */
export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto('https://test.bcregistry.gov.bc.ca/en-CA/login');
    await this.page.waitForLoadState('networkidle');
  }

  // ── IDIR Login ───────────────────────────────────────────────────────────

  async clickLoginWithIDIR() {
    // "Login with IDIR" button on the BC Registries login page
    const idirBtn = this.page
      .getByRole('button', { name: /IDIR/i })
      .or(this.page.getByRole('link', { name: /IDIR/i }))
      .or(this.page.locator('[data-test="idir-login-btn"]'))
      .or(this.page.locator('a[href*="idir"], button:has-text("IDIR")'));

    await idirBtn.first().waitFor({ state: 'visible', timeout: 15_000 });
    await idirBtn.first().click();
  }

  async fillIDIRCredentials(username: string, password: string) {
    // Redirected to BC Gov IDIR SSO (logon.gov.bc.ca or similar)
    await this.page.waitForURL(/logon\.gov\.bc\.ca|loginproxy\.gov\.bc\.ca|oidc\.gov\.bc\.ca/, {
      timeout: 30_000,
    });

    await this.page.getByLabel(/User ID|Username|IDIR Username/i).fill(username);
    await this.page.getByLabel(/Password/i).fill(password);
    await this.page.getByRole('button', { name: /Continue|Sign In|Login/i }).click();
  }

  async waitForHomePageAfterLogin() {
    // Redirect back to BC Registries after successful IDIR auth
    await this.page.waitForURL(/test\.bcregistry\.gov\.bc\.ca/, { timeout: 30_000 });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Full IDIR login in one call — use this in auth.setup.ts
   */
  async loginWithIDIR(username: string, password: string) {
    await this.goto();
    await this.clickLoginWithIDIR();
    await this.fillIDIRCredentials(username, password);
    await this.waitForHomePageAfterLogin();
  }

  // ── Assertions ───────────────────────────────────────────────────────────

  async assertLoginPageVisible() {
    await expect(this.page).toHaveURL(/\/en-CA\/login/);
    // IDIR button must be present
    const idirBtn = this.page.getByRole('button', { name: /IDIR/i })
      .or(this.page.getByRole('link', { name: /IDIR/i }));
    await expect(idirBtn.first()).toBeVisible({ timeout: 10_000 });
  }

  async assertIDIRButtonVisible() {
    const idirEl = this.page.getByText(/IDIR/i).first();
    await expect(idirEl).toBeVisible({ timeout: 10_000 });
  }
}
