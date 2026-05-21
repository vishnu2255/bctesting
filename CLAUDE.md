# Claude Code Instructions — BC Registries Test Automation

This file tells Claude Code how to work with this repo.

## Project Overview
Playwright regression tests for BC Registries (test environment).
Auth: IDIR login via logontest7.gov.bc.ca
Base URL: https://test.bcregistry.gov.bc.ca/en-CA/login

## Repo Structure
```
pages/          ← Page Object Models (one per screen)
tests/          ← Test specs (one folder per feature)
helpers/        ← ClaudeHealer.ts, healedSteps.ts
playwright/.auth/ ← Saved IDIR session (git-ignored)
```

## How to Run Tests
```bash
npx playwright test                          # all tests
npx playwright test tests/auth/             # auth only
npx playwright test --headed                # watch mode
npx playwright test --debug                 # step through
```

## When a Test Fails — Self-Healing Rules

When a selector breaks (element not found), follow this process:

### Step 1 — Check the error
```
Error: locator('button:has-text("Login with IDIR")') not found
```

### Step 2 — Ask Claude Code to fix it
Tell Claude Code:
> "The selector for the IDIR login button broke. 
>  The test is in tests/auth/login.spec.ts
>  The POM is pages/LoginPage.ts
>  Fix the selector."

Claude Code will:
1. Read the POM
2. Check the current DOM (if you paste the HTML or screenshot)
3. Update the selector in the POM
4. Run the test to confirm it passes

### Step 3 — Claude Code command examples

**Fix a broken selector:**
> "The 'Login with IDIR' button selector broke in LoginPage.ts. 
>  Here is the current page HTML: [paste HTML]
>  Update the selector."

**Add a new test from a recording:**
> "Here is a Playwright recording: [paste code]
>  Add assertions and create a proper test in tests/business/
>  following the same pattern as the existing tests."

**Add a new page object:**
> "Create a POM for the Manage Business page.
>  URL: https://test.account.bcregistry.gov.bc.ca/account/123/business
>  Here are the key elements: [paste HTML or screenshot description]"

**Run and fix failing tests:**
> "Run the business search tests and fix any failures."

## Page Object Rules (follow for all new POMs)
1. One file per page/feature in `pages/`
2. Constructor takes `Page` from Playwright
3. Methods: navigation, actions, assertions
4. Assertions use `expect()` from `@playwright/test`
5. Use `getByRole`, `getByTestId`, `getByLabel` over CSS where possible
6. Add a comment above each selector explaining where it comes from

## Self-Healing with ClaudeHealer
Use `helpers/ClaudeHealer.ts` for any step that is likely to change between releases:

```typescript
import { ClaudeHealer } from '../helpers/ClaudeHealer';

const healer = new ClaudeHealer(page);

// Try known selector first, fall back to Claude vision if it fails
await healer.click('the File and Pay button', 'button:has-text("File and Pay")');
await healer.fill('the email address field', 'test@test.com', '#email');
```

## Environment Variables
```
IDIR_USERNAME       BC Gov IDIR username
IDIR_PASSWORD       BC Gov IDIR password
ANTHROPIC_API_KEY   Required for ClaudeHealer self-healing
```

## Adding New Tests — Workflow
1. Record flow: `npx playwright codegen --load-storage=playwright/.auth/user.json <url>`
2. Save to: `tests/recorded/my-flow.spec.ts`
3. Tell Claude Code: "Convert tests/recorded/my-flow.spec.ts into a proper test"
4. Claude Code creates the POM + spec with assertions
5. Run: `npx playwright test tests/<new-test>.spec.ts --headed`
