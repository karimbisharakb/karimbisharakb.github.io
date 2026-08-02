# Meta In-App Browser Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a dismissible Instagram-style browser-opening tip only inside Instagram and Facebook in-app browsers, while preserving direct App Store links.

**Architecture:** Keep the banner markup and dark-theme styling in `index.html`, where the rest of the landing page lives. Put the pure UA detector in a tiny `.mjs` ES module so the browser behavior and Node regression test share the exact same implementation; `index.html` imports it and controls visibility plus session dismissal.

**Tech Stack:** Static HTML/CSS, browser JavaScript ES modules, Node.js built-in test runner.

## Global Constraints

- Keep both existing `https://apps.apple.com/app/setpr-lift-tracker/id6778556303` anchors unchanged.
- Detect only case-insensitive `Instagram`, `FBAN`, and `FBAV` UA markers.
- Show no notice in regular Safari or Chrome.
- Use the shared copy: “For the best experience, tap ··· in the top right, then ‘Open in Browser’.”
- Persist dismissal only for the current session with `sessionStorage`.
- Preserve the landing page’s dark palette, responsive layout, and reduced-motion behavior.

---

### Task 1: Add the testable Meta in-app-browser detector

**Files:**
- Create: `assets/meta-in-app-browser.mjs`
- Create: `tests/meta-in-app-browser.test.mjs`

**Interfaces:**
- Produces: `isMetaInAppBrowser(userAgent = ''): boolean`, exported from `assets/meta-in-app-browser.mjs`.
- Consumes: a raw user-agent string; it has no DOM dependencies.

- [ ] **Step 1: Write the failing test**

Create `tests/meta-in-app-browser.test.mjs`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { isMetaInAppBrowser } from '../assets/meta-in-app-browser.mjs';

const instagramIOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 385.0.0.42.71 (iPhone17,1; iOS 18_5; en_US; en-US; scale=3.00; 1206x2622; 751685238)';
const facebookIOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/530.0.0.51.70;FBDV/iPhone17,1;FBMD/iPhone;FBSN/iOS;FBSV/18.5;FBID/phone;FBOP/5]';
const facebookAndroid =
  'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.0.0 Mobile Safari/537.36 [FBAN/FB4A;FBAV/549.0.0.61.62;]';
const mobileSafari =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';
const chromeIOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/136.0.7103.48 Mobile/15E148 Safari/604.1';

test('detects current Meta in-app-browser user-agent markers', () => {
  assert.equal(isMetaInAppBrowser(instagramIOS), true);
  assert.equal(isMetaInAppBrowser(facebookIOS), true);
  assert.equal(isMetaInAppBrowser(facebookAndroid), true);
});

test('does not detect regular iOS browsers', () => {
  assert.equal(isMetaInAppBrowser(mobileSafari), false);
  assert.equal(isMetaInAppBrowser(chromeIOS), false);
  assert.equal(isMetaInAppBrowser(), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/meta-in-app-browser.test.mjs`

Expected: FAIL because `../assets/meta-in-app-browser.mjs` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `assets/meta-in-app-browser.mjs`:

```js
export function isMetaInAppBrowser(userAgent = '') {
  return /Instagram|FBAN|FBAV/i.test(userAgent);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/meta-in-app-browser.test.mjs`

Expected: PASS with two passing subtests and zero failures.

- [ ] **Step 5: Commit**

```bash
git add assets/meta-in-app-browser.mjs tests/meta-in-app-browser.test.mjs
git commit -m "test: cover Meta in-app browser detection"
```

### Task 2: Render and dismiss the in-app-browser guidance banner

**Files:**
- Modify: `index.html:7-435` (banner styles)
- Modify: `index.html:437-463` (banner markup)
- Modify: `index.html:704-800` (module import, detection, dismissal)

**Interfaces:**
- Consumes: `isMetaInAppBrowser(navigator.userAgent)` from `./assets/meta-in-app-browser.mjs`.
- Consumes: session storage key `setpr-meta-browser-banner-dismissed`.
- Produces: a visible `#meta-browser-banner` only when the detector returns true and no dismissal key exists.

- [ ] **Step 1: Write the failing page-level contract test**

Append this test to `tests/meta-in-app-browser.test.mjs`:

```js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const page = fs.readFileSync(path.join(testDirectory, '..', 'index.html'), 'utf8');

test('landing page includes the accessible Meta browser fallback and keeps the App Store links', () => {
  assert.match(page, /id="meta-browser-banner"/);
  assert.match(page, /role="status"/);
  assert.match(page, /tap ··· in the top right, then ‘Open in Browser’/);
  assert.match(page, /aria-label="Dismiss browser tip"/);
  assert.match(page, /sessionStorage\.setItem\('setpr-meta-browser-banner-dismissed', 'true'\)/);
  assert.equal(
    (page.match(/https:\/\/apps\.apple\.com\/app\/setpr-lift-tracker\/id6778556303/g) || []).length,
    2,
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/meta-in-app-browser.test.mjs`

Expected: FAIL on the missing `id="meta-browser-banner"` assertion.

- [ ] **Step 3: Write minimal implementation**

Add the following CSS before the reduced-motion media query in `index.html`:

```css
  .meta-browser-banner { position: fixed; top: 76px; left: 50%; z-index: 950; width: min(560px, calc(100% - 28px)); transform: translateX(-50%); display: none; align-items: center; gap: 12px; padding: 12px 14px 12px 16px; background: rgba(18,18,19,.96); border: 1px solid rgba(230,57,70,.42); border-radius: 14px; box-shadow: 0 18px 42px rgba(0,0,0,.36); color: #f5f5f5; }
  .meta-browser-banner.is-visible { display: flex; }
  .meta-browser-banner .menu-cue { flex: none; color: var(--red); font-size: 21px; font-weight: 800; letter-spacing: 1px; transform: translateY(-2px); }
  .meta-browser-banner p { flex: 1; font-size: 13px; line-height: 1.4; }
  .meta-browser-banner button { width: 30px; height: 30px; flex: none; border: 0; border-radius: 8px; background: transparent; color: var(--muted); cursor: pointer; font: inherit; font-size: 21px; line-height: 1; }
  .meta-browser-banner button:hover, .meta-browser-banner button:focus-visible { background: var(--surface-2); color: #fff; outline: none; }
  @media (max-width: 520px) { .meta-browser-banner { top: 66px; align-items: flex-start; } .meta-browser-banner p { font-size: 12.5px; } }
```

Add this markup immediately after the loader in `index.html`:

```html
  <aside id="meta-browser-banner" class="meta-browser-banner" role="status" aria-label="Open in browser tip" hidden>
    <span class="menu-cue" aria-hidden="true">··· ↗</span>
    <p>For the best experience, tap ··· in the top right, then ‘Open in Browser’.</p>
    <button type="button" aria-label="Dismiss browser tip">×</button>
  </aside>
```

Change the existing final script tag to `<script type="module">`, add the import first inside it, then add the banner logic before the loader block:

```js
      import { isMetaInAppBrowser } from './assets/meta-in-app-browser.mjs';

      const metaBanner = document.getElementById('meta-browser-banner');
      const metaBannerDismissalKey = 'setpr-meta-browser-banner-dismissed';
      const hasDismissedMetaBanner = sessionStorage.getItem(metaBannerDismissalKey) === 'true';

      if (isMetaInAppBrowser(navigator.userAgent) && !hasDismissedMetaBanner) {
        metaBanner.hidden = false;
        metaBanner.classList.add('is-visible');
      }

      metaBanner.querySelector('button').addEventListener('click', () => {
        metaBanner.classList.remove('is-visible');
        metaBanner.hidden = true;
        sessionStorage.setItem(metaBannerDismissalKey, 'true');
      });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/meta-in-app-browser.test.mjs`

Expected: PASS with three passing subtests and zero failures.

- [ ] **Step 5: Verify responsive visual behavior**

Run: `python3 -m http.server 4173 --directory .`

Open `http://localhost:4173` with an Instagram iOS UA override and a mobile viewport. Confirm the banner appears beneath the navigation, wraps without overlap, and the direct App Store anchor still points to the Apple URL. Repeat with a Safari iOS UA override and confirm the banner is absent.

- [ ] **Step 6: Commit**

```bash
git add index.html tests/meta-in-app-browser.test.mjs
git commit -m "feat: guide Meta in-app browser visitors"
```

### Task 3: Run the complete regression and source checks

**Files:**
- Verify only: `index.html`, `assets/meta-in-app-browser.mjs`, `tests/meta-in-app-browser.test.mjs`

**Interfaces:**
- Consumes: completed production files and the three subtests.
- Produces: fresh evidence that detection, fallback markup, direct anchors, and static-page syntax are intact.

- [ ] **Step 1: Run the detector and page contract suite**

Run: `node --test tests/meta-in-app-browser.test.mjs`

Expected: PASS with three passing subtests and zero failures.

- [ ] **Step 2: Verify direct App Store anchor count and HTML module loading**

Run:

```bash
rg -n 'https://apps\.apple\.com/app/setpr-lift-tracker/id6778556303|<script type="module">|meta-browser-banner' index.html
```

Expected: two App Store URL matches, one module script tag, and markup/style/script references for `meta-browser-banner`.

- [ ] **Step 3: Inspect the final diff**

Run: `git diff HEAD~2..HEAD -- index.html assets/meta-in-app-browser.mjs tests/meta-in-app-browser.test.mjs`

Expected: only the detector, regression tests, and banner implementation; no App Store URL replacement.
