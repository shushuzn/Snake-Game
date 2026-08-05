const { test, expect } = require('@playwright/test');

test.describe('Sound module', () => {
  test('SnakeSound API available and play() does not throw', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto('index.html');
    await page.waitForFunction(() => window.__SNAKE_MODULES_READY === true, null, { timeout: 15000 });

    const api = await page.evaluate(() => ({
      hasModule: typeof window.SnakeSound === 'object',
      hasPlay: typeof (window.SnakeSound && window.SnakeSound.play) === 'function',
      hasSetEnabled: typeof (window.SnakeSound && window.SnakeSound.setEnabled) === 'function',
    }));
    expect(api.hasModule).toBe(true);
    expect(api.hasPlay).toBe(true);
    expect(api.hasSetEnabled).toBe(true);

    // 所有音效类型 play 不抛错
    const types = ['eat', 'bonus', 'hit', 'mission', 'achievement', 'click', 'levelUp', 'unknown_fallback'];
    const playOk = await page.evaluate((ts) => {
      try {
        ts.forEach((t) => window.SnakeSound.play(t));
        return true;
      } catch (e) {
        return String(e);
      }
    }, types);
    expect(playOk).toBe(true);

    // 静音后仍不抛错
    const muteOk = await page.evaluate(() => {
      try {
        window.SnakeSound.setEnabled(false);
        window.SnakeSound.play('eat');
        window.SnakeSound.setEnabled(true);
        window.SnakeSound.setVolume(0.8);
        return true;
      } catch (e) {
        return String(e);
      }
    });
    expect(muteOk).toBe(true);
    expect(errors).toEqual([]);
  });
});
