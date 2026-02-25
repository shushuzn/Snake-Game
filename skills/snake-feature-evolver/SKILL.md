---
name: snake-feature-evolver
description: Continue evolving the single-file Snake game in this repo (index.html) with coherent gameplay slices, version bumps, persistence-safe changes, validation checks, and optional UI screenshot capture.
---

# Snake Feature Evolver

Use this skill when users ask to继续发展/继续进化/发展新玩法 for the Snake game.

## Scope

- Primary target: `index.html` (single-file app).
- Keep compatibility with existing localStorage keys unless an explicit migration is requested.

## Workflow

1. Read current systems in `index.html` (mode, pickups, HUD, persistence keys, account/save flow).
2. Implement one coherent feature slice (new mechanic / mode rule / progression surface).
3. Keep version discipline:
   - bump visible `versionTag`
   - bump `GAME_VERSION`
4. Persistence discipline:
   - add only required key(s)
   - if persistent, include clear/reset behavior in `clearData`
   - if data is account-scoped, ensure account snapshot export/import still works
5. Validate required checks:
   - JS parse check
   - `git diff --check`
   - tracked-file binary guard check
6. If visible UI changed, run local server and capture a screenshot.

## Current feature map

Read this file when deciding integration points:
- `references/modes-and-systems.md`

## Quick command checklist

```bash
node -e "const fs=require('fs');const m=fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*)<\/script>/);new Function(m[1]);console.log('js ok')"
git diff --check
git ls-files | rg '__pycache__|\.pyc$|\.png$|\.jpg$|\.jpeg$|\.gif$|\.webp$' && echo 'binary-like tracked file found' && exit 1 || true
python3 -m http.server 4173
```

## Notes

- Prefer additive changes over broad refactors.
- Keep user-facing text concise and consistent (Chinese UI labels).
- Mention gameplay impact and touched storage keys in delivery summary.
