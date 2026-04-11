# Development Tools

## Quick Reference

### Git Hooks (Automatic)
```bash
# Install hooks (one-time)
bash shared/install-hooks.sh

# After install, commits automatically run pre-commit checks
git commit -m "message"  # Hook runs automatically
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
1. Create branch: `git checkout -b feature/v1.x.x`
2. Make changes
3. Commit (hook runs automatically)
4. Run quick-test before PR: `bash shared/quick-test.sh`
5. Merge to main
6. Run full test before deploy: `npx playwright test`

### Pre-commit Check Levels
| Level | When | Scope | Speed |
|-------|------|-------|-------|
| Static | Every commit | Registration, duplicates | < 1s |
| Quick | Before PR | Smoke tests | ~10s |
| Full | Before merge | All tests | ~30s |
