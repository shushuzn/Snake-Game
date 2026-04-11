# Isolated Debug Workflow

Debug integration issues by isolating changes in a separate branch and testing incrementally.

## When to Use
- New feature causes test failures or errors
- Unclear which change introduced a bug
- Working on experimental features that might break existing code

## Workflow

### 1. Create Isolated Debug Branch
```bash
git checkout -b debug/feature-name base-commit
```
Use a known-good commit as base (e.g., `main`, `origin/dev`).

### 2. Small Step Additions
For each change:
1. Make ONE change (file, function, or line)
2. Commit: `git commit -m "Step N: Description"`
3. Test: `bash shared/quick-test.sh` or `npx playwright test`
4. If fail → `git reset --hard HEAD~1` and retry differently
5. If pass → continue to next change

### 3. Verify Before Merge
```bash
# Ensure branches are up to date
git fetch origin

# Merge
git merge origin/feature-branch

# Verify merge content
git diff --stat HEAD~1

# Run tests
bash shared/quick-test.sh

# Push
git push
```

### 4. Cleanup
```bash
# Delete local
git branch -d debug/feature-name

# Delete remote
git push origin --delete feature-branch
```

## Common Pitfalls

| Pitfall | Prevention |
|---------|------------|
| Testing on development branch | Always use isolated branch |
| Multiple changes before test | One change per commit |
| Merge without verification | Always `git diff --stat` after merge |
| Tools on temporary branch | Keep utilities on stable branch |
| Initialization order issues | Check when variables are assigned vs when functions are called |

## Example: Debugging "X is undefined"

Problem: Adding new feature causes `skin is undefined` error.

Steps:
1. Create isolated branch from known-good commit
2. Add only the new module file → test
3. Add only the script tag → test
4. Add only DOM references → test
5. Add only the runtime initialization → test
6. Add only the function definition → test
7. Add only the function call → test (fails!)

Finding the step that fails pinpoints the issue.

## Key Insight
When integration fails with "X is undefined", the problem is often:
- Function called before variable is assigned
- Module loaded after initialization code runs
- Guard needed: `if (typeof X === 'undefined') return;`

Check initialization order in the file (variables assigned at top vs bottom).
