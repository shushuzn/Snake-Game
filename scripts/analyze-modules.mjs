#!/usr/bin/env node
/**
 * 模块体积分析脚本
 * 
 * 使用方式: node scripts/analyze-modules.mjs
 * 
 * 功能:
 * - 分析每个模块的大小
 * - 估算 gzip 压缩后大小
 * - 识别可以合并的模块
 * - 生成优化建议
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const MODULES_DIR = join(PROJECT_ROOT, 'src/modules');

const GZIP_RATIO = 0.35; // 典型 gzip 压缩比

// 发现所有模块
function discoverModules() {
  return readdirSync(MODULES_DIR)
    .filter(f => f.endsWith('.js'))
    .filter(f => !['moduleRegistry.js', 'moduleLoader.js'].includes(f))
    .sort();
}

// 获取模块大小信息
function getModuleInfo(filename) {
  const filepath = join(MODULES_DIR, filename);
  const stats = statSync(filepath);
  const size = stats.size;
  const gzipSize = Math.round(size * GZIP_RATIO);
  const name = filename.replace('.js', '');
  
  return {
    name,
    filename,
    size,
    gzipSize
  };
}

// 格式化字节大小
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

// 按大小排序
function sortBySize(modules) {
  return modules.sort((a, b) => b.size - a.size);
}

// 分类模块
function categorizeModules(modules) {
  const categories = {
    achievement: modules.filter(m => m.name.startsWith('achievement_')),
    friends: modules.filter(m => m.name.startsWith('friends')),
    return: modules.filter(m => m.name.startsWith('return_')),
    daily: modules.filter(m => m.name.startsWith('daily_')),
    season: modules.filter(m => m.name.startsWith('season')),
    reward: modules.filter(m => m.name.startsWith('reward')),
    mode: modules.filter(m => m.name.startsWith('mode')),
    reset: modules.filter(m => m.name.startsWith('reset_')),
    ui: modules.filter(m => 
      ['toast', 'notifications', 'skin_system', 'particle_system'].includes(m.name)
    ),
    other: modules.filter(m => 
      !['achievement_', 'friends', 'return_', 'daily_', 'season', 'reward', 'mode', 'reset_']
        .some(prefix => m.name.startsWith(prefix)) &&
      !['toast', 'notifications', 'skin_system', 'particle_system'].includes(m.name)
    )
  };
  return categories;
}

// 计算分类总大小
function getCategoryStats(categories) {
  const stats = {};
  for (const [name, modules] of Object.entries(categories)) {
    stats[name] = {
      count: modules.length,
      totalSize: modules.reduce((sum, m) => sum + m.size, 0),
      totalGzip: modules.reduce((sum, m) => sum + m.gzipSize, 0)
    };
  }
  return stats;
}

// 估算合并收益
function estimateBundleSavings(modules, thresholdKB = 20) {
  const bundles = [];
  let currentBundle = { modules: [], size: 0 };
  
  for (const mod of modules) {
    const sizeKB = mod.size / 1024;
    if (sizeKB < thresholdKB && currentBundle.modules.length > 0) {
      currentBundle.size += mod.size;
      currentBundle.modules.push(mod);
    } else {
      if (currentBundle.modules.length >= 2) {
        bundles.push(currentBundle);
      }
      currentBundle = { modules: [mod], size: mod.size };
    }
  }
  
  if (currentBundle.modules.length >= 2) {
    bundles.push(currentBundle);
  }
  
  // 计算潜在节省
  const savings = bundles.reduce((sum, b) => {
    const individualTotal = b.modules.reduce((s, m) => s + m.gzipSize, 0);
    const bundleSize = Math.round(b.size * GZIP_RATIO);
    return sum + (individualTotal - bundleSize);
  }, 0);
  
  return { bundles, savings };
}

function printReport(modules) {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                      Snake Game Module Analysis                        ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // 总览
  const totalSize = modules.reduce((sum, m) => sum + m.size, 0);
  const totalGzip = modules.reduce((sum, m) => sum + m.gzipSize, 0);
  
  console.log('┌──────────────────────────────────────────────────────────────────────────┐');
  console.log('│  OVERVIEW                                                                │');
  console.log('├──────────────────────────────────────────────────────────────────────────┤');
  console.log(`│   Total modules:     ${String(modules.length).padEnd(42)}│`);
  console.log(`│   Total size:        ${formatSize(totalSize).padEnd(42)}│`);
  console.log(`│   Total gzip:        ${formatSize(totalGzip).padEnd(42)}│`);
  console.log('└──────────────────────────────────────────────────────────────────────────┘');
  console.log('');
  
  // 最大模块
  console.log('┌──────────────────────────────────────────────────────────────────────────┐');
  console.log('│  TOP 10 LARGEST MODULES                                                  │');
  console.log('├──────────────────────────────────────────────────────────────────────────┤');
  console.log('│  Module                           Size       Gzip                        │');
  console.log('├──────────────────────────────────────────────────────────────────────────┤');
  
  sortBySize(modules).slice(0, 10).forEach((m, i) => {
    const bar = '█'.repeat(Math.floor(m.size / 5000));
    const line = `│  ${m.name.padEnd(30)} ${formatSize(m.size).padEnd(10)} ${formatSize(m.gzipSize).padEnd(10)} ${bar}`.substring(0, 78) + '│';
    console.log(line);
  });
  console.log('└──────────────────────────────────────────────────────────────────────────┘');
  console.log('');
  
  // 分类统计
  const categories = categorizeModules(modules);
  const categoryStats = getCategoryStats(categories);
  
  console.log('┌──────────────────────────────────────────────────────────────────────────┐');
  console.log('│  CATEGORY BREAKDOWN                                                      │');
  console.log('├──────────────────────────────────────────────────────────────────────────┤');
  console.log('│  Category      Count    Total      Gzip      Avg                         │');
  console.log('├──────────────────────────────────────────────────────────────────────────┤');
  
  for (const [name, stat] of Object.entries(categoryStats)) {
    const avgSize = stat.count > 0 ? formatSize(stat.totalSize / stat.count) : '-';
    console.log(
      `│  ${name.padEnd(12)} ${String(stat.count).padEnd(7)} ${formatSize(stat.totalSize).padEnd(10)} ${formatSize(stat.totalGzip).padEnd(10)} ${avgSize.padEnd(10)}│`
    );
  }
  console.log('└──────────────────────────────────────────────────────────────────────────┘');
  console.log('');
  
  // 小模块（可合并）
  const smallModules = modules.filter(m => m.size < 20 * 1024); // < 20KB
  if (smallModules.length > 0) {
    console.log('┌──────────────────────────────────────────────────────────────────────────┐');
    console.log('│  SMALL MODULES (< 20KB) - CANDIDATES FOR BUNDLING                      │');
    console.log('├──────────────────────────────────────────────────────────────────────────┤');
    
    const { bundles, savings } = estimateBundleSavings(smallModules);
    
    bundles.forEach((bundle, i) => {
      const names = bundle.modules.map(m => m.name).join(', ');
      console.log(`│  Bundle ${i + 1}: ${bundle.modules.length} modules, ${formatSize(bundle.size)} -> ${formatSize(Math.round(bundle.size * GZIP_RATIO))}`);
      console.log(`│    ${names}`.substring(0, 78) + '│');
    });
    
    if (savings > 0) {
      console.log('├──────────────────────────────────────────────────────────────────────────┤');
      console.log(`│  💰 Potential gzip savings: ${formatSize(savings)}`.padEnd(64) + '│');
    }
    console.log('└──────────────────────────────────────────────────────────────────────────┘');
    console.log('');
  }
  
  // 优化建议
  console.log('┌──────────────────────────────────────────────────────────────────────────┐');
  console.log('│  OPTIMIZATION RECOMMENDATIONS                                           │');
  console.log('├──────────────────────────────────────────────────────────────────────────┤');
  
  const largestModules = sortBySize(modules).slice(0, 3);
  if (largestModules.length > 0) {
    console.log('│  1. Largest modules (consider code splitting):');
    largestModules.forEach((m, i) => {
      console.log(`│     ${i + 1}. ${m.name}: ${formatSize(m.size)}`);
    });
  }
  
  const tooSmall = modules.filter(m => m.size < 2 * 1024); // < 2KB
  if (tooSmall.length > 0) {
    console.log(`│  2. Tiny modules (consider merging, ${tooSmall.length} modules < 2KB):`);
    tooSmall.slice(0, 5).forEach(m => {
      console.log(`│     - ${m.name}: ${formatSize(m.size)}`);
    });
  }
  
  console.log('│  3. Use ModuleLoader.load() for lazy loading non-critical modules');
  console.log('│  4. Consider bundling small modules into groups of ~3-5');
  console.log('└──────────────────────────────────────────────────────────────────────────┘');
  console.log('');
}

// 主函数
function main() {
  console.log('Analyzing modules...');
  
  const modules = discoverModules().map(getModuleInfo);
  
  if (modules.length === 0) {
    console.error('No modules found!');
    process.exit(1);
  }
  
  printReport(modules);
  
  // 输出 JSON 格式数据供程序使用
  const jsonOutput = {
    timestamp: new Date().toISOString(),
    totalModules: modules.length,
    totalSize: modules.reduce((sum, m) => sum + m.size, 0),
    totalGzip: modules.reduce((sum, m) => sum + m.gzipSize, 0),
    modules: sortBySize(modules)
  };
  
  console.log('\nJSON output (for programmatic use):');
  console.log(JSON.stringify(jsonOutput, null, 2));
}

main();
