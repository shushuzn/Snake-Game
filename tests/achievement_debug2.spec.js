const { test, expect } = require('@playwright/test');

test.describe('Achievement Showcase Debug 2', () => {
  test('check achievement items generation', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('index.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Click achievements
    await page.click('#achievements');
    await page.waitForTimeout(500);

    // Check if panel is visible
    const panel = page.locator('#achievementShowcasePanel');
    const isVisible = await panel.isVisible();
    console.log('Panel visible:', isVisible);

    // Check if body has content
    const body = page.locator('.achievement-showcase-body');
    const bodyContent = await body.innerHTML();
    console.log('Body content length:', bodyContent.length);
    console.log('Body has achievement-grid:', bodyContent.includes('achievement-grid'));
    console.log('Body has achievement-item:', bodyContent.includes('achievement-item'));

    // Check achievement items count
    const items = page.locator('.achievement-item');
    const count = await items.count();
    console.log('Achievement items count:', count);

    // Log errors
    console.log('Console errors:', consoleErrors);

    expect(consoleErrors).toEqual([]);
  });
});
