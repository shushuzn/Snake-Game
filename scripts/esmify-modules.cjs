// 批量 ESM 化 src/modules/*.js
// 策略：零侵入。每个模块文件尾部追加:
//   const SnakeX = window.SnakeX;  (按实际 window 全局名)
//   export { SnakeX };
// 保留 window 挂载 → game.js 与测试兼容；export 供 Vite 入口静态导入。
const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, '..', 'src', 'modules');
const SKIP = new Set(['moduleLoader.js', 'moduleRegistry.js', 'manifest.js']); // 旧加载机制，新架构不再加载

const files = fs.readdirSync(MODULES_DIR).filter((f) => f.endsWith('.js') && !SKIP.has(f));

let changed = 0;
for (const file of files) {
  const fp = path.join(MODULES_DIR, file);
  let src = fs.readFileSync(fp, 'utf8');

  // 提取该文件定义的 window.SnakeX / global.SnakeX 全局名（赋值左侧）
  const defs = new Set();
  const re = /(?:(?:window|global)\s*\.\s*)(Snake[A-Za-z0-9_]+|AIWorkerBridge)\s*=/g;
  let m;
  while ((m = re.exec(src)) !== null) defs.add(m[1]);

  if (defs.size === 0) {
    console.log(`SKIP (no window/global def): ${file}`);
    continue;
  }

  // 已 ESM 化的跳过
  if (/\nexport \{/.test(src)) {
    console.log(`SKIP (already ESM): ${file}`);
    continue;
  }

  const lines = [...defs].map((name) => `const ${name} = window.${name};`);
  const exportLine = `export { ${[...defs].join(', ')} };`;
  src = src.replace(/\s*$/, '\n\n') + lines.join('\n') + '\n' + exportLine + '\n';

  fs.writeFileSync(fp, src);
  console.log(`ESM OK: ${file} -> ${[...defs].join(', ')}`);
  changed++;
}

console.log(`\nDone. ${changed} files ESM-ified.`);
