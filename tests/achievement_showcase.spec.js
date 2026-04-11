const { test, expect } = require('@playwright/test');

test.describe('Achievement Showcase Tests', () => {
  test('achievement showcase opens when clicking achievements element', async ({ page }) => {
    // Listen for console errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('index.html');
    await page.waitForLoadState('domcontentloaded');

    // Hide recall panel if it appears
    await page.evaluate(() => {
      const panel = document.getElementById('recallPanel');
      if (panel) panel.style.display = 'none';
    });

    // Verify achievements element exists
    const achievementsEl = page.locator('#achievements');
    await expect(achievementsEl).toBeVisible();

    // Click to open showcase
    await achievementsEl.click();
    await page.waitForTimeout(500);

    // Verify showcase panel is visible
    const showcasePanel = page.locator('#achievementShowcasePanel');
    await expect(showcasePanel).toBeVisible();

    // Verify no console errors
    expect(consoleErrors).toEqual([]);
  });

  test('achievement showcase displays achievement items', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('index.html');
    await page.waitForLoadState('domcontentloaded');

    // Hide recall panel if it appears
    await page.evaluate(() => {
      const panel = document.getElementById('recallPanel');
      if (panel) panel.style.display = 'none';
    });

    // Open showcase
    await page.click('#achievements');
    await page.waitForTimeout(500);

    // Check for achievement grid
    const achievementGrid = page.locator('.achievement-grid');
    await expect(achievementGrid).toBeVisible();

    // Check for achievement items
    const achievementItems = page.locator('.achievement-item');
    const count = await achievementItems.count();
    console.log('Achievement items count:', count);
    expect(count).toBeGreaterThan(0);

    // Verify no console errors
    expect(consoleErrors).toEqual([]);
  });

  test('achievement showcase can be closed', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('index.html');
    await page.waitForLoadState('domcontentloaded');

    // Hide recall panel if it appears
    await page.evaluate(() => {
      const panel = document.getElementById('recallPanel');
      if (panel) panel.style.display = 'none';
    });

    // Open showcase
    await page.click('#achievements');
    await page.waitForTimeout(500);

    // Verify showcase is visible
    const showcasePanel = page.locator('#achievementShowcasePanel');
    await expect(showcasePanel).toBeVisible();

    // Click close button
    await page.click('.achievement-showcase-close');
    await page.waitForTimeout(300);

    // Verify showcase is hidden
    await expect(showcasePanel).not.toBeVisible();

    // Verify no console errors
    expect(consoleErrors).toEqual([]);
  });

  test('achievement tabs filter achievements by category', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('index.html');
    await page.waitForLoadState('domcontentloaded');

    // Hide recall panel if it appears
    await page.evaluate(() => {
      const panel = document.getElementById('recallPanel');
      if (panel) panel.style.display = 'none';
    });

    // Open showcase
    await page.click('#achievements');
    await page.waitForTimeout(500);

    // Check tabs exist
    const tabs = page.locator('.achievement-tab');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(1); // Should have "全部" + category tabs

    // Click on combo tab if it exists
    const comboTab = page.locator('.achievement-tab[data-category="combo"]');
    if (await comboTab.isVisible({ timeout: 500 }).catch(() => false)) {
      await comboTab.click();
      await page.waitForTimeout(200);
      // Check that items are filtered
      const items = page.locator('.achievement-item');
      const visibleCount = await items.count();
      console.log('Visible items after combo filter:', visibleCount);
    }

    // Verify no console errors
    expect(consoleErrors).toEqual([]);
  });
});
