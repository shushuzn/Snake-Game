#!/bin/bash
# Git Hook Installer
# Usage: bash shared/install-hooks.sh
# Installs pre-commit hook that runs automatically

set -e

HOOK_DIR="$(pwd)/.git/hooks"
HOOK_FILE="$HOOK_DIR/pre-commit"
SCRIPT_DIR="$(pwd)/shared"

echo "=== Git Hook Installer ==="
echo ""

# Create hooks directory if not exists
mkdir -p "$HOOK_DIR"

# Create pre-commit hook
cat > "$HOOK_FILE" << 'HOOK_EOF'
#!/bin/bash
# Auto-generated pre-commit hook
# DO NOT EDIT - Run 'bash shared/install-hooks.sh' to update

SCRIPT_DIR="$(git rev-parse --show-toplevel)/shared"
CHECK_SCRIPT="$SCRIPT_DIR/pre-commit-check.sh"

if [ -f "$CHECK_SCRIPT" ]; then
    bash "$CHECK_SCRIPT"
else
    echo "⚠️  pre-commit-check.sh not found at $CHECK_SCRIPT"
    echo "   Skipping pre-commit checks"
fi
HOOK_EOF

chmod +x "$HOOK_FILE"

echo "✅ Git Hook installed!"
echo ""
echo "Hook location: $HOOK_FILE"
echo ""
echo "The hook will run automatically before each commit."
echo "To uninstall: rm $HOOK_FILE"
echo ""
echo "To update hook: bash shared/install-hooks.sh"
