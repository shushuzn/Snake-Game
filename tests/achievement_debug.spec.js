const { test, expect } = require('@playwright/test');

test.describe('Achievement Showcase Debug', () => {
  test('debug achievement showcase', async ({ page }) => {
    // Listen for ALL console messages
    const messages = [];
    page.on('console', (msg) => {
      messages.push({ type: msg.type(), text: msg.text() });
    });

    // Listen for page errors
    const pageErrors = [];
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto('index.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Check if achievementsEl exists
    const achievementsEl = await page.locator('#achievements');
    const achievementsExists = await achievementsEl.count() > 0;
    console.log('achievementsEl exists:', achievementsExists);

    // Check parent element
    const parentEl = await page.locator('#achievements').locator('..');
    const parentTag = await parentEl.evaluate(el => el.tagName);
    console.log('Parent tag:', parentTag);

    // Try clicking
    console.log('Clicking achievementsEl...');
    await page.click('#achievements');
    await page.waitForTimeout(1000);

    // Check if showcase panel exists in DOM
    const showcaseExists = await page.locator('#achievementShowcasePanel').count();
    console.log('Showcase panel exists in DOM:', showcaseExists);

    // Check errors
    console.log('Page errors:', pageErrors);
    const errors = messages.filter(m => m.type === 'error');
    console.log('Console errors:', errors);

    // Take screenshot for debugging
    // await page.screenshot({ path: 'debug-screenshot.png' });
  });
});
