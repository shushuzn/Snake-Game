const { test, expect } = require('@playwright/test');
test('pause menu shows and buttons work', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('index.html');
  await page.waitForFunction(() => window.__SNAKE_MODULES_READY === true, null, { timeout: 15000 });
  await page.keyboard.press('ArrowRight'); // 开始
  // 等待游戏真正开始(倒计时结束), 避免并行负载下时序脆弱
  await page.waitForFunction(() => getComputedStyle(document.getElementById('overlay')).display === 'none', null, { timeout: 4000 });
  await page.waitForTimeout(300);
  await page.keyboard.press('KeyP'); // 暂停

  // 暂停菜单出现
  await expect(page.locator('#pauseResumeBtn')).toBeVisible();
  await expect(page.locator('#pauseRestartBtn')).toBeVisible();
  await expect(page.locator('#pauseMuteBtn')).toBeVisible();

  // 点继续恢复
  await page.click('#pauseResumeBtn');
  await page.waitForTimeout(500);
  const overlayHidden = await page.evaluate(() => getComputedStyle(document.getElementById('overlay')).display === 'none');
  expect(overlayHidden).toBe(true);

  // 再暂停, 点重开
  await page.keyboard.press('KeyP');
  await page.waitForTimeout(300);
  await page.click('#pauseRestartBtn');
  await page.waitForTimeout(500);
  // 重开后回到开局遮罩(等待开始)
  const restartOverlay = await page.evaluate(() => getComputedStyle(document.getElementById('overlay')).display !== 'none');
  expect(restartOverlay).toBe(true);

  // 再暂停, 点静音(不报错)
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => getComputedStyle(document.getElementById('overlay')).display === 'none', null, { timeout: 4000 });
  await page.waitForTimeout(300);
  await page.keyboard.press('KeyP');
  await page.waitForTimeout(300);
  await page.click('#pauseMuteBtn');
  await page.waitForTimeout(300);
  expect(errors).toEqual([]);
});
