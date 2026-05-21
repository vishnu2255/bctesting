# BC Registries — Playwright Regression Suite

Automated UI regression tests for [BC Registries (Test)](https://test.bcregistry.gov.bc.ca/en-CA/login).  
Authentication: **IDIR** (BC Government employees).  
Stack: **Playwright + TypeScript**, with optional **Claude AI** self-healing.

---

## Project Structure

```
bctesting/
├── pages/
│   ├── LoginPage.ts        # IDIR login flow + assertions
│   ├── HomePage.ts         # Post-login home page (search, nav, user menu)
│   ├── AccountPage.ts      # Account settings & team management
│   └── BusinessPage.ts     # Business search & registration flows
│
├── tests/
│   ├── auth/
│   │   ├── auth.setup.ts   # ← Runs ONCE: IDIR login → saves session
│   │   └── login.spec.ts   # Login/logout tests (7 cases)
│   ├── dashboard/
│   │   └── dashboard.spec.ts  # Home page tests (8 cases)
│   ├── account/
│   │   └── account.spec.ts    # Account/profile tests (5 cases)
│   └── business/
│       └── business.spec.ts   # Business flow tests (5 cases)
│
├── helpers/
│   └── ClaudeHealer.ts     # AI self-healing for broken selectors
│
├── playwright/.auth/       # Saved IDIR session (git-ignored)
├── playwright.config.ts
└── .github/workflows/
    └── regression.yml      # Auto-runs on every push / release
```

---

## Quick Start

### 1. Install
```bash
npm install
npx playwright install chromium
```

### 2. Set credentials
```bash
cp .env.example .env
```
Edit `.env`:
```
IDIR_USERNAME=your_idir_username
IDIR_PASSWORD=your_idir_password
```

### 3. Run
```bash
npm test                    # Full regression suite
npm run test:auth           # Auth tests only
npm run test:dashboard      # Dashboard tests only
npm run test:business       # Business tests only
npm run test:headed         # Watch tests run in browser
npm run report              # Open HTML report
```

---

## How it works

### IDIR + Session Reuse

```
auth.setup.ts
  → go to /en-CA/login
  → click "Login with IDIR"
  → fill IDIR credentials on gov SSO page
  → wait for redirect back to bcregistry
  → save session to playwright/.auth/user.json
        ↓
All *.spec.ts tests load that saved session
→ already authenticated, no SSO redirect needed
```

### Self-Healing with Claude

When a selector breaks after a UI change, `ClaudeHealer` screenshots the page and asks Claude to find the right element:

```typescript
const healer = new ClaudeHealer(page);
await healer.doWithHeal(
  'button.old-idir-btn',            // potentially stale selector
  'click',
  'the Login with IDIR button'      // what Claude should look for
);
```

---

## Test Cases (25 total)

| ID | Description | Module |
|----|-------------|--------|
| TC-LOGIN-01 | Login page loads + IDIR button visible | Auth |
| TC-LOGIN-02 | No JS errors on login page | Auth |
| TC-LOGIN-03 | Home loads with saved session | Auth |
| TC-LOGIN-04 | User menu visible after login | Auth |
| TC-LOGIN-05 | Nav bar renders on home | Auth |
| TC-LOGIN-06 | Logout → redirects to /en-CA/login | Auth |
| TC-LOGIN-07 | Unauthenticated access → login redirect | Auth |
| TC-DASH-01 | Home page loads after IDIR login | Dashboard |
| TC-DASH-02 | Title contains "BC Registries" | Dashboard |
| TC-DASH-03 | BC Gov header / nav visible | Dashboard |
| TC-DASH-04 | No 404 or error page | Dashboard |
| TC-DASH-05 | No JS errors on home | Dashboard |
| TC-DASH-06 | Search bar visible | Dashboard |
| TC-DASH-07 | User shown as logged in | Dashboard |
| TC-DASH-08 | URL is on test.bcregistry domain | Dashboard |
| TC-ACCT-01 | Session valid — home accessible | Account |
| TC-ACCT-02 | Account menu opens | Account |
| TC-ACCT-03 | BC Registries account portal reachable | Account |
| TC-ACCT-04 | Header shows logged-in indicator | Account |
| TC-ACCT-05 | No 403/Unauthorized after login | Account |
| TC-BIZ-01 | Home has business navigation | Business |
| TC-BIZ-02 | Business type options shown | Business |
| TC-BIZ-03 | Search returns results | Business |
| TC-BIZ-04 | Empty search doesn't crash app | Business |
| TC-BIZ-05 | Decide-business page reachable | Business |

---

## CI/CD Setup

Tests run automatically on every push, PR, and release.

Add these **GitHub Secrets** (repo → Settings → Secrets → Actions):

| Secret | Value |
|--------|-------|
| `IDIR_USERNAME` | Your IDIR test username |
| `IDIR_PASSWORD` | Your IDIR test password |
| `ANTHROPIC_API_KEY` | For Claude self-healing (optional) |
| `TEST_ACCOUNT_ID` | BC Registries account ID (optional) |

---

## Tips

- **Record new flows**: `npm run codegen` opens a recorder on the login page
- **Traces on failure**: `playwright-report/` has full step-by-step replay with screenshots
- **Add tests**: Add a method to the POM, write a spec in the matching `tests/` folder
