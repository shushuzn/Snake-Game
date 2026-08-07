const { test, expect } = require('@playwright/test');

// 贪吃策略 E2E: 利用 __SNAKE_TEST__ 钩子读取食物坐标, 精确引导蛇吃到食物
// 覆盖此前无法自动化的"吃食物加分"路径 (分数增加 + 连击推进)
const DIR_KEYS = { RIGHT: 'ArrowRight', LEFT: 'ArrowLeft', UP: 'ArrowUp', DOWN: 'ArrowDown' };
const OPPOSITE = { ArrowRight: 'ArrowLeft', ArrowLeft: 'ArrowRight', ArrowUp: 'ArrowDown', ArrowDown: 'ArrowUp' };

test('greedy snake eats food (score increases) via test hook', async ({ page }) => {
  // 贪吃循环最多 30s（30s 贪吃窗口 + 循环开销），全套并行负载下偶发超 30s 默认上限
  test.setTimeout(90000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('index.html');
  await page.waitForFunction(() => window.__SNAKE_MODULES_READY === true, null, { timeout: 15000 });

  // 测试钩子可用
  const hookOk = await page.evaluate(() => typeof window.__SNAKE_TEST__?.getState === 'function');
  expect(hookOk).toBe(true);

  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => getComputedStyle(document.getElementById('overlay')).display === 'none', null, { timeout: 4000 });

  // 贪吃循环: 读状态 → 避障决策 → 按键
  const t0 = Date.now();
  let ateFood = false;
  const bodyKeys = new Set();
  while (Date.now() - t0 < 30000 && !ateFood) {
    const st = await page.evaluate(() => window.__SNAKE_TEST__.getState());
    if (!st || !st.snake || !st.food || st.running === false) break;

    const head = st.snake[0];
    const dir = st.direction || { x: 1, y: 0 };
    const current = dir.x > 0 ? 'RIGHT' : dir.x < 0 ? 'LEFT' : dir.y > 0 ? 'DOWN' : 'UP';
    const dx = st.food.x - head.x;
    const dy = st.food.y - head.y;

    // 身体占用格(蛇尾会移动, 排除最后 2 节更宽容)
    bodyKeys.clear();
    for (let i = 2; i < st.snake.length; i++) {
      bodyKeys.add(`${st.snake[i].x},${st.snake[i].y}`);
    }

    // 优先对齐较大的坐标差, 且不选掉头方向、不撞身体
    const primary = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft')
      : (dy > 0 ? 'ArrowDown' : 'ArrowUp');
    const secondary = Math.abs(dx) > Math.abs(dy)
      ? (dy > 0 ? 'ArrowDown' : 'ArrowUp')
      : (dx > 0 ? 'ArrowRight' : 'ArrowLeft');
    const candidates = [primary, secondary].filter((k) => k !== OPPOSITE[DIR_KEYS[current]]);

    // 选择目标格未被身体占用的方向
    const safeMove = candidates.find((k) => {
      const nx = head.x + (k === 'ArrowRight' ? 1 : k === 'ArrowLeft' ? -1 : 0);
      const ny = head.y + (k === 'ArrowDown' ? 1 : k === 'ArrowUp' ? -1 : 0);
      return !bodyKeys.has(`${nx},${ny}`);
    });

    await page.keyboard.press(safeMove || candidates[0] || primary);
    await page.waitForTimeout(80);

    // 吃到食物 → 分数增加
    if (st.score > 0) ateFood = true;
  }

  // 分数或连击推进 = 吃到食物
  const final = await page.evaluate(() => window.__SNAKE_TEST__.getState());
  const scoreGained = (final && final.score > 0) || (final && final.combo > 1);
  expect(scoreGained).toBe(true);
  expect(errors).toEqual([]);
});
