const { test, expect } = require('@playwright/test');
test('startup timing & long tasks', async ({ page }) => {
  const longTasks = [];
  await page.addInitScript(() => {
    window.__startup = {
      navStart: performance.now(),
      marks: {},
      longTasks: [],
      firstFrame: null,
    };
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        window.__startup.longTasks.push({
          start: Math.round(e.startTime),
          dur: Math.round(e.duration),
          name: e.name || '',
        });
      }
    }).observe({ type: 'longtask', buffered: true });
    window.addEventListener('snake:modules-ready', () => {
      window.__startup.marks.modulesReady = Math.round(performance.now() - window.__startup.navStart);
      // 下个宏任务 ≈ bootSnakeGame 同步执行完成后
      setTimeout(() => {
        window.__startup.marks.afterBoot = Math.round(performance.now() - window.__startup.navStart);
      }, 0);
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.__startup.marks.firstFrame = Math.round(performance.now() - window.__startup.navStart);
      });
    });
  });
  await page.goto('index.html');
  await page.waitForFunction(() => window.__SNAKE_MODULES_READY === true, null, { timeout: 15000 });
  await page.waitForTimeout(2500);
  const data = await page.evaluate(() => ({
    marks: window.__startup.marks,
    longTasks: window.__startup.longTasks,
    domContentLoaded: Math.round(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd),
  }));
  console.log('PERF_START');
  console.log(JSON.stringify(data, null, 2));
  console.log('PERF_END');

  // 警戒线: 模块就绪应在 1.5s 内 (本地实测 ~200ms; 并行 CI 负载下放宽)
  expect(data.marks.modulesReady).toBeLessThan(1500);
  // bootSnakeGame 同步初始化应远小于 1s
  if (data.marks.afterBoot) {
    expect(data.marks.afterBoot - data.marks.modulesReady).toBeLessThan(500);
  }
});
