#!/bin/bash
# Pre-commit check script v2 - STRICT MODE
# Usage: bash shared/pre-commit-check.sh
# Run before: git add . && git commit

set -e

echo "=== Pre-commit Check (Strict Mode) ==="
echo ""

# 1. Check for new JS modules WITHOUT HTML changes - THIS IS NOW FORBIDDEN
NEW_JS_FILES=$(git diff --cached --name-only --diff-filter=A | grep "src/modules" | grep "\.js$" || echo "")
HTML_CHANGED=$(git diff --cached --name-only | grep "\.html$" | wc -l || echo "0")

if [ -n "$NEW_JS_FILES" ] && [ "$HTML_CHANGED" -eq 0 ]; then
    echo "❌ FORBIDDEN: New JS modules without HTML changes!"
    echo ""
    echo "   New modules:"
    echo "$NEW_JS_FILES"
    echo ""
    echo "   Rule: Each JS module MUST be registered in index.html"
    echo "   Rule: Each feature MUST have UI elements"
    echo ""
    echo "   Fix: Add module registration to index.html AND add DOM UI elements"
    exit 1
fi

# 2. Check for new JS modules - verify registration
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
            exit 1
        fi
    done
else
    echo "1. No new JS modules (OK)"
fi
echo ""

# 3. Check game.js integration for new modules
JS_MODULE_CHANGES=$(git diff --cached --name-only | grep "src/modules" | wc -l || echo "0")
GAME_JS_CHANGES=$(git diff --cached --name-only | grep "game\.js" | wc -l || echo "0")

if [ "$JS_MODULE_CHANGES" -gt 0 ] && [ "$GAME_JS_CHANGES" -eq 0 ]; then
    echo "⚠️  WARNING: JS modules added but NO game.js integration!"
    echo "   Modules need to be connected in game.js"
    read -p "Continue? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "2. Integration check passed (OK)"
fi
echo ""

# 4. Run tests
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
