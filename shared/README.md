# Development Tools

## Quick Reference

### Git Hooks (Automatic)
```bash
# One-time setup (after clone)
bash shared/install-hooks.sh install

# Hooks auto-run before each commit.
# Template hooks auto-copy on: git clone, git init
```

### Hook Commands
```bash
bash shared/install-hooks.sh install   # Install hooks
bash shared/install-hooks.sh uninstall # Remove hooks
bash shared/install-hooks.sh status    # Check status
```

### Manual Checks
```bash
# Pre-commit check (< 1s)
bash shared/pre-commit-check.sh

# Quick test before PR (~10s)
bash shared/quick-test.sh

# Full test before merge (~30s)
npx playwright test
```

### Development Workflow
1. Clone repo → Hooks auto-installed via template
2. Make changes
3. Commit → Hook runs automatically
4. Run quick-test before PR: `bash shared/quick-test.sh`
5. Merge to main
6. Run full test before deploy: `npx playwright test`

### Pre-commit Check Levels
| Level | When | Scope | Speed |
|-------|------|-------|-------|
| Static | Every commit | Registration, duplicates | < 1s |
| Quick | Before PR | Smoke tests | ~10s |
| Full | Before merge | All tests | ~30s |

### CI Detection
Hooks automatically skip in CI environments (GitHub Actions, Travis, etc.)
