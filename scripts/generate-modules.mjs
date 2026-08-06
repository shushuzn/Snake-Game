#!/usr/bin/env node
/**
 * 自动生成 src/main.js 的 ESM 模块 import 列表
 *
 * 使用方式: node scripts/generate-modules.mjs
 *
 * 功能:
 * - 自动发现 src/modules/ 下的所有 .js 文件
 * - 按字母序生成 src/main.js 中的静态 import 语句（Vite 打包入口）
 * - 更新 main.js 的模块导入区（保留首尾固定内容）
 *
 * 背景 (v2.0 现代化重构):
 * - 旧机制: ModuleLoader.bootstrap(window.SNAKE_MODULE_MANIFEST) 动态注入经典脚本
 * - 新机制: Vite + ESM 静态 import，依赖顺序由 import 图保证，无需运行期加载器
 * - manifest.js / moduleLoader.js / moduleRegistry.js 已不再被 index.html 引用，
 *   仅作历史兼容保留。
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
window.SNAKE_LAZY_MODULES = []; // 新机制无懒加载，全部静态 import 立即可用

// 兼容事件：旧机制在模块就绪后派发 snake:modules-ready（perf 测试等依赖）
window.dispatchEvent(new Event('snake:modules-ready'));

// 模块全部就绪后启动（静态 import 保证顺序，无需等待事件）
bootSnakeGame();
`;

// 发现所有模块 (按字母序)
function discoverModules() {
  return readdirSync(MODULES_DIR)
    .filter(f => f.endsWith('.js'))
    .filter(f => !EXCLUDED_MODULES.includes(f))
    .map(f => f.replace(/\.js$/, ''))
    .sort();
}

// 生成 main.js 的模块 import 区
function generateImportSection(modules) {
  const lines = modules.map(m => `import './modules/${m}.js';`);
  return lines.join('\n');
}

// 主函数
function main() {
  const modules = discoverModules();
  console.log(`发现 ${modules.length} 个模块`);

  const content = MAIN_HEAD + generateImportSection(modules) + MAIN_TAIL;
  writeFileSync(MAIN_ENTRY, content, 'utf-8');
  console.log(`✅ 已更新 ${MAIN_ENTRY}`);
  console.log(`   ${modules.length} 个模块已静态导入`);
}

main();
