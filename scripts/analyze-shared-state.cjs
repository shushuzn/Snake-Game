// 分析 game.js 顶层变量的使用分布：找出跨函数共享的核心状态 vs 单函数局部
const fs = require('fs');
const src = fs.readFileSync('game.js', 'utf8');

// 提取顶层 let/const 声明（bootSnakeGame 闭包内，2 空格缩进）
const topVars = [];
const re = /^const ([A-Za-z_$][\w$]*)\s*=|^let ([A-Za-z_$][\w$]*)\s*=/gm;
let m;
while ((m = re.exec(src)) !== null) {
  const name = m[1] || m[2];
  if (!topVars.includes(name)) topVars.push(name);
}

// 统计每个变量被多少函数引用
const fnRe = /^function ([A-Za-z_$][\w$]*)\s*\(/gm;
const fnRanges = [];
while ((m = fnRe.exec(src)) !== null) {
  const fnName = m[1];
  const start = m.index;
  // 找函数体结束：简单启发式——下一个顶层 function/const/let 或文件尾
  const nextRe = /^(function |const |let |import |export |\/\/ ===)/gm;
  nextRe.lastIndex = start + m[0].length;
  let nm = nextRe.exec(src);
  const end = nm ? nm.index : src.length;
  fnRanges.push({ name: fnName, start, end });
}

const usage = {};
for (const v of topVars) {
  usage[v] = 0;
}
for (const f of fnRanges) {
  const body = src.slice(f.start, f.end);
  for (const v of topVars) {
    // 排除声明行本身
    if (new RegExp(`\\b${v}\\b`).test(body)) usage[v]++;
  }
}

// 分类
const sharedByMany = Object.entries(usage).filter(([n, c]) => c >= 8).sort((a, b) => b[1] - a[1]);
const sharedFew = Object.entries(usage).filter(([n, c]) => c >= 3 && c < 8).sort((a, b) => b[1] - a[1]);
const local = Object.entries(usage).filter(([n, c]) => c < 3).sort((a, b) => b[1] - a[1]);

console.log('总顶层变量数:', topVars.length);
console.log('被 >=8 函数共享:', sharedByMany.length, '(高度共享，需保留在核心)');
console.log('被 3-7 函数共享:', sharedFew.length);
console.log('被 <=2 函数引用:', local.length, '(低共享，可随函数迁移)');
console.log('\n=== 高度共享变量 TOP 20 ===');
sharedByMany.slice(0, 20).forEach(([n, c]) => console.log(`  ${n}: ${c} 个函数`));
