#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$repo_root"

echo "[1/5] syntax check on tracked JS files (ESM-aware)"
# ESM 文件: game.js / src/ 下全部 .js（package.json 未声明 type:module，须经 STDIN 按 ESM 解析）
for f in $(git ls-files '*.js'); do
  [ -f "$f" ] || continue  # 跳过已删除（工作区待提交）文件
  case "$f" in
    game.js|src/*)
      cat "$f" | node --input-type=module --check >/dev/null 2>&1 || { echo "ESM syntax error: $f"; exit 1; } ;;
    *.cjs|scripts/*.cjs)
      node --check "$f" >/dev/null 2>&1 || { echo "CJS syntax error: $f"; exit 1; } ;;
    *.mjs)
      node --check "$f" >/dev/null 2>&1 || { echo "MJS syntax error: $f"; exit 1; } ;;
  esac
done
echo "  all JS files syntax OK"

echo "[2/5] index.html + ESM entry resource reference check"
rg -n "styles.css|src/main.js" index.html
rg -n "^import '\./modules/" src/main.js | head -1

echo "[3/5] main.js imports vs filesystem consistency check"
node scripts/check-manifest.js

echo "[4/5] git diff --check"
git diff --check

echo "[5/5] tracked-file guard"
git ls-files | rg '__pycache__|\.pyc$|\.png$|\.jpg$|\.jpeg$|\.gif$|\.webp$' && {
  echo 'binary-like tracked file found'
  exit 1
} || true

echo "All required checks passed."
