#!/usr/bin/env node
/**
 * 自动生成 src/main.js 的 ESM 模块 import 列表
 *
 * 使用方式: node scripts/generate-modules.mjs
 *
 * 功能:
 * - 自动发现 src/modules/ 下的所有 .js 文件
 * - 静态模块（62 个）：生成 src/main.js 的静态 import（Vite 打包进首屏主 bundle）
 * - 懒加载模块（13 个）：生成动态 import() 预加载段（空闲时后台加载，独立 chunk）
 *
 * 背景 (v2.0 现代化重构):
 * - 旧机制: ModuleLoader.bootstrap(window.SNAKE_MODULE_MANIFEST) 动态注入经典脚本
 * - 新机制: Vite + ESM 静态 import，依赖顺序由 import 图保证，无需运行期加载器
 * - 懒加载: 未接线/低频模块（game.js 零引用）动态 import() 按需加载，减小首屏
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';

const MODULES_DIR = 'src/modules';
const MAIN_ENTRY = 'src/main.js';

// 不参与入口的基础设施文件 (旧加载机制，新架构不再加载)
const EXCLUDED_MODULES = [
  'moduleRegistry.js',  // 注册表基础设施（旧机制）
  'moduleLoader.js',    // 加载器基础设施（旧机制）
  'manifest.js'         // 清单自身（旧机制）
];

// 懒加载模块（动态 import()）：game.js 零引用、仅保留产品价值的历史功能/未接线模块。
// 这些模块不并入首屏主 bundle，由 main.js 空闲时后台预加载（独立 chunk）。
const LAZY_MODULES = [
  'achievement_preview',
  'ai_engine_selector',
  'churn_analytics',
  'churn_warning',
  'enhanced_newbie_guide',
  'enhanced_return_rewards',
  'in_game_hints',
  'personalized_achievements',
  'quick_start',
  'returning_guide',
  'reward_preview',
  'season_rewards_preview',
  'skill_tree'
];

const MAIN_HEAD = `// ============================================================
// Snake Game — ESM 入口
// 由 Vite 打包。静态 import 全部模块（依赖顺序由 import 图保证），
// 然后启动游戏。取代旧的 ModuleLoader 动态脚本注入机制。
// 本文件的模块 import 区由 scripts/generate-modules.mjs 自动生成。
// ============================================================

`;

const MAIN_TAIL = `
// ---- 游戏主逻辑 ----
import { bootSnakeGame } from '../game.js';

// 兼容标志：旧 ModuleLoader 机制在模块就绪后设置，测试依赖此语义
window.__SNAKE_MODULES_READY = true;
window.SNAKE_LAZY_MODULES = []; // 兼容：原懒加载模块现由下方异步预加载接管

// 兼容事件：旧机制在模块就绪后派发 snake:modules-ready（perf 测试等依赖）
window.dispatchEvent(new Event('snake:modules-ready'));

// 模块全部就绪后启动（静态 import 保证顺序，无需等待事件）
bootSnakeGame();

// ---- 低频/未接线模块异步预加载（不阻塞首屏，空闲时后台加载）----
// 这些模块在 game.js 中零引用，仅保留产品价值（历史功能/未来接线）。
// 静态 import 会并入首屏关键路径；改为动态 import() 后由浏览器单独拉取，
// 首屏 bundle 显著减小。模块加载后自动挂载 window 全局，运行期按需可用。
// 注意：必须使用字面量路径（变量形式动态 import 无法被 Rollup 静态分析，
// 生产构建中会以运行时相对路径请求 src/modules/，导致 404）。
function preloadLazyModules() {
  // 空闲时后台加载，单模块失败不阻断（保留 window 兼容性检查的降级路径）
  return Promise.allSettled([
`;

const MAIN_LAZY_TAIL = `  ]);
}

if ('requestIdleCallback' in window) {
  requestIdleCallback(() => { preloadLazyModules(); }, { timeout: 3000 });
} else {
  setTimeout(() => { preloadLazyModules(); }, 500);
}
`;

// 发现所有模块 (按字母序)
function discoverModules() {
  return readdirSync(MODULES_DIR)
    .filter(f => f.endsWith('.js'))
    .filter(f => !EXCLUDED_MODULES.includes(f))
    .map(f => f.replace(/\.js$/, ''))
    .sort();
}

// 生成静态 import 区
function generateStaticImports(modules) {
  return modules.map(m => `import './modules/${m}.js';`).join('\n');
}

// 生成动态 import 区（懒加载模块）
function generateLazyImports() {
  return LAZY_MODULES.map(m => `    import('./modules/${m}.js')`).join(',\n');
}

// 主函数
function main() {
  const all = discoverModules();
  const lazy = new Set(LAZY_MODULES);
  const staticModules = all.filter(m => !lazy.has(m));
  console.log(`发现 ${all.length} 个模块（静态 ${staticModules.length} + 懒加载 ${LAZY_MODULES.length}）`);

  const content =
    MAIN_HEAD +
    generateStaticImports(staticModules) +
    MAIN_TAIL +
    generateLazyImports() +
    MAIN_LAZY_TAIL;

  writeFileSync(MAIN_ENTRY, content, 'utf-8');
  console.log(`✅ 已更新 ${MAIN_ENTRY}`);
  console.log(`   静态导入 ${staticModules.length} 个 + 动态预加载 ${LAZY_MODULES.length} 个`);
}

main();
