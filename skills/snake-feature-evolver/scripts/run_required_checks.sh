#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$repo_root"

echo "[1/5] node --check on tracked JS files"
node --check $(git ls-files '*.js')

echo "[2/5] index.html + manifest resource reference check"
rg -n "styles.css|moduleLoader.js|game.js" index.html
rg -n "'modes'|'input'|'render'|'workshop'" src/modules/manifest.js

echo "[3/5] manifest vs filesystem consistency check"
node scripts/check-manifest.js

echo "[4/5] git diff --check"
git diff --check

echo "[5/5] tracked-file guard"
git ls-files | rg '__pycache__|\.pyc$|\.png$|\.jpg$|\.jpeg$|\.gif$|\.webp$' && {
  echo 'binary-like tracked file found'
  exit 1
} || true

echo "All required checks passed."
