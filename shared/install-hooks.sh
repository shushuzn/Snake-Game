#!/bin/bash
# Git Hook Installer v4 - Template-based
# Usage: bash shared/install-hooks.sh [install|uninstall|status|update]
#
# Hooks are stored in .hooks/ directory as templates
# This script copies templates to .git/hooks/ and .git/template/hooks/

set -e

TEMPLATE_DIR="$(pwd)/.git/template/hooks"
LOCAL_DIR="$(pwd)/.git/hooks"
HOOKS_DIR="$(pwd)/.hooks"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get list of hooks from .hooks/ directory
get_hooks() {
    ls "$HOOKS_DIR"/* 2>/dev/null | xargs -n1 basename | sort
}

status() {
    echo "=== Git Hook Status ==="
    echo ""
    
    hooks=$(get_hooks)
    if [ -z "$hooks" ]; then
        echo -e "${RED}❌ No hooks found in .hooks/${NC}"
        return
    fi
    
    for hook in $hooks; do
        echo "Hook: $hook"
        
        # Check local
        if [ -f "$LOCAL_DIR/$hook" ]; then
            echo -e "  ${GREEN}✅ Local${NC}: Installed"
        else
            echo -e "  ${YELLOW}⚠️  Local${NC}: Not installed"
        fi
        
        # Check template
        if [ -f "$TEMPLATE_DIR/$hook" ]; then
            echo -e "  ${GREEN}✅ Template${NC}: Available"
        else
            echo -e "  ${RED}❌ Template${NC}: Missing"
        fi
        
        # Check if template differs from local
        if [ -f "$LOCAL_DIR/$hook" ] && [ -f "$TEMPLATE_DIR/$hook" ]; then
            if ! diff -q "$TEMPLATE_DIR/$hook" "$LOCAL_DIR/$hook" > /dev/null 2>&1; then
                echo -e "  ${YELLOW}⚠️  Local differs from template (run 'update')${NC}"
            fi
        fi
        
        echo ""
    done
}

uninstall() {
    echo "=== Uninstall Hooks ==="
    echo ""
    
    hooks=$(get_hooks)
    if [ -z "$hooks" ]; then
        echo "No hooks to uninstall"
        return
    fi
    
    for hook in $hooks; do
        if [ -f "$LOCAL_DIR/$hook" ]; then
            rm -f "$LOCAL_DIR/$hook"
            echo -e "${GREEN}✅ $hook${NC}: Removed from local"
        fi
    done
    
    echo ""
    echo "Note: Template hooks in .git/template/hooks/ remain."
}

install() {
    echo "=== Install Git Hooks ==="
    echo ""
    
    hooks=$(get_hooks)
    if [ -z "$hooks" ]; then
        echo -e "${RED}❌ No hooks found in .hooks/${NC}"
        exit 1
    fi
    
    mkdir -p "$TEMPLATE_DIR"
    mkdir -p "$LOCAL_DIR"
    
    for hook in $hooks; do
        # Copy to template
        cp "$HOOKS_DIR/$hook" "$TEMPLATE_DIR/$hook"
        chmod +x "$TEMPLATE_DIR/$hook"
        
        # Copy to local
        cp "$HOOKS_DIR/$hook" "$LOCAL_DIR/$hook"
        chmod +x "$LOCAL_DIR/$hook"
        
        echo -e "${GREEN}✅ $hook${NC}: Installed"
    done
    
    echo ""
    echo "Template hooks will be auto-copied on: git clone, git init"
}

update() {
    echo "=== Update Git Hooks ==="
    echo ""
    
    hooks=$(get_hooks)
    if [ -z "$hooks" ]; then
        echo -e "${RED}❌ No hooks found${NC}"
        exit 1
    fi
    
    for hook in $hooks; do
        if [ -f "$HOOKS_DIR/$hook" ]; then
            # Update template
            cp "$HOOKS_DIR/$hook" "$TEMPLATE_DIR/$hook"
            chmod +x "$TEMPLATE_DIR/$hook"
            
            # Update local
            cp "$HOOKS_DIR/$hook" "$LOCAL_DIR/$hook"
            chmod +x "$LOCAL_DIR/$hook"
            
            echo -e "${GREEN}✅ $hook${NC}: Updated"
        fi
    done
}

case "${1:-status}" in
    install) install ;;
    uninstall) uninstall ;;
    status) status ;;
    update) update ;;
    *) 
        echo "Usage: bash shared/install-hooks.sh [install|uninstall|status|update]"
        exit 1
        ;;
esac
