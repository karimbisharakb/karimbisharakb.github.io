import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMetaInAppBrowser } from '../assets/meta-in-app-browser.mjs';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const page = fs.readFileSync(path.join(testDirectory, '..', 'index.html'), 'utf8');

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

test('landing page uses a pinned Motion enhancement without a blocking intro', () => {
  assert.match(page, /motion@12\.42\.2\/dist\/motion\.js/);
  assert.match(page, /class="hero-system"/);
  assert.match(page, /function applyMotionEnhancements\(\)/);
});

test('landing page includes GSAP, Anime.js, and React Bits-style enhancement hooks', () => {
  assert.match(page, /gsap@3\.15\/dist\/gsap\.min\.js/);
  assert.match(page, /gsap@3\.15\/dist\/ScrollTrigger\.min\.js/);
  assert.match(page, /animejs\/dist\/bundles\/anime\.umd\.min\.js/);
  assert.match(page, /function applyGsapScrollEnhancements\(\)/);
  assert.match(page, /function applyAnimeEnhancements\(\)/);
  assert.match(page, /function applyReactBitsEnhancements\(\)/);
  assert.match(page, /reactbits-magnetic/);
});
