const { test, expect } = require('@playwright/test');

// 回归: 特殊模式切换。
// 曾发现两个真实 bug 使模式切换失败:
//  1) ai_player.js spawnFood 用 isPositionOccupied 判断导致死循环(检查 food 自身)
//  2) game.js updateScoreText 被调用但未定义
test.describe('special mode switching regression', () => {
  for (const mode of ['ai-battle', 'multiplayer', 'spectate', 'daily-challenge']) {
    test(`switch to ${mode} works without deadlock/errors`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

      await page.goto('index.html');
      await page.waitForFunction(() => window.__SNAKE_MODULES_READY === true, null, { timeout: 15000 });

      // 修复前: ai-battle 切换会卡死主线程 (selectOption 超时)
      await page.selectOption('#mode', mode, { timeout: 8000 });
      await page.waitForTimeout(400);

      // 页面可响应 = 主线程未被卡死
      const modeValue = await page.evaluate(() => document.getElementById('mode').value);
      expect(modeValue).toBe(mode);

      // 空格开始, 观察 2.5s
      await page.keyboard.press('Space');
      await page.waitForTimeout(2500);
      expect(await page.evaluate(() => true)).toBe(true);
      expect(errors).toEqual([]);
    });
  }
});
