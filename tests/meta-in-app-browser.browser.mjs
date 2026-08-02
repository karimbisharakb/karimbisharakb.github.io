import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const baseUrl = 'http://127.0.0.1:4173';
const instagramIOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 385.0.0.42.71 (iPhone17,1; iOS 18_5; en_US; en-US; scale=3.00; 1206x2622; 751685238)';
const mobileSafari =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  headless: true,
});

try {
  const instagramContext = await browser.newContext({
    userAgent: instagramIOS,
    viewport: { width: 390, height: 844 },
  });
  const instagramPage = await instagramContext.newPage();
  await instagramPage.goto(baseUrl, { waitUntil: 'networkidle' });

  const banner = instagramPage.locator('#meta-browser-banner');
  await banner.waitFor({ state: 'visible' });
  assert.match(await banner.innerText(), /tap ··· in the top right, then ‘Open in Browser’/);
  assert.equal((await banner.boundingBox()).y, 66);
  assert.equal(
    await instagramPage.locator('.appstore-btn').first().getAttribute('href'),
    'https://apps.apple.com/app/setpr-lift-tracker/id6778556303',
  );

  await banner.getByRole('button', { name: 'Dismiss browser tip' }).click();
  await banner.waitFor({ state: 'hidden' });
  await instagramPage.reload({ waitUntil: 'networkidle' });
  await banner.waitFor({ state: 'hidden' });
  await instagramContext.close();

  const safariContext = await browser.newContext({
    userAgent: mobileSafari,
    viewport: { width: 390, height: 844 },
  });
  const safariPage = await safariContext.newPage();
  await safariPage.goto(baseUrl, { waitUntil: 'networkidle' });
  await safariPage.locator('#meta-browser-banner').waitFor({ state: 'hidden' });
  await safariContext.close();

  console.log('Browser checks passed: Meta banner visibility, dismissal, responsive placement, and App Store link.');
} finally {
  await browser.close();
}
