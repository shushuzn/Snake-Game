#!/usr/bin/env node
/**
 * 校验 src/modules/manifest.js 与磁盘文件系统的一致性。
 *
 * 规则:
 * 1. manifest 中列出的每个模块,src/modules/ 下必须有对应 .js 文件
 * 2. 磁盘上除基础设施/排除模块外,每个 .js 文件都必须在 manifest 中(无孤儿)
 *
 * 使用: node scripts/check-manifest.mjs
 * 退出码: 0 通过, 1 失败
 */
const fs = require('fs');
const path = require('path');

const dir = 'src/modules';
// 与 scripts/generate-modules.mjs 的 EXCLUDED_MODULES 保持一致
const EXCLUDED = ['moduleRegistry', 'moduleLoader', 'manifest', 'ai_worker_bridge'];

const manifestSrc = fs.readFileSync(path.join(dir, 'manifest.js'), 'utf8');
const arrMatch = manifestSrc.match(/\[([\s\S]*?)\]/);
if (!arrMatch) {
  console.error('manifest.js: cannot parse module array');
  process.exit(1);
}
const manifest = arrMatch[1].match(/'([^']+)'/g).map((s) => s.replace(/'/g, ''));

const onDisk = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.js'))
  .map((f) => f.replace(/\.js$/, ''))
  .filter((n) => !EXCLUDED.includes(n));

const missing = manifest.filter((n) => !onDisk.includes(n));
const orphans = onDisk.filter((n) => !manifest.includes(n));

let ok = true;
if (missing.length) {
  console.error('manifest lists but file missing:', missing.join(', '));
  ok = false;
}
if (orphans.length) {
  console.error('file exists but not in manifest:', orphans.join(', '));
  ok = false;
}
if (ok) console.log('manifest OK: ' + manifest.length + ' modules, no missing/orphan entries');
process.exit(ok ? 0 : 1);
