const { test, expect } = require("@playwright/test");

// 结算卡片回归: 死亡后展示本局表现(得分/最高连击/本局食物/DLC)
test('settlement card shows round stats', async ({ page }) => {
  await page.goto('index.html');
  await page.waitForFunction(() => window.__SNAKE_MODULES_READY === true, null, { timeout: 15000 });
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => getComputedStyle(document.getElementById('overlay')).display === 'none', null, { timeout: 4000 });
  // 游走直到死亡(轮询结算卡片出现)
  const t0 = Date.now();
  while (Date.now() - t0 < 15000) {
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(120);
    const hasCard = await page.evaluate(() => (document.getElementById('overlay').textContent || '').includes('最高连击'));
    if (hasCard) break;
  }
  const overlay = await page.evaluate(() => document.getElementById('overlay').textContent || '');
  console.log('SETTLE:', overlay.replace(/\s+/g, ' ').slice(0, 160));
  expect(overlay).toContain('最高连击');
  expect(overlay).toContain('本局食物');
});
