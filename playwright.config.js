const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'file:///D:/OpenClaw/workspace/80-PROJECTS/Snake-Game/',
    headless: true,
  },
  projects: [
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
  ],
});
