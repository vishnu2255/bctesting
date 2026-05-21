import { Page } from '@playwright/test';

/**
 * ClaudeHealer
 *
 * When a selector breaks after a release, this helper takes a screenshot
 * of the current page and asks Claude to identify the correct selector.
 *
 * Usage:
 *   const healer = new ClaudeHealer(page);
 *   const { selector } = await healer.findElement('the Login with BCeID button');
 *   await page.click(selector);
 */
export class ClaudeHealer {
  private page: Page;
  private apiKey: string;

  constructor(page: Page) {
    this.page = page;
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  ANTHROPIC_API_KEY not set — ClaudeHealer will not work');
    }
  }

  async findElement(description: string): Promise<{ selector: string; action: string }> {
    const screenshot = await this.page.screenshot({ encoding: 'base64' });

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
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: 'image/png', data: screenshot },
              },
              {
                type: 'text',
                text: `This is a screenshot of the BC Registries web application.
                
Find the element described as: "${description}"

Return ONLY a JSON object (no markdown, no extra text):
{
  "selector": "the best CSS or ARIA selector for this element",
  "action": "click | fill | check",
  "confidence": "high | medium | low",
  "notes": "brief explanation"
}`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data?.content?.[0]?.text || '{}';

    try {
      return JSON.parse(text);
    } catch {
      console.error('ClaudeHealer: Could not parse response:', text);
      throw new Error(`ClaudeHealer failed to find: "${description}"`);
    }
  }

  /**
   * Attempt an action with self-healing fallback.
   * First tries the known selector; if it fails, asks Claude for the right one.
   */
  async doWithHeal(
    knownSelector: string,
    action: 'click' | 'fill',
    description: string,
    fillValue?: string
  ) {
    try {
      const element = this.page.locator(knownSelector);
      await element.waitFor({ state: 'visible', timeout: 5000 });

      if (action === 'fill' && fillValue !== undefined) {
        await element.fill(fillValue);
      } else {
        await element.click();
      }
    } catch {
      console.warn(`⚕️  Selector "${knownSelector}" failed — asking Claude for help...`);
      const { selector } = await this.findElement(description);
      console.log(`⚕️  Claude suggests: "${selector}"`);

      const healed = this.page.locator(selector);
      if (action === 'fill' && fillValue !== undefined) {
        await healed.fill(fillValue);
      } else {
        await healed.click();
      }
    }
  }
}
