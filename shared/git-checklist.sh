#!/bin/bash
# Git merge checklist script
# Usage: bash shared/git-checklist.sh <source-branch>

if [ -z "$1" ]; then
    echo "Usage: bash shared/git-checklist.sh <source-branch>"
    exit 1
fi

SOURCE_BRANCH="$1"

echo "=== Git Merge Checklist ==="
echo ""

# 1. Fetch latest
echo "1. Fetching latest..."
git fetch origin
echo ""

# 2. Show source branch commits
echo "2. Source branch commits:"
git log origin/$SOURCE_BRANCH --oneline -5
echo ""

# 3. Merge
echo "3. Merging..."
git merge origin/$SOURCE_BRANCH --no-edit
echo ""

# 4. Verify merge
echo "4. Verify merge (files changed):"
git diff --stat HEAD~1
echo ""

# 5. Run tests
echo "5. Running tests..."
timeout 90 npx playwright test --reporter=list 2>&1 | tail -10
TEST_RESULT=$?
echo ""

if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ Tests passed"
else
    echo "❌ Tests failed"
fi
