const { test, expect } = require('@playwright/test');

// 存档持久化回归: 局数统计在开局后 +1, 刷新页面后保持不变
// 验证核心数据流 (totalPlays → saveLifetimeStats → localStorage) 跨会话可靠
test('lifetime stats persist across page reload', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto('index.html');
  await page.waitForFunction(() => window.__SNAKE_MODULES_READY === true, null, { timeout: 15000 });

  const before = Number(await page.textContent('#plays'));

  // 开局(首次开始即计入一局)
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(
    () => getComputedStyle(document.getElementById('overlay')).display === 'none',
    null, { timeout: 4000 }
  );
  const afterStart = Number(await page.textContent('#plays'));
  expect(afterStart).toBe(before + 1);

  // 刷新: 局数保持
  await page.reload();
  await page.waitForFunction(() => window.__SNAKE_MODULES_READY === true, null, { timeout: 15000 });
  const persisted = Number(await page.textContent('#plays'));
  expect(persisted).toBe(afterStart);

  // 存储键存在且包含正确局数
  const stored = await page.evaluate(() => {
    const raw = localStorage.getItem('snake-stats-v1');
    return raw ? JSON.parse(raw) : null;
  });
  expect(stored).not.toBeNull();
  expect(stored.totalPlays).toBe(afterStart);

  expect(errors).toEqual([]);
});
