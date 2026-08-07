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
      },
      output: {
        manualChunks(id) {
          // 低频 UI 面板模块拆为独立 chunk（并行加载，不进首屏关键路径）
          // 这些模块全局在 game.js 中零引用，仅 UI 事件按需创建
          const lowFreqModules = [
            'achievement_preview', 'churn_analytics', 'churn_warning',
            'enhanced_newbie_guide', 'enhanced_return_rewards', 'in_game_hints',
            'personalized_achievements', 'quick_start', 'returning_guide',
            'reward_preview', 'season_rewards_preview', 'skill_tree'
          ];
          if (id.includes('/src/modules/')) {
            for (const name of lowFreqModules) {
              if (id.includes(`/src/modules/${name}.js`)) return 'lazy-panels';
            }
          }
          return undefined;
        }
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
