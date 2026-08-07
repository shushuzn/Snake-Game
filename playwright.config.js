const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:4173/',
    headless: true,
  },
  // 前端静态服务（vite preview，构建产物）
  webServer: {
    command: 'npx vite build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: true,
    timeout: 60000,
  },
  projects: [
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
        // 此环境系统代理会拦截 localhost 请求导致 502，强制直连
        launchOptions: {
          firefoxUserPrefs: {
            'network.proxy.type': 0,
          },
        },
      },
    },
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      // 联调测试：额外启动 Express 后端（127.0.0.1:8787），仅跑 server_integration.spec.js
      name: 'backend',
      testMatch: /server_integration\.spec\.js/,
      use: { browserName: 'chromium' },
      webServer: [
        {
          command: 'node server/index.js',
          url: 'http://127.0.0.1:8787/api/health',
          reuseExistingServer: true,
          timeout: 15000,
        },
      ],
    },
  ],
});
