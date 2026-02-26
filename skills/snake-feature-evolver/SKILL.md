---
name: snake-feature-evolver
description: Continue evolving this modular Snake web game when users ask to continue/继续/继续发展/继续进化玩法, with coherent feature slices, synchronized version updates, storage/account compatibility, and required repository checks.
---

# Snake Feature Evolver

Implement one coherent gameplay or product slice per iteration.

## Scope

- Target modular runtime files (`game.js`, `modes.js`, `mode_rules.js`, `item_spawn.js`, `round_state.js`, `loop_timers.js`, `play_state.js`, `endgame_flow.js`, `reset_prepare.js`, `reset_flow.js`, `render.js`, `input.js`, `settings.js`, `storage.js`, `account.js`, `records.js`, `challenge.js`, `season.js`, `leaderboard.js`, `workshop.js`, `workshop_runtime.js`, `recap.js`, `settlement.js`, `events.js`) plus UI shell (`index.html`, `styles.css`).
- Keep localStorage/account snapshot compatibility unless migration is explicitly requested.

## Workflow

1. Read only the modules relevant to the requested feature.
2. Implement one coherent slice with additive changes first.
3. Keep version discipline:
   - bump visible version text in `index.html`
   - bump `GAME_VERSION` in `game.js`
   - update latest progress in `README.md`
   - prefer `python3 skills/snake-feature-evolver/scripts/bump_version.py <version>` for synchronized bumps
4. Keep persistence discipline:
   - add only necessary storage keys
   - wire key(s) into clear/reset flows
   - if account-scoped, include snapshot/export/import compatibility
5. Run required checks.
6. If visible UI changed, run local server and capture a screenshot.

## Required checks

```bash
node --check $(git ls-files '*.js')
rg -n "styles.css|workshop.js|modes.js|input.js|render.js|game.js" index.html
git diff --check
git ls-files | rg '__pycache__|\.pyc$|\.png$|\.jpg$|\.jpeg$|\.gif$|\.webp$' && echo 'binary-like tracked file found' && exit 1 || true
```

## References

- Reference index (load minimal files): `references/modes-and-systems.md`
- Module ownership and mode touchpoints: `references/module-map.md`
- Persistence/account compatibility: `references/persistence-and-account.md`
- Feature integration checklists: `references/integration-checklists.md`
- Version bump helper: `scripts/bump_version.py`

## Notes

- Keep user-facing Chinese labels concise and consistent.
- Mention gameplay impact and touched storage keys in delivery summary.
