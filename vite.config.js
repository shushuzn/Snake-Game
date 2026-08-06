import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  // 开发服务器配置
  server: {
    port: 5173,
    open: false
  },
  // Worker 配置
  worker: {
    format: 'es'
  }
});
