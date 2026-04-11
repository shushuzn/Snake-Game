#!/bin/bash
# Git Hook Installer v2
# Usage: bash shared/install-hooks.sh [install|uninstall|status]
# 
# Install methods:
#   1. Template (recommended): Hooks in .git/template/hooks/ - auto-copied on clone
#   2. Local: Hooks in .git/hooks/ - only for this repo

set -e

ACTION="${1:-install}"
TEMPLATE_HOOKS="$(pwd)/.git/template/hooks"
LOCAL_HOOKS="$(pwd)/.git/hooks"
PRECOMMIT_SRC="$(pwd)/shared/pre-commit-check.sh"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

status() {
    echo "=== Git Hook Status ==="
    echo ""
    
    # Check template
    if [ -f "$TEMPLATE_HOOKS/pre-commit" ]; then
        echo -e "${GREEN}✅ Template hook${NC}: Installed"
    else
        echo -e "${RED}❌ Template hook${NC}: Not installed"
    fi
    
    # Check local
    if [ -f "$LOCAL_HOOKS/pre-commit" ]; then
        echo -e "${GREEN}✅ Local hook${NC}: Installed"
    else
        echo -e "${YELLOW}⚠️  Local hook${NC}: Not installed"
    fi
    
    echo ""
    echo "Template hooks are auto-copied on: git clone, git init"
    echo "Local hooks are only for this repo."
}

uninstall() {
    echo "=== Uninstall Hooks ==="
    echo ""
    
    if [ -f "$LOCAL_HOOKS/pre-commit" ]; then
        rm -f "$LOCAL_HOOKS/pre-commit"
        echo -e "${GREEN}✅ Local hook removed${NC}"
    else
        echo -e "${YELLOW}⚠️  No local hook to remove${NC}"
    fi
    
    echo ""
    echo "Note: Template hooks in .git/template/hooks/ remain."
    echo "To remove template hooks: rm -rf .git/template/hooks/"
}

install() {
    echo "=== Install Git Hooks ==="
    echo ""
    
    # Create template directory
    mkdir -p "$TEMPLATE_HOOKS"
    
    # Copy hook to template
    cat > "$TEMPLATE_HOOKS/pre-commit" << 'HOOK_EOF'
#!/bin/bash
# Git Template Hook - Auto-copied on git clone/init
# DO NOT EDIT - Run 'bash shared/install-hooks.sh' to update

SCRIPT_DIR="$(git rev-parse --show-toplevel)/shared"
CHECK_SCRIPT="$SCRIPT_DIR/pre-commit-check.sh"

# Skip in CI environment
if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
    exit 0
fi

# Skip if no check script
if [ ! -f "$CHECK_SCRIPT" ]; then
    exit 0
fi

# Run pre-commit check
bash "$CHECK_SCRIPT"
HOOK_EOF
    chmod +x "$TEMPLATE_HOOKS/pre-commit"
    
    echo -e "${GREEN}✅ Template hook installed${NC}"
    echo "   Location: $TEMPLATE_HOOKS/pre-commit"
    echo ""
    echo "   This hook will be auto-copied to new clones."
    echo "   Existing repos need: git init"
    
    # Also install locally for current repo
    mkdir -p "$LOCAL_HOOKS"
    cp "$TEMPLATE_HOOKS/pre-commit" "$LOCAL_HOOKS/"
    chmod +x "$LOCAL_HOOKS/pre-commit"
    
    echo ""
    echo -e "${GREEN}✅ Local hook installed${NC}"
    echo "   Location: $LOCAL_HOOKS/pre-commit"
    echo ""
    echo "   This repo now uses the hook."
}

case "$ACTION" in
    install)
        install
        ;;
    uninstall)
        uninstall
        ;;
    status)
        status
        ;;
    *)
        echo "Usage: bash shared/install-hooks.sh [install|uninstall|status]"
        exit 1
        ;;
esac
