#!/bin/bash
# Git Hook Installer v3 - Multi-hook support
# Usage: bash shared/install-hooks.sh [install|uninstall|status|update]
# 
# Hooks supported:
#   pre-commit  - Runs before each commit
#   pre-push    - Runs before each push

set -e

TEMPLATE_DIR="$(pwd)/.git/template/hooks"
LOCAL_DIR="$(pwd)/.git/hooks"
SHARED_DIR="$(pwd)/shared"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

HOOKS=("pre-commit" "pre-push")

get_hook_content() {
    local hook_name="$1"
    
    case "$hook_name" in
        pre-commit)
            cat << 'EOF'
#!/bin/bash
# pre-commit hook - Auto-generated
# DO NOT EDIT - Run 'bash shared/install-hooks.sh update' to update

SCRIPT_DIR="$(git rev-parse --show-toplevel)/shared"
CHECK_SCRIPT="$SCRIPT_DIR/pre-commit-check.sh"

# Skip in CI
[ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ] && exit 0

# Skip if no check script
[ ! -f "$CHECK_SCRIPT" ] && exit 0

# Run pre-commit check
bash "$CHECK_SCRIPT"
EOF
            ;;
        pre-push)
            cat << 'EOF'
#!/bin/bash
# pre-push hook - Auto-generated
# DO NOT EDIT - Run 'bash shared/install-hooks.sh update' to update

SCRIPT_DIR="$(git rev-parse --show-toplevel)/shared"
QUICK_TEST="$SCRIPT_DIR/quick-test.sh"

# Skip in CI
[ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ] && exit 0

# Run quick test before push
[ -f "$QUICK_TEST" ] && bash "$QUICK_TEST"
EOF
            ;;
    esac
}

status() {
    echo "=== Git Hook Status ==="
    echo ""
    
    for hook in "${HOOKS[@]}"; do
        if [ -f "$LOCAL_DIR/$hook" ]; then
            echo -e "${GREEN}✅ $hook${NC}: Installed locally"
        else
            echo -e "${YELLOW}⚠️  $hook${NC}: Not installed locally"
        fi
        
        if [ -f "$TEMPLATE_DIR/$hook" ]; then
            echo -e "   ${GREEN}✓${NC} Template available"
        else
            echo -e "   ${RED}✗${NC} Template missing"
        fi
        echo ""
    done
    
    echo "Use 'bash shared/install-hooks.sh install' to install"
    echo "Use 'bash shared/install-hooks.sh update' to update hooks"
}

uninstall() {
    echo "=== Uninstall Hooks ==="
    echo ""
    
    for hook in "${HOOKS[@]}"; do
        if [ -f "$LOCAL_DIR/$hook" ]; then
            rm -f "$LOCAL_DIR/$hook"
            echo -e "${GREEN}✅ $hook${NC}: Removed"
        fi
    done
    
    echo ""
    echo "Note: Template hooks in .git/template/hooks/ remain."
    echo "To remove template hooks: rm -rf .git/template/hooks/"
}

install() {
    echo "=== Install Git Hooks ==="
    echo ""
    
    mkdir -p "$TEMPLATE_DIR"
    mkdir -p "$LOCAL_DIR"
    
    for hook in "${HOOKS[@]}"; do
        # Install to template
        get_hook_content "$hook" > "$TEMPLATE_DIR/$hook"
        chmod +x "$TEMPLATE_DIR/$hook"
        
        # Install locally
        cp "$TEMPLATE_DIR/$hook" "$LOCAL_DIR/$hook"
        chmod +x "$LOCAL_DIR/$hook"
        
        echo -e "${GREEN}✅ $hook${NC}: Installed"
    done
    
    echo ""
    echo "Template hooks will be auto-copied on: git clone, git init"
}

update() {
    echo "=== Update Git Hooks ==="
    echo ""
    
    mkdir -p "$TEMPLATE_DIR"
    mkdir -p "$LOCAL_DIR"
    
    for hook in "${HOOKS[@]}"; do
        # Update template
        get_hook_content "$hook" > "$TEMPLATE_DIR/$hook"
        chmod +x "$TEMPLATE_DIR/$hook"
        
        # Update local
        cp "$TEMPLATE_DIR/$hook" "$LOCAL_DIR/$hook"
        chmod +x "$LOCAL_DIR/$hook"
        
        echo -e "${GREEN}✅ $hook${NC}: Updated"
    done
}

case "${1:-install}" in
    install) install ;;
    uninstall) uninstall ;;
    status) status ;;
    update) update ;;
    *) 
        echo "Usage: bash shared/install-hooks.sh [install|uninstall|status|update]"
        exit 1
        ;;
esac
