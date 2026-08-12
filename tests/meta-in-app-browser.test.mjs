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

  // Counting every apps.apple.com occurrence was brittle: it asserted exactly 2
  // and broke as soon as the pricing section added its two CTAs and the
  // MobileApplication JSON-LD added a downloadUrl. Adding a CTA is not a
  // regression. Sending one to the wrong listing is, so assert that instead.
  const appStoreLinks = page.match(/href="https:\/\/apps\.apple\.com[^"]*"/g) || [];
  assert.ok(
    appStoreLinks.length >= 2,
    `expected the hero and download App Store CTAs, found ${appStoreLinks.length}`,
  );
  for (const link of appStoreLinks) {
    assert.match(link, /^href="https:\/\/apps\.apple\.com\/app\/setpr-lift-tracker\/id6778556303"$/);
  }
});

test('landing page keeps the hero entrance enhancement without a blocking intro', () => {
  assert.match(page, /class="hero-system"/);
  assert.match(page, /function applyMotionEnhancements\(\)/);
  // The entrance runs on GSAP now. Motion.js was dropped in the hero rebuild
  // because GSAP was already loaded and did the same job; guard the removal so
  // a fourth animation library cannot drift back in.
  assert.doesNotMatch(page, /motion@[\d.]+\/dist\/motion\.js/);
});

test('landing page includes GSAP, Lenis, and React Bits-style enhancement hooks', () => {
  assert.match(page, /gsap@3\.15\/dist\/gsap\.min\.js/);
  assert.match(page, /gsap@3\.15\/dist\/ScrollTrigger\.min\.js/);
  assert.match(page, /lenis@[\d.]+\/dist\/lenis\.min\.js/);
  assert.match(page, /function applyGsapScrollEnhancements\(\)/);
  assert.match(page, /function applyAnimeEnhancements\(\)/);
  assert.match(page, /function applyReactBitsEnhancements\(\)/);
  assert.match(page, /reactbits-magnetic/);
  // Anime.js was folded into GSAP in the same rebuild.
  assert.doesNotMatch(page, /animejs\/dist\/bundles\/anime\.umd\.min\.js/);
});

test('landing page uses the barbell still as an accessible cinematic hero', () => {
  assert.match(page, /<source srcset="assets\/hero-barbell\.webp" type="image\/webp"/);
  assert.match(page, /<img id="hero-media"[^>]*src="assets\/hero-barbell\.jpg"/);
  // Intrinsic size is what stops the hero reflowing the fold while it decodes.
  assert.match(page, /<img id="hero-media"[^>]*width="520"[^>]*height="520"/);
  // The <video> carried aria-label; an <img> needs a non-empty alt instead.
  assert.match(page, /<img id="hero-media"[^>]*alt="[^"]+"/);
  // The phone video it replaced is gone, markup and assets both.
  assert.doesNotMatch(page, /<video id="hero-video"/);
  assert.doesNotMatch(page, /hero-phone[^"]*\.(?:mp4|jpg)/);
});
