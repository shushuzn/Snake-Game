// 死代码分析 v2：检测 window.SnakeX 与裸名 SnakeX 两种引用（ESM 化后裸名可用）
const fs = require('fs');
const path = require('path');

const dir = 'src/modules';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));

const contents = {};
for (const f of files) {
  contents[f] = fs.readFileSync(path.join(dir, f), 'utf8');
}

const gameJs = fs.readFileSync('game.js', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

const dead = [];
const used = [];

for (const f of files) {
  const src = contents[f];
  // 该文件定义的全局名
  const defs = new Set();
  const re = /(?:(?:window|global)\s*\.\s*)(Snake[A-Za-z0-9_]+|AIEngineSelector|AIWorkerBridge)\s*=/g;
  let m;
  while ((m = re.exec(src)) !== null) defs.add(m[1]);
  if (defs.size === 0) continue;

  // 检查每个全局在外部（game.js / index.html / 其他模块）的裸名或 window. 引用
  let refs = 0;
  const refDetails = [];
  for (const g of defs) {
    const inGame = (gameJs.match(new RegExp(`\\b${g}\\b`, 'g')) || []).length;
    const inHtml = (indexHtml.match(new RegExp(`\\b${g}\\b`, 'g')) || []).length;
    if (inGame > 0 || inHtml > 0) {
      refs += inGame + inHtml;
      refDetails.push(`${g}: game.js=${inGame} html=${inHtml}`);
      continue;
    }
    for (const of of files) {
      if (of === f) continue;
      const count = (contents[of].match(new RegExp(`\\b${g}\\b`, 'g')) || []).length;
      if (count > 0) { refs += count; refDetails.push(`${g}: ${of}=${count}`); break; }
    }
  }

  if (refs === 0) dead.push({ file: f, globals: [...defs] });
  else used.push({ file: f, globals: [...defs], refs, refDetails });
}

console.log('=== 死代码模块（定义全局但外部零引用）===');
dead.forEach((d) => console.log(`  ${d.file} -> ${d.globals.join(', ')}`));
console.log(`\n共 ${dead.length} 个死模块（可安全移除或标注）`);

console.log(`\n=== 正常模块 ${used.length} 个（引用方式抽查）===`);
used.filter((u) => ['input.js', 'modes.js', 'render.js', 'ai_engine_selector.js'].includes(u.file))
  .forEach((u) => console.log(`  ${u.file} -> ${u.refDetails.join('; ')}`));
