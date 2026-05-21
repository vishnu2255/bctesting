import { Page, expect } from '@playwright/test';

/**
 * AccountPage
 * Covers: Create Account wizard, Account Settings, Team Members
 */
export class AccountPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ──────────────────────────────────────────────────────────

  async gotoCreateAccount() {
    await this.page.goto('/choose-authentication-method');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoAccountSettings(accountId: string) {
    await this.page.goto(`/account/${accountId}/settings`);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoTeamMembers(accountId: string) {
    await this.page.goto(`/account/${accountId}/settings/team-members`);
    await this.page.waitForLoadState('networkidle');
  }

  // ── Create Account Wizard ────────────────────────────────────────────────

  async selectAccountTypePersonal() {
    await this.page.getByRole('radio', { name: /Personal/i }).check();
    await this.page.getByRole('button', { name: /Next|Continue/i }).click();
  }

  async selectAccountTypeBusiness() {
    await this.page.getByRole('radio', { name: /Business/i }).check();
    await this.page.getByRole('button', { name: /Next|Continue/i }).click();
  }

  async fillAccountName(name: string) {
    await this.page.getByLabel(/Account Name/i).fill(name);
  }

  async fillContactEmail(email: string) {
    await this.page.getByLabel(/Email/i).fill(email);
  }

  async fillContactPhone(phone: string) {
    const phoneField = this.page.getByLabel(/Phone/i);
    if (await phoneField.isVisible()) {
      await phoneField.fill(phone);
    }
  }

  async submitAccountCreation() {
    await this.page.getByRole('button', { name: /Create Account|Submit|Save/i }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Team Members ─────────────────────────────────────────────────────────

  async inviteTeamMember(email: string) {
    await this.page.getByRole('button', { name: /Invite/i }).click();
    await this.page.getByLabel(/Email/i).fill(email);
    await this.page.getByRole('button', { name: /Send Invitation/i }).click();
  }

  // ── Assertions ───────────────────────────────────────────────────────────

  async assertOnCreateAccountPage() {
    await expect(this.page).toHaveURL(/choose-authentication-method|create-account/);
  }

  async assertAccountCreated(accountName: string) {
    await expect(this.page.getByText(accountName)).toBeVisible({ timeout: 15_000 });
  }

  async assertAccountSettingsVisible() {
    await expect(
      this.page.getByRole('heading', { name: /Account Settings|Settings/i })
    ).toBeVisible();
  }

  async assertTeamMembersVisible() {
    await expect(
      this.page.getByRole('heading', { name: /Team Members|Members/i })
    ).toBeVisible();
  }
}
