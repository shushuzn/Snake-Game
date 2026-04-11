# Development Tools

## Hook Templates

Hooks are stored in `.hooks/` directory as templates.

```
.hooks/
  pre-commit    - Runs before each commit
  pre-push      - Runs before each push
```

### Edit Hooks
```bash
# Just edit the template files
vim .hooks/pre-commit
vim .hooks/pre-push

# Then update installed hooks
bash shared/install-hooks.sh update
```

### Hook Commands
```bash
bash shared/install-hooks.sh install   # Install hooks
bash shared/install-hooks.sh update     # Update hooks from templates
bash shared/install-hooks.sh status    # Check status
bash shared/install-hooks.sh uninstall # Remove hooks
```

## Development Workflow

```
1. Clone repo
2. bash shared/install-hooks.sh install  # First time only
3. Make changes
4. git commit → pre-commit runs (<1s)
5. git push   → pre-push runs (~10s)
```

## CI Detection

Hooks automatically skip in CI environments:
- GitHub Actions
- GitLab CI
- Travis CI
- Local development always runs

## Other Tools

```bash
bash shared/pre-commit-check.sh  # Static check only
bash shared/quick-test.sh         # Quick tests
npx playwright test              # Full tests
```
