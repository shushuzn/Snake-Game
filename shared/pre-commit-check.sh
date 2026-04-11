#!/bin/bash
# Pre-commit check script v3 - FAST MODE (no tests)
# Usage: bash shared/pre-commit-check.sh
# Run before: git add . && git commit
# Speed: < 1 second

set -e

echo "=== Pre-commit Check (Fast Mode) ==="
echo ""

# 1. Check for new JS modules WITHOUT HTML changes - FORBIDDEN
NEW_JS_FILES=$(git diff --cached --name-only --diff-filter=A | grep "src/modules" | grep "\.js$" || echo "")
HTML_CHANGED=$(git diff --cached --name-only | grep "\.html$" | wc -l || echo "0")

if [ -n "$NEW_JS_FILES" ] && [ "$HTML_CHANGED" -eq 0 ]; then
    echo "❌ FORBIDDEN: New JS modules without HTML changes!"
    echo ""
    echo "   Rule: Each JS module MUST be registered in index.html"
    echo "   Fix: Add module registration to index.html"
    exit 1
fi

# 2. Verify new modules are registered
if [ -n "$NEW_JS_FILES" ]; then
    echo "1. New JS modules detected:"
    echo "$NEW_JS_FILES"
    echo ""

    for file in $NEW_JS_FILES; do
        module_name=$(basename "$file" .js)
        if grep -q "src/modules/${module_name}.js" index.html; then
            echo "   ✅ $module_name registered"
        else
            echo "   ❌ $module_name NOT registered in index.html"
            exit 1
        fi
    done
else
    echo "1. No new JS modules (OK)"
fi
echo ""

# 3. Check for duplicates
if [ -n "$NEW_JS_FILES" ]; then
    echo "2. Checking for duplicates..."
    for module in $NEW_JS_FILES; do
        module_name=$(basename "$module" .js)
        prefix="${module_name%%_*}"
        similar=$(ls src/modules/ 2>/dev/null | grep "^${prefix}_" | grep -v "$module_name" || echo "")
        if [ -n "$similar" ]; then
            echo "   ⚠️  Similar modules: $similar"
        fi
    done
    echo ""
fi

# 4. Verify game.js integration if modules changed
JS_MODULE_CHANGES=$(git diff --cached --name-only | grep "src/modules" | wc -l || echo "0")
GAME_JS_CHANGES=$(git diff --cached --name-only | grep "game\.js" | wc -l || echo "0")

if [ "$JS_MODULE_CHANGES" -gt 0 ] && [ "$GAME_JS_CHANGES" -eq 0 ]; then
    echo "⚠️  WARNING: JS modules changed but no game.js changes"
    echo "   Consider if game.js integration is needed"
    echo ""
fi

echo "✅ Pre-commit check passed (static analysis only)"
echo ""
echo "Note: Run 'bash shared/quick-test.sh' before PR"
echo "      Run 'npx playwright test' before merge"
