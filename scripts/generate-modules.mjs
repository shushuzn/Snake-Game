#!/usr/bin/env node
/**
 * 自动生成 src/modules/manifest.js 模块清单
 *
 * 使用方式: node scripts/generate-modules.mjs
 *
 * 功能:
 * - 自动发现 src/modules/ 下的所有 .js 文件
 * - 按字母序生成 window.SNAKE_MODULE_MANIFEST 数组
 * - 替换 manifest.js 中的模块清单
 *
 * 背景 (v1.27.0):
 * - 原先生成 index.html 的 <script> 标签；重构后 index.html 不再持有模块标签，
 *   模块加载由 ModuleLoader.bootstrap(manifest) 按清单注入。
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';

const MODULES_DIR = 'src/modules';
const MANIFEST_FILE = 'src/modules/manifest.js';

// 不参与清单的基础设施文件 (由 index.html 显式引用，或为清单自身)
const EXCLUDED_MODULES = [
  'moduleRegistry.js',  // 注册表基础设施
  'moduleLoader.js',    // 加载器基础设施
  'manifest.js',        // 清单自身
  // ai_worker_bridge.js — 功能未完成: import.meta 在经典脚本下 SyntaxError,
  // 引用的 workers/ai_worker.js 不存在; ai_engine_selector 已对其做存在性检查并优雅降级。
  // 未来若完成 Worker 通道，再从排除清单移出。
  'ai_worker_bridge.js'
];

// 发现所有模块 (按字母序)
function discoverModules() {
  return readdirSync(MODULES_DIR)
    .filter(f => f.endsWith('.js'))
    .filter(f => !EXCLUDED_MODULES.includes(f))
    .map(f => f.replace(/\.js$/, ''))
    .sort();
}

// 懒加载模块 (v1.28.0) — 不阻塞游戏启动，由 bootstrap 在就绪后后台续注。
// 选择依据: 全局不被 game.js 引用、不被其他模块加载期引用。
// 新增候选时运行 node scripts/analyze-lazy-candidates.mjs 辅助判断(如保留)。
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

// 生成 manifest.js 内容
function generateManifestContent(modules) {
  const list = modules.map(m => `  '${m}'`).join(',\n');
  const lazy = LAZY_MODULES.map(m => `  '${m}'`).join(',\n');
  return `// 模块清单 — 单一事实来源 (single source of truth)
//
// 本文件由 scripts/generate-modules.mjs 自动生成，请勿手动编辑。
// 新增 / 删除模块后运行:
//   node scripts/generate-modules.mjs
// ModuleLoader.bootstrap() 会按此顺序注入（经典脚本，兼容 file:// 直接打开）。
window.SNAKE_MODULE_MANIFEST = [
${list}
];

// 懒加载模块 (v1.28.0): 不阻塞游戏启动，就绪后由 bootstrap 后台续注。
window.SNAKE_LAZY_MODULES = [
${lazy}
];
`;
}

// 主函数
function main() {
  const modules = discoverModules();
  console.log(`发现 ${modules.length} 个模块`);

  writeFileSync(MANIFEST_FILE, generateManifestContent(modules), 'utf-8');
  console.log(`✅ 已更新 ${MANIFEST_FILE}`);
  console.log(`   ${modules.length} 个模块已注册`);
}

main();
