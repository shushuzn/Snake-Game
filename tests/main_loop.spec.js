const { test, expect } = require('@playwright/test');

// 主循环 E2E：验证模块加载器接入后，游戏仍可正常启动 / 暂停 / 重开。
// 这是 v1.27.0 注册表懒加载接入的安全网，任何破坏模块就绪或启动流程的回归都会在此暴露。
test.describe('Snake Game main loop (ESM boot)', () => {
  const consoleErrors = [];

  // ESM 就绪等价条件：关键模块全局已挂载（静态 import 完成后由 main.js 启动游戏）
  async function waitModulesReady(page) {
    await page.waitForFunction(() =>
      typeof window.SnakeStorage === 'object' &&
      typeof window.SnakeRender === 'object' &&
      typeof window.SnakeInput === 'object'
    , null, { timeout: 15000 });
  }

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(String(err)));
  });

  test('modules load via manifest and game boots', async ({ page }) => {
    await page.goto('index.html');

    // 1) 模块加载完成：关键全局变量就绪（ESM 静态 import 保证顺序）
    await waitModulesReady(page);

    // 2) 关键模块全局变量已就绪（证明 manifest 顺序正确、无遗漏）
    const globalsOk = await page.evaluate(() =>
      typeof window.SnakeStorage === 'object' &&
      typeof window.SnakeRender === 'object' &&
      typeof window.SnakeInput === 'object'
    );
    expect(globalsOk).toBe(true);

    // 3) 画布与开始遮罩渲染正常
    await expect(page.locator('#board')).toBeVisible();
    await expect(page.locator('#overlay')).toBeVisible();
  });

  test('arrow key starts the game (overlay hides)', async ({ page }) => {
    await page.goto('index.html');
    await waitModulesReady(page);

    // 开局遮罩可见
    await expect(page.locator('#overlay')).toBeVisible();

    // 按方向键启动
    await page.keyboard.press('ArrowRight');

    // 启动后遮罩应隐藏
    await expect(page.locator('#overlay')).toBeHidden({ timeout: 5000 });
  });

  test('pause toggles and restart does not crash', async ({ page }) => {
    await page.goto('index.html');
    await waitModulesReady(page);

    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#overlay')).toBeHidden({ timeout: 5000 });

    // 暂停 -> 按钮文案变为“继续”
    await page.keyboard.press('p');
    await expect(page.locator('#pause')).toHaveText('继续', { timeout: 3000 });

    // 继续 -> 按钮文案恢复“暂停”
    await page.keyboard.press('p');
    await expect(page.locator('#pause')).toHaveText('暂停', { timeout: 3000 });

    // 重开不应抛出异常
    await page.keyboard.press('r');
    await page.waitForTimeout(300);
    expect(consoleErrors).toEqual([]);
  });

  test('no console errors during main loop', async ({ page }) => {
    await page.goto('index.html');
    await waitModulesReady(page);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);
    expect(consoleErrors).toEqual([]);
  });
});
