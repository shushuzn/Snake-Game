const { test, expect } = require('@playwright/test');
test('lazy modules injected after ready', async ({ page }) => {
  await page.goto('index.html');
  await page.waitForFunction(() => window.__SNAKE_MODULES_READY === true, null, { timeout: 15000 });

  // 就绪时: 游戏已启动(overlay 可见), lazy 模块允许尚未注入
  await expect(page.locator('#overlay')).toBeVisible();

  // 轮询等待所有 lazy 模块被注入(后台续注完成)
  await page.waitForFunction(() => {
    const lazy = window.SNAKE_LAZY_MODULES || [];
    const loaded = ModuleLoader.getLoaded();
    return lazy.every((m) => loaded.includes(m));
  }, null, { timeout: 15000 });

  // 抽查关键全局已可用
  const after = await page.evaluate(() => ({
    churnAnalytics: typeof window.SnakeChurnAnalytics,
    skillTree: typeof window.SnakeSkillTree,
    quickStart: typeof window.SnakeQuickStart,
    rewardPreview: typeof window.SnakeRewardPreview,
    aiEngineSelector: typeof window.AIEngineSelector,
    loadedCount: ModuleLoader.getLoaded().length,
  }));
  console.log('LAZY_DIAG', JSON.stringify(after));
  expect(after.churnAnalytics).toBe('object');
  expect(after.skillTree).toBe('object');
  expect(after.quickStart).toBe('object');
  expect(after.rewardPreview).toBe('object');
  expect(after.aiEngineSelector).toBe('object');
  expect(after.loadedCount).toBeGreaterThanOrEqual(66);
});
