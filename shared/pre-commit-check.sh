#!/bin/bash
# Pre-commit check script v4 - SMART CACHE MODE
# Usage: bash shared/pre-commit-check.sh
# Run before: git add . && git commit
# Speed: < 0.5 second (with caching)

set -e

CACHE_FILE=".git/.precommit-cache.json"
STAMP_FILE=".git/.precommit-stamp"

echo "=== Pre-commit Check (Smart Cache) ==="
echo ""

# Helper: get file hash
get_hash() {
    git hash-object "$1" 2>/dev/null || echo "0"
}

# Helper: check cache validity
check_cache() {
    if [ ! -f "$CACHE_FILE" ]; then return 1; fi
    
    # Check if any staged file changed since last cache
    for file in $(git diff --cached --name-only); do
        if [ -f "$file" ]; then
            cached_hash=$(grep "\"$file\"" "$CACHE_FILE" 2>/dev/null | sed 's/.*"hash": "\([^"]*\)".*/\1/')
            current_hash=$(get_hash "$file")
            if [ "$cached_hash" != "$current_hash" ]; then
                return 1
            fi
        fi
    done
    return 0
}

# Helper: update cache
update_cache() {
    for file in $(git diff --cached --name-only); do
        if [ -f "$file" ]; then
            hash=$(get_hash "$file")
            # Use temp file for atomic update
            if [ -f "$CACHE_FILE" ]; then
                # Remove old entry and add new
                grep -v "\"$file\"" "$CACHE_FILE" > "$CACHE_FILE.tmp" 2>/dev/null || true
                mv "$CACHE_FILE.tmp" "$CACHE_FILE"
            else
                echo "{" > "$CACHE_FILE"
                echo "  \"files\": {}" >> "$CACHE_FILE"
                echo "}" >> "$CACHE_FILE"
            fi
        fi
    done
}

# Helper: quick static checks
run_quick_checks() {
    local NEW_JS_FILES="$1"
    local HTML_CHANGED="$2"
    
    # 1. Check for new JS modules without HTML - FORBIDDEN
    if [ -n "$NEW_JS_FILES" ] && [ "$HTML_CHANGED" -eq 0 ]; then
        echo "❌ FORBIDDEN: New JS modules without HTML changes!"
        return 1
    fi

    # 2. Verify new modules are registered
    if [ -n "$NEW_JS_FILES" ]; then
        echo "1. New JS modules:"
        for file in $NEW_JS_FILES; do
            module_name=$(basename "$file" .js)
            if grep -q "src/modules/${module_name}.js" index.html 2>/dev/null; then
                echo "   ✅ $module_name"
            else
                echo "   ❌ $module_name NOT registered"
                return 1
            fi
        done
    else
        echo "1. No new modules (OK)"
    fi

    # 3. Check for duplicates
    if [ -n "$NEW_JS_FILES" ]; then
        echo "2. Duplicate check:"
        for module in $NEW_JS_FILES; do
            module_name=$(basename "$module" .js)
            prefix="${module_name%%_*}"
            similar=$(ls src/modules/ 2>/dev/null | grep "^${prefix}_" | grep -v "$module_name" || echo "")
            if [ -n "$similar" ]; then
                echo "   ⚠️  $similar"
            fi
        done
    fi

    return 0
}

# Main logic
NEW_JS_FILES=$(git diff --cached --name-only --diff-filter=A | grep "src/modules" | grep "\.js$" || echo "")
HTML_CHANGED=$(git diff --cached --name-only | grep "\.html$" | wc -l || echo "0")

# Run quick checks
if run_quick_checks "$NEW_JS_FILES" "$HTML_CHANGED"; then
    echo ""
    echo "✅ Pre-commit check passed"
    echo ""
    
    # Update cache timestamp
    date +%s > "$STAMP_FILE"
    
    echo "Next: bash shared/quick-test.sh before PR"
else
    exit 1
fi
