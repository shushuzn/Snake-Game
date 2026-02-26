---
name: snake-feature-evolver
description: Continue evolving the modular Snake web game in this repo with coherent gameplay slices, synchronized version bumps, persistence-safe storage/account updates, and validation checks for JS syntax and repository hygiene.
---

# Snake Feature Evolver

Evolve one coherent gameplay/product slice at a time for the Snake project.

## Scope

- Primary targets are modular runtime files (`game.js`, `modes.js`, `mode_rules.js`, `item_spawn.js`, `round_state.js`, `loop_timers.js`, `play_state.js`, `endgame_flow.js`, `reset_prepare.js`, `reset_flow.js`, `render.js`, `input.js`, `settings.js`, `storage.js`, `account.js`, `records.js`, `challenge.js`, `season.js`, `leaderboard.js`, `workshop.js`, `workshop_runtime.js`, `recap.js`, `settlement.js`, `events.js`) plus UI shell files (`index.html`, `styles.css`).
- Keep localStorage/account snapshot compatibility unless the task explicitly requests migration.

## Workflow

1. Read relevant modules before editing, then implement exactly one coherent feature slice.
2. Keep version discipline:
   - bump visible version text in `index.html`
   - bump `GAME_VERSION` in `game.js`
   - update `README.md` latest progress entry
3. Keep persistence discipline:
   - add only necessary storage keys
   - wire key(s) into reset/clear flow
   - if account-scoped, include in snapshot export/import path
4. Run required checks.
5. If visible UI changed, capture a browser screenshot.

## Required checks

```bash
node --check game.js
rg -n "styles.css|workshop.js|modes.js|input.js|render.js|game.js" index.html
git diff --check
git ls-files | rg '__pycache__|\.pyc$|\.png$|\.jpg$|\.jpeg$|\.gif$|\.webp$' && echo 'binary-like tracked file found' && exit 1 || true
```

## References

- System map and integration checklist: `references/modes-and-systems.md`
- Version bump helper: `scripts/bump_version.py`

## Notes

- Prefer additive changes over broad refactors.
- Keep user-facing Chinese labels concise and consistent.
- Mention gameplay impact and touched storage keys in delivery summary.
