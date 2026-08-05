const { test, expect } = require('@playwright/test');
test('volume slider works and persists', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('index.html');
  await page.waitForFunction(() => window.__SNAKE_MODULES_READY === true, null, { timeout: 15000 });

  // 滑块存在且默认 50
  const initial = await page.inputValue('#volume');
  expect(initial).toBe('50');

  // 拖动到 80
  await page.locator('#volume').fill('80');
  await page.dispatchEvent('#volume', 'input');
  await page.dispatchEvent('#volume', 'change');

  // 音量已应用
  const vol = await page.evaluate(() => {
    const stored = localStorage.getItem('snake-volume-v1');
    return { stored };
  });
  expect(vol.stored).toBe('80');

  // 刷新后保持
  await page.reload();
  await page.waitForFunction(() => window.__SNAKE_MODULES_READY === true, null, { timeout: 15000 });
  const after = await page.inputValue('#volume');
  expect(after).toBe('80');
  expect(errors).toEqual([]);
});
