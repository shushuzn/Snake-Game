#!/bin/bash
# Quick test script - runs playwright tests and shows last 10 lines
# Usage: bash shared/quick-test.sh

cd "$(dirname "$0")/.."

echo "Running tests..."
timeout 90 npx playwright test --reporter=list 2>&1 | tail -15

exit_code=${PIPESTATUS[0]}
if [ $exit_code -eq 0 ]; then
    echo ""
    echo "✅ All tests passed"
else
    echo ""
    echo "❌ Tests failed"
fi
