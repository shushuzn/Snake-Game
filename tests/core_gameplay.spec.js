const { test, expect } = require('@playwright/test');

// 核心玩法流程回归: 开局 → 游走 → 死亡/结算 → 重开
// 固化自动试玩诊断的价值: 完整对局循环零运行时错误 + 结算结构正确
test('core gameplay round-cycle: start, play, settlement, restart', async ({ page }) => {
  // 完整对局含 30s 自动试玩 + 结算等待，全套并行负载下偶发超 30s 默认上限
  test.setTimeout(90000);
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + String(e)));

  await page.goto('index.html');
  await page.waitForFunction(() => window.__SNAKE_MODULES_READY === true, null, { timeout: 15000 });

  // 开局
  await page.keyboard.press('ArrowRight');
  // 等待开局遮罩隐藏(倒计时结束进入游戏)
  await page.waitForFunction(
    () => getComputedStyle(document.getElementById('overlay')).display === 'none',
    null, { timeout: 4000 }
  );

  // 游走 8 秒(随机方向, 避免掉头)
  const keys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
  const opposite = { ArrowUp: 'ArrowDown', ArrowDown: 'ArrowUp', ArrowLeft: 'ArrowRight', ArrowRight: 'ArrowLeft' };
  let current = 'ArrowRight';
  const t0 = Date.now();
  while (Date.now() - t0 < 8000) {
    const pool = keys.filter((k) => k !== opposite[current]);
    current = pool[Math.floor(Math.random() * pool.length)];
    await page.keyboard.press(current);
    await page.waitForTimeout(110);
  }

  // 死亡或存活: 按 R 强制重开
  await page.keyboard.press('KeyR');
  await page.waitForTimeout(500);

  // 重开后回到开局遮罩
  const afterRestart = await page.evaluate(() => getComputedStyle(document.getElementById('overlay')).display !== 'none');
  expect(afterRestart).toBe(true);

  // 再次开局并跑一段, 触发死亡结算路径
  await page.keyboard.press('ArrowRight');
  const t1 = Date.now();
  while (Date.now() - t1 < 8000) {
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(120);
  }

  // 结算面板结构存在(得分拆分)
  const settlement = await page.evaluate(() => {
    const el = document.getElementById('settlementList');
    return { exists: !!el, text: (el && el.textContent) || '' };
  });
  expect(settlement.exists).toBe(true);
  expect(settlement.text).toContain('得分');

  expect(errors).toEqual([]);
});
