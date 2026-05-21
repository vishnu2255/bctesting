import { Page } from '@playwright/test';
import { ClaudeHealer } from './ClaudeHealer';

/**
 * healedSteps
 *
 * Wraps every step of every flow with self-healing.
 * If a known selector breaks after a release, Claude finds the
 * new one from a screenshot automatically.
 *
 * Usage in a test:
 *   const steps = new HealedSteps(page);
 *   await steps.login.clickIDIR();
 *   await steps.search.searchBusiness('my company');
 */
export class HealedSteps {
  private healer: ClaudeHealer;
  readonly page: Page;

  // Sub-namespaces for each flow
  login: LoginSteps;
  search: SearchSteps;
  incorporate: IncorporateSteps;

  constructor(page: Page) {
    this.page = page;
    this.healer = new ClaudeHealer(page);
    this.login = new LoginSteps(this.healer, page);
    this.search = new SearchSteps(this.healer, page);
    this.incorporate = new IncorporateSteps(this.healer, page);
  }

  printHealLog() {
    this.healer.printHealLog();
  }
}

// ── Login Steps ──────────────────────────────────────────────────────────────

class LoginSteps {
  constructor(private h: ClaudeHealer, private page: Page) {}

  async clickIDIR() {
    await this.h.click(
      'the Login with IDIR button',
      'button:has-text("Login with IDIR")'
    );
  }

  async fillUsername(value: string) {
    await this.h.fill('the IDIR Username input field', value, '#user');
  }

  async fillPassword(value: string) {
    await this.h.fill('the Password input field', value, '#password');
  }

  async clickContinue() {
    await this.h.click('the Continue submit button', 'input[value="Continue"]');
  }
}

// ── Business Search Steps ────────────────────────────────────────────────────

class SearchSteps {
  constructor(private h: ClaudeHealer, private page: Page) {}

  async searchBusiness(query: string) {
    await this.h.fill(
      'the business name or number search text field',
      query,
      '[data-testid="search-textfield"]'
    );
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async clickViewDocuments() {
    await this.h.click(
      'the View documents tab',
      '[role="tab"]:has-text("View documents")'
    );
  }

  async searchDocuments(query: string) {
    await this.h.fill(
      'the Business Name document search field',
      query,
      '[aria-label="Business Name"]'
    );
    await this.page.keyboard.press('Enter');
  }
}

// ── Incorporation Steps ──────────────────────────────────────────────────────

class IncorporateSteps {
  constructor(private h: ClaudeHealer, private page: Page) {}

  async clickMyStaffBusinessRegistry() {
    await this.h.click(
      'the My Staff Business Registry button',
      'button:has-text("My Staff Business Registry")'
    );
  }

  async clickGetStarted() {
    await this.h.click(
      'the Get Started with a BC Based Business link',
      'a:has-text("Get Started with a B.C. Based")'
    );
  }

  async clickIncorporateNow() {
    await this.h.click(
      'the Incorporate Now button',
      'button:has-text("Incorporate Now")'
    );
  }

  async clickNotRightNow() {
    await this.h.click(
      'the Not Right Now button to skip name request',
      'button:has-text("Not Right Now")'
    );
  }

  async fillAddress(value: string) {
    await this.h.fill(
      'the registered office street address field',
      value,
      '#street-address-3'
    );
  }

  async fillEmail(value: string) {
    await this.h.fill(
      'the Email Address input field',
      value,
      '[aria-label="Email Address"]'
    );
  }

  async clickAddPeopleAndRoles() {
    await this.h.click(
      'the Add People and Roles navigation link',
      'a:has-text("Add People and Roles")'
    );
  }

  async clickAddShareClass() {
    await this.h.click(
      'the Add Share Class button',
      'button:has-text("Add Share Class")'
    );
  }

  async fillShareClassName(value: string) {
    await this.h.fill(
      'the Share Class Name input field',
      value,
      '[aria-label="Class Name [Shares]"]'
    );
  }

  async clickFileAndPay() {
    await this.h.click(
      'the File and Pay button',
      'button:has-text("File and Pay")'
    );
  }
}
