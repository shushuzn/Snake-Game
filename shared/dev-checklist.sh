#!/bin/bash
# 开发前检查清单
# 用法: bash shared/dev-checklist.sh <功能名>

FEATURE=$1
if [ -z "$FEATURE" ]; then
  echo "用法: bash shared/dev-checklist.sh <功能名>"
  exit 1
fi

echo "=== 开发前检查: $FEATURE ==="
echo ""

echo "1. 检查现有模块..."
ls src/modules/
echo ""

echo "2. 搜索相关功能..."
grep -rn "$FEATURE" src/modules/ 2>/dev/null || echo "   未找到相关功能"
echo ""

echo "3. 检查 index.html 注册..."
grep -n "src/modules/.*$FEATURE" index.html 2>/dev/null || echo "   未注册"
echo ""

echo "4. 搜索关键词..."
grep -rn "目标关键词" src/ 2>/dev/null | head -5 || echo "   未找到"
echo ""

echo "=== 检查完成 ==="
