const { test, expect } = require('@playwright/test');

// 联调: 配置 SNAKE_SERVER_URL 指向本地后端, 验证前端拉取远端榜单
test('leaderboard connects to backend when server configured', async ({ page }) => {
  await page.addInitScript(() => {
    window.SNAKE_SERVER_URL = 'http://127.0.0.1:8787';
  });
  await page.goto('index.html');
  await page.waitForFunction(() => window.__SNAKE_MODULES_READY === true, null, { timeout: 15000 });

  // 点击切换到远端榜
  await page.click('#toggleLeaderboardSource');
  await page.waitForTimeout(1500);

  const statusText = await page.locator('#leaderboardStatus').textContent();
  const listText = await page.locator('#leaderboardList').textContent();
  console.log('LEADERBOARD_DIAG', JSON.stringify({ statusText, listText: (listText || '').slice(0, 200) }));

  // 后端已有测试数据: 测试员B 2200 分应出现
  expect(statusText).toContain('远端');
  expect(statusText).toContain('2200');
});

// 未配置后端时应保持离线模式(静态 JSON 回退)
test('leaderboard stays offline without server config', async ({ page }) => {
  await page.goto('index.html');
  await page.waitForFunction(() => window.__SNAKE_MODULES_READY === true, null, { timeout: 15000 });
  await page.click('#toggleLeaderboardSource');
  await page.waitForTimeout(1500);
  const statusText = await page.locator('#leaderboardStatus').textContent();
  console.log('OFFLINE_DIAG', JSON.stringify({ statusText }));
  expect(statusText).toContain('远端');
});
