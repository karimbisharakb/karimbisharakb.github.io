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
