#!/usr/bin/env node
/**
 * 校验 src/main.js 的 ESM import 列表与磁盘文件系统的一致性。
 *
 * 规则:
 * 1. main.js 中 import 的每个模块,src/modules/ 下必须有对应 .js 文件
 * 2. 磁盘上除基础设施/排除模块外,每个 .js 文件都必须在 main.js 中(无孤儿)
 *
 * 使用: node scripts/check-manifest.js
 * 退出码: 0 通过, 1 失败
 */
const fs = require('fs');
const path = require('path');

const dir = 'src/modules';
// 与 scripts/generate-modules.mjs 的 EXCLUDED_MODULES 保持一致
const EXCLUDED = ['moduleRegistry', 'moduleLoader', 'manifest'];

const mainSrc = fs.readFileSync(path.join('src', 'main.js'), 'utf8');
// 静态 import + 动态 import() 均为有效引用
const staticImports = [...mainSrc.matchAll(/import '\.\/modules\/([^']+)\.js';/g)].map((m) => m[1]);
const lazyImports = [...mainSrc.matchAll(/import\('\.\/modules\/([^']+)\.js'\)/g)].map((m) => m[1]);
const imports = [...new Set([...staticImports, ...lazyImports])];

const onDisk = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.js'))
  .map((f) => f.replace(/\.js$/, ''))
  .filter((n) => !EXCLUDED.includes(n));

const missing = imports.filter((n) => !onDisk.includes(n));
const orphans = onDisk.filter((n) => !imports.includes(n));

let ok = true;
if (missing.length) {
  console.error('main.js imports but file missing:', missing.join(', '));
  ok = false;
}
if (orphans.length) {
  console.error('file exists but not imported in main.js:', orphans.join(', '));
  ok = false;
}
if (ok)
  console.log(
    `main.js imports OK: ${imports.length} modules (static ${staticImports.length} + lazy ${lazyImports.length}), no missing/orphan entries`
  );
process.exit(ok ? 0 : 1);
