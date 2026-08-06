const { test, expect } = require('@playwright/test');

// 每日签到回归: 首次签到发奖, 刷新后今日不可重复领取(状态持久化)
test('daily check-in rewards once and persists across reload', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto('index.html');
  await page.waitForFunction(() => window.__SNAKE_MODULES_READY === true, null, { timeout: 15000 });

  // 首次签到 → 发奖提示
  await page.click('#claimDaily');
  await expect(page.locator('#overlay')).toContainText('签到奖励', { timeout: 2000 });

  // 刷新: 今日已签 → 重复点击应提示已领取(不重复发奖)
  await page.reload();
  await page.waitForFunction(() => window.__SNAKE_MODULES_READY === true, null, { timeout: 15000 });
  await page.click('#claimDaily');
  await expect(page.locator('#overlay')).toContainText('已领取', { timeout: 2000 });

  // 签到状态持久化键存在
  const stored = await page.evaluate(() => {
    const raw = localStorage.getItem('snake-daily-rewards');
    return raw ? JSON.parse(raw) : null;
  });
  expect(stored).not.toBeNull();
  expect(stored.totalClaims).toBeGreaterThanOrEqual(1);

  expect(errors).toEqual([]);
});
