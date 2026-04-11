const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Snake Game E2E Tests', () => {
  const consoleErrors = [];

  test('page loads without console errors', async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('index.html');
    await page.waitForLoadState('domcontentloaded');

    expect(consoleErrors).toEqual([]);
  });

  test('page title is correct', async ({ page }) => {
    await page.goto('index.html');
    await expect(page).toHaveTitle('贪吃蛇游戏');
  });

  test('achievements UI element exists', async ({ page }) => {
    await page.goto('index.html');
    const achievementsEl = page.locator('#achievements');
    await expect(achievementsEl).toBeVisible();
  });

  test('profileTitle UI element exists', async ({ page }) => {
    await page.goto('index.html');
    const profileTitleEl = page.locator('#profileTitle');
    await expect(profileTitleEl).toBeAttached();
  });

  test('ACHIEVEMENT_KEYS count is correct', () => {
    const gameJsPath = path.join(__dirname, '..', 'game.js');
    const content = fs.readFileSync(gameJsPath, 'utf8');
    const match = content.match(/const ACHIEVEMENT_KEYS = \[([\s\S]*?)\];/);
    expect(match).not.toBeNull();

    const keys = content.match(/const ACHIEVEMENT_KEYS = \[([\s\S]*?)\];/)[1].match(/'[^']+'/g);
    expect(keys.length).toBe(33);
  });

  test('game main panel (canvas) is displayed', async ({ page }) => {
    await page.goto('index.html');
    const canvas = page.locator('#board');
    await expect(canvas).toBeVisible();
  });

  test('skin shop button exists', async ({ page }) => {
    await page.goto('index.html');
    const shopButton = page.locator('#openShop');
    await expect(shopButton).toBeVisible();
  });

  test('achievement gauge displays correctly', async ({ page }) => {
    await page.goto('index.html');
    await page.waitForLoadState('domcontentloaded');

    const gaugeCard = page.locator('.achievement-gauge-card');
    await expect(gaugeCard).toHaveCount(1);

    const gauge = page.locator('.achievement-gauge');
    await expect(gauge).toHaveCount(1);

    const gaugeFill = page.locator('.gauge-fill');
    await expect(gaugeFill).toHaveCount(1);

    const valueEl = page.locator('#achievementGaugeValue');
    await expect(valueEl).toHaveText('0');

    const totalEl = page.locator('#achievementGaugeTotal');
    await expect(totalEl).toHaveText('33');
  });

  test('growth chart elements exist', async ({ page }) => {
    await page.goto('index.html');
    await page.waitForLoadState('domcontentloaded');

    const chartContainer = page.locator('.growth-chart-container');
    await expect(chartContainer).toHaveCount(1);

    const chart = page.locator('#growthChart');
    await expect(chart).toHaveCount(1);

    const emptyState = page.locator('#growthChartEmpty');
    await expect(emptyState).toHaveCount(1);
  });

  test('radar chart elements exist', async ({ page }) => {
    await page.goto('index.html');
    await page.waitForLoadState('domcontentloaded');

    const container = page.locator('.radar-chart-container');
    await expect(container).toHaveCount(1);

    const chart = page.locator('#radarChart');
    await expect(chart).toHaveCount(1);

    const data = page.locator('#radarData');
    await expect(data).toHaveCount(1);

    const empty = page.locator('#radarChartEmpty');
    await expect(empty).toHaveCount(1);
  });
});

  test('season tasks list exists', async ({ page }) => {
    await page.goto('index.html');
    await page.waitForLoadState('domcontentloaded');
    
    // Check season tasks list exists
    const tasksList = page.locator('#seasonTasksList');
    await expect(tasksList).toHaveCount(1);
  });
