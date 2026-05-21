import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import path from 'path';

/**
 * auth.setup.ts
 *
 * Runs ONCE before all tests.
 * Logs in with IDIR and saves the browser session to playwright/.auth/user.json.
 * All regression tests reuse this saved session — no repeated SSO redirects.
 *
 * Setup:
 *   1. Copy .env.example → .env
 *   2. Set IDIR_USERNAME and IDIR_PASSWORD
 *   3. Run: npx playwright test  (setup runs automatically first)
 */

const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

setup('Authenticate via IDIR', async ({ page }) => {
  const username = process.env.IDIR_USERNAME;
  const password = process.env.IDIR_PASSWORD;

  if (!username || !password) {
    throw new Error(
      '\n❌  Missing IDIR credentials.\n' +
      '    Copy .env.example → .env and set:\n' +
      '      IDIR_USERNAME=your_idir_username\n' +
      '      IDIR_PASSWORD=your_idir_password\n'
    );
  }

  const loginPage = new LoginPage(page);

  console.log('🔐  Logging in with IDIR...');
  await loginPage.loginWithIDIR(username, password);

  // Verify we landed on the home page
  await expect(page).toHaveURL(
    /test\.bcregistry\.gov\.bc\.ca\/en-CA/,
    { timeout: 30_000 }
  );

  console.log('✅  IDIR login successful, saving session...');

  // Save the full browser state (cookies, localStorage, sessionStorage)
  await page.context().storageState({ path: authFile });

  console.log(`✅  Session saved → ${authFile}`);
});
