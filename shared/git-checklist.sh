#!/bin/bash
# Git merge checklist script v2
# Usage: bash shared/git-checklist.sh <source-branch>

set -e

if [ -z "$1" ]; then
    echo "Usage: bash shared/git-checklist.sh <source-branch>"
    exit 1
fi

SOURCE_BRANCH="$1"
CURRENT_BRANCH=$(git branch --show-current)

echo "=== Git Merge Checklist ==="
echo "Current branch: $CURRENT_BRANCH"
echo "Source branch: $SOURCE_BRANCH"
echo ""

# 1. Fetch latest
echo "1. Fetching latest from origin..."
git fetch origin
echo ""

# 2. Check if source branch is ahead of local
LOCAL_COMMITS=$(git rev-list --count HEAD...origin/$SOURCE_BRANCH 2>/dev/null || echo "0")
echo "2. Source branch is ahead by: $LOCAL_COMMITS commits"

# 3. Show source branch commits
echo ""
echo "3. Source branch commits to merge:"
git log origin/$SOURCE_BRANCH --oneline -10
echo ""

# 4. Confirm merge
echo "4. About to merge origin/$SOURCE_BRANCH into $CURRENT_BRANCH"
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

# 5. Merge
echo "5. Merging..."
git merge origin/$SOURCE_BRANCH --no-edit
MERGE_RESULT=$?
echo ""

if [ $MERGE_RESULT -ne 0 ]; then
    echo "❌ Merge failed! Check conflicts manually."
    exit 1
fi

# 6. Verify merge
echo "6. Verify merge (files changed):"
git diff --stat HEAD~1
echo ""

# 7. Run tests
echo "7. Running tests..."
timeout 90 npx playwright test --reporter=list 2>&1 | tail -15
TEST_RESULT=$?
echo ""

if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ Tests passed"
    echo ""
    echo "=== Ready to push ==="
    echo "Run: git push"
else
    echo "❌ Tests failed"
    echo "Run: git reset --hard HEAD~1 to undo merge"
fi
