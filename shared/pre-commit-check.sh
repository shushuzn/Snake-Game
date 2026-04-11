#!/bin/bash
# Pre-commit check script
# Usage: bash shared/pre-commit-check.sh
# Run before: git add . && git commit

set -e

echo "=== Pre-commit Check ==="
echo ""

# 1. Check for new JS modules
NEW_JS_FILES=$(git diff --cached --name-only --diff-filter=A | grep "src/modules" | grep "\.js$" || echo "")
if [ -n "$NEW_JS_FILES" ]; then
    echo "1. New JS modules detected:"
    echo "$NEW_JS_FILES"
    echo ""

    for file in $NEW_JS_FILES; do
        module_name=$(basename "$file" .js)

        # Check if module is registered in index.html
        if grep -q "src/modules/${module_name}.js" index.html; then
            echo "   ✅ $module_name registered in index.html"
        else
            echo "   ❌ $module_name NOT registered in index.html"
            echo "   Run: grep -n '${module_name}' index.html"
            exit 1
        fi
    done
else
    echo "1. No new JS modules (OK)"
fi
echo ""

# 2. Check for JS module changes without HTML changes
JS_CHANGED=$(git diff --cached --name-only | grep "src/modules" | wc -l || echo "0")
HTML_CHANGED=$(git diff --cached --name-only | grep "\.html$" | wc -l || echo "0")

if [ "$JS_CHANGED" -gt 0 ] && [ "$HTML_CHANGED" -eq 0 ]; then
    echo "⚠️  WARNING: JS modules changed but NO HTML changes!"
    echo "   Modules may not be visible to users."
    read -p "Continue? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "2. Visibility check passed (OK)"
fi
echo ""

# 3. Run quick test
echo "3. Running tests..."
timeout 60 npx playwright test --reporter=list 2>&1 | tail -5
TEST_RESULT=$?
echo ""

if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ Tests passed"
else
    echo "❌ Tests failed"
    exit 1
fi

echo ""
echo "=== Pre-commit check passed ==="
