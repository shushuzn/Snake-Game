#!/usr/bin/env node
/**
 * 自动生成 index.html 中的模块 script 标签
 * 
 * 使用方式: node scripts/generate-modules.mjs
 * 
 * 功能:
 * - 自动发现 src/modules/ 下的所有 .js 文件
 * - 生成 <script> 标签
 * - 替换 index.html 中的模块标签
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';

const MODULES_DIR = 'src/modules';
const INDEX_FILE = 'index.html';

// 手动加载的模块 (不参与自动生成)
const EXCLUDED_MODULES = [
  'moduleRegistry.js',  // 注册表基础设施
  'moduleLoader.js'     // 加载器基础设施
];

// 发现所有模块
function discoverModules() {
  const files = readdirSync(MODULES_DIR)
    .filter(f => f.endsWith('.js'))
    .filter(f => !EXCLUDED_MODULES.includes(f))
    .sort();
  return files;
}

// 生成 script 标签
// NOTE: defer 属性可以提升性能但会破坏现有测试
// 如需使用 defer，运行生成后手动添加或修改此函数
const USE_DEFER = false;

function generateScriptTags(modules) {
  const tag = USE_DEFER ? 'defer ' : '';
  return modules.map(m => `    <script ${tag}src="src/modules/${m}"></script>`).join('\n');
}

// 查找 index.html 中的模块区域
function findModuleRegion(html) {
  const start = '<!-- MODULES START -->';
  const end = '<!-- MODULES END -->';
  
  const startIdx = html.indexOf(start);
  const endIdx = html.indexOf(end);
  
  if (startIdx === -1 || endIdx === -1) {
    return null;
  }
  
  return { startIdx, endIdx };
}

// 主函数
function main() {
  const modules = discoverModules();
  console.log(`发现 ${modules.length} 个模块`);
  
  // 生成新内容
  const scriptTags = generateScriptTags(modules);
  const newRegion = `<!-- MODULES START -->\n${scriptTags}\n  <!-- MODULES END -->`;
  
  // 读取 index.html
  let html = readFileSync(INDEX_FILE, 'utf-8');
  
  // 查找模块区域
  const region = findModuleRegion(html);
  
  if (!region) {
    console.error('未找到 <!-- MODULES START --> 和 <!-- MODULES END --> 标记');
    console.log('请在 index.html 中添加:');
    console.log('  <!-- MODULES START -->');
    console.log('  <!-- MODULES END -->');
    process.exit(1);
  }
  
  // 替换
  const before = html.substring(0, region.startIdx + '<!-- MODULES START -->\n'.length);
  const after = html.substring(region.endIdx);
  html = before + scriptTags + '\n  ' + after;
  
  // 写回
  writeFileSync(INDEX_FILE, html, 'utf-8');
  
  console.log(`✅ 已更新 ${INDEX_FILE}`);
  console.log(`   ${modules.length} 个模块已注册`);
}

main();
