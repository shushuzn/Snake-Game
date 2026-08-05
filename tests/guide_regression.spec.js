const { test, expect } = require('@playwright/test');

// 回归: 新手引导旧 API 残留(getGamesPlayed/getCurrentLayer)曾导致
// 死亡结算时反复 TypeError。此处覆盖死亡结算 + 教程按钮路径。
test('guide old-API regression: no errors on death flow and tutorial click', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + String(e)));

  await page.goto('index.html');
  await page.waitForFunction(() => window.__SNAKE_MODULES_READY === true, null, { timeout: 15000 });
  await page.keyboard.press('ArrowRight');

  // 乱按触发死亡/结算路径
  const started = Date.now();
  while (Date.now() - started < 8000) {
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(120);
  }

  // 点击教程按钮触发 getCurrentPhase/GUIDE_PHASES 路径
  await page.click('#tutorial');
  await page.waitForTimeout(800);

  // 新 API 可用
  const apiOk = await page.evaluate(() => ({
    hasPhases: typeof window.SnakeGuide.GUIDE_PHASES === 'object',
    phase1: window.SnakeGuide.GUIDE_PHASES.PHASE1_BASIC,
  }));
  expect(apiOk.hasPhases).toBe(true);
  expect(apiOk.phase1).toBe(1);

  expect(errors).toEqual([]);
});
