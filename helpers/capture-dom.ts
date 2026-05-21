/**
 * DOM Capture Helper
 * Run: npx ts-node helpers/capture-dom.ts
 *
 * Launches a headed browser, lets you navigate manually,
 * and on each page press  Ctrl+Shift+D  to dump all
 * interactive elements with their selectors to the console.
 *
 * Share the console output here and Claude will write exact tests from it.
 */

import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const ctx = await browser.newContext({
    storageState: 'playwright/.auth/user.json', // reuse your IDIR session
  });
  const page = await ctx.newPage();

  // Start at login
  await page.goto('https://test.bcregistry.gov.bc.ca/en-CA/login');

  console.log('\n🟢  Browser open. Navigate to any page.');
  console.log('    Press Ctrl+Shift+D on any page to dump selectors.\n');

  // Listen for the keyboard shortcut on any page
  await page.exposeFunction('dumpDOM', async () => {});

  page.on('console', msg => {
    if (msg.text().startsWith('[DOM]')) console.log(msg.text());
  });

  // Inject the capture shortcut into every page navigation
  await page.addInitScript(() => {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        const results: string[] = [`\n[DOM] ====== PAGE: ${window.location.href} ======`];

        // Buttons
        document.querySelectorAll('button').forEach((el) => {
          const text = el.textContent?.trim();
          const id = el.id ? `#${el.id}` : '';
          const cls = el.className ? `.${el.className.split(' ')[0]}` : '';
          if (text) results.push(`[DOM] BUTTON  | text="${text}" | ${id || cls}`);
        });

        // Links
        document.querySelectorAll('a[href]').forEach((el) => {
          const text = el.textContent?.trim();
          const href = (el as HTMLAnchorElement).href;
          if (text && text.length < 60) results.push(`[DOM] LINK    | text="${text}" | href="${href}"`);
        });

        // Inputs
        document.querySelectorAll('input, textarea, select').forEach((el) => {
          const input = el as HTMLInputElement;
          const label = document.querySelector(`label[for="${input.id}"]`)?.textContent?.trim();
          const placeholder = input.placeholder;
          const type = input.type || el.tagName;
          const name = input.name;
          results.push(`[DOM] INPUT   | type=${type} | name="${name}" | label="${label || ''}" | placeholder="${placeholder || ''}"`);
        });

        // Headings
        document.querySelectorAll('h1,h2,h3').forEach((el) => {
          results.push(`[DOM] HEADING | ${el.tagName} | "${el.textContent?.trim()}"`);
        });

        results.push('[DOM] ==========================================\n');
        results.forEach(r => console.log(r));
      }
    });
  });

  // Keep browser open until user closes it
  await new Promise(() => {});
})();
