import { Page, Locator } from '@playwright/test';

/**
 * ClaudeHealer
 *
 * When a selector breaks after a release, this helper:
 *   1. Takes a screenshot of the current page
 *   2. Sends it to Claude with a plain-English description
 *   3. Gets back the correct selector
 *   4. Retries the action with the healed selector
 *   5. Writes the fix to a log file so you can update the POM
 *
 * Usage:
 *   const healer = new ClaudeHealer(page);
 *   await healer.click('the Login with IDIR button');
 *   await healer.fill('the business name search field', 'my company');
 */
export class ClaudeHealer {
  private page: Page;
  private apiKey: string;
  private healLog: Array<{ description: string; healedSelector: string; url: string }> = [];

  constructor(page: Page) {
    this.page = page;
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';

    if (!this.apiKey) {
      console.warn('⚠️  ANTHROPIC_API_KEY not set — ClaudeHealer disabled');
    }
  }

  // ── Core: ask Claude to find an element from a screenshot ─────────────────

  private async findSelector(description: string): Promise<string> {
    const screenshot = await this.page.screenshot({ encoding: 'base64' });
    const url = this.page.url();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/png', data: screenshot },
            },
            {
              type: 'text',
              text: `This is a screenshot of the BC Registries web app at: ${url}

Find the element: "${description}"

Reply ONLY with a JSON object, no markdown:
{
  "selector": "the best Playwright selector (prefer getByRole, getByText, getByTestId, or CSS id)",
  "action": "click | fill | check",
  "confidence": "high | medium | low"
}`,
            },
          ],
        }],
      }),
    });

    const data = await response.json();
    const text = data?.content?.[0]?.text || '{}';

    try {
      const result = JSON.parse(text);
      console.log(`🔍  Claude found: "${description}" → ${result.selector} (${result.confidence})`);

      // Log it so you can update the POM later
      this.healLog.push({ description, healedSelector: result.selector, url });

      return result.selector;
    } catch {
      throw new Error(`ClaudeHealer: could not parse response for "${description}"\n${text}`);
    }
  }

  // ── Public actions with auto-heal fallback ────────────────────────────────

  async click(description: string, knownSelector?: string): Promise<void> {
    if (knownSelector) {
      try {
        await this.page.locator(knownSelector).waitFor({ state: 'visible', timeout: 5_000 });
        await this.page.locator(knownSelector).click();
        return;
      } catch {
        console.warn(`⚕️  Selector "${knownSelector}" failed — asking Claude...`);
      }
    }

    const healed = await this.findSelector(description);
    await this.page.locator(healed).click();
  }

  async fill(description: string, value: string, knownSelector?: string): Promise<void> {
    if (knownSelector) {
      try {
        await this.page.locator(knownSelector).waitFor({ state: 'visible', timeout: 5_000 });
        await this.page.locator(knownSelector).fill(value);
        return;
      } catch {
        console.warn(`⚕️  Selector "${knownSelector}" failed — asking Claude...`);
      }
    }

    const healed = await this.findSelector(description);
    await this.page.locator(healed).fill(value);
  }

  async check(description: string, knownSelector?: string): Promise<void> {
    if (knownSelector) {
      try {
        await this.page.locator(knownSelector).waitFor({ state: 'visible', timeout: 5_000 });
        await this.page.locator(knownSelector).check();
        return;
      } catch {
        console.warn(`⚕️  Selector "${knownSelector}" failed — asking Claude...`);
      }
    }

    const healed = await this.findSelector(description);
    await this.page.locator(healed).check();
  }

  // ── Print heal log at end of test ────────────────────────────────────────

  printHealLog(): void {
    if (this.healLog.length === 0) return;

    console.log('\n📋  HEAL LOG — update these selectors in your POMs:\n');
    this.healLog.forEach(({ description, healedSelector, url }) => {
      console.log(`  Page : ${url}`);
      console.log(`  Find : "${description}"`);
      console.log(`  Use  : ${healedSelector}`);
      console.log('');
    });
  }
}
