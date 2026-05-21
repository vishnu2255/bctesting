import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import path from 'path';

/**
 * auth.setup.ts
 *
 * Runs ONCE before all regression tests.
 * Logs in via IDIR and saves the session → playwright/.auth/user.json
 * All spec files reuse this saved state — no repeated SSO redirects.
 *
 * IDIR SSO flow (verified from live DOM):
 *   1. Go to test.bcregistry.gov.bc.ca/en-CA/login
 *   2. Click "Login with IDIR" button
 *   3. Redirects to logontest7.gov.bc.ca  (BC Gov SiteMinder)
 *   4. Fill #user  (IDIR Username)  +  #password
 *   5. Click input[value="Continue"]
 *   6. Redirects back to test.bcregistry.gov.bc.ca
 */

const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

setup('Authenticate via IDIR', async ({ page }) => {
  const username = process.env.IDIR_USERNAME;
  const password = process.env.IDIR_PASSWORD;

  if (!username || !password) {
    throw new Error(
      '\n❌  Missing credentials.\n' +
      '    Copy .env.example → .env and set:\n' +
      '      IDIR_USERNAME=your_idir_username\n' +
      '      IDIR_PASSWORD=your_idir_password\n'
    );
  }

  const loginPage = new LoginPage(page);

  console.log('🔐  Navigating to BC Registries login page...');
  await loginPage.goto();
  await loginPage.assertLoginPageLoaded();

  console.log('🖱️   Clicking "Login with IDIR"...');
  await loginPage.clickLoginWithIDIR();

  console.log('⏳  Waiting for IDIR SSO page (logontest7.gov.bc.ca)...');
  await loginPage.waitForIDIRSSOPage();
  await loginPage.assertOnIDIRSSOPage();

  console.log('✏️   Filling IDIR credentials...');
  await loginPage.fillIDIRUsername(username);
  await loginPage.fillIDIRPassword(password);

  console.log('🖱️   Clicking Continue...');
  await loginPage.clickContinue();

  console.log('⏳  Waiting for redirect back to BC Registries...');
  await loginPage.waitForRedirectBackToRegistry();

  // Confirm we're back on the registry
  await expect(page).toHaveURL(/test\.bcregistry\.gov\.bc\.ca/, { timeout: 30_000 });
  console.log(`✅  Login successful! Current URL: ${page.url()}`);

  // Save full browser state for all tests to reuse
  await page.context().storageState({ path: authFile });
  console.log(`✅  Session saved → ${authFile}`);
});
