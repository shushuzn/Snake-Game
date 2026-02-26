#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$repo_root"

echo "[1/4] node --check on tracked JS files"
node --check $(git ls-files '*.js')

echo "[2/4] index.html resource reference check"
rg -n "styles.css|workshop.js|modes.js|input.js|render.js|game.js" index.html

echo "[3/4] git diff --check"
git diff --check

echo "[4/4] tracked-file guard"
git ls-files | rg '__pycache__|\.pyc$|\.png$|\.jpg$|\.jpeg$|\.gif$|\.webp$' && {
  echo 'binary-like tracked file found'
  exit 1
} || true

echo "All required checks passed."
