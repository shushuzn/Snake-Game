const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:4173/',
    headless: true,
  },
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
  ],
});
