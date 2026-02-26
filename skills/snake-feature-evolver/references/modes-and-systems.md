# Snake Modes & Systems Reference

## Modes currently supported

- `classic`
- `timed`
- `sprint`
- `endless`
- `roguelike`

When changing or adding a mode, verify all of:

- mode config/source of truth in `modes.js`
- mode rule branches in `mode_rules.js`
- round initialization defaults in `round_state.js`
- mode labels shown in `records.js`, `recap.js`, and share/workshop text
- mode-related best-score persistence and reset behavior

## Persisted storage keys (current)

- `snake-best`
- `snake-settings-v2`
- `snake-stats-v1`
- `snake-audio-v1`
- `snake-best-by-mode-v1`
- `snake-achievements-v1`
- `snake-last-result-v1`
- `snake-history-v1`
- `snake-codex-v1`
- `snake-endless-best-level-v1`
- `snake-roguelike-meta-v1`
- `snake-recap-v1`
- `snake-season-meta-v1`
- `snake-leaderboard-v1`
- `snake-custom-rocks-v1`
- `snake-onboarding-v1`
- account-related: `snake-accounts-v1`, `snake-current-account-v1`, `snake-save-*`

Core persistence modules:

- `storage.js` (read/write helpers)
- `settings.js` (setting values and defaults)
- `account.js` (profile snapshot/export/import)
- `records.js` (history and result persistence)

If adding/changing a persistent key:

1. Define load/save defaults.
2. Include clear/reset path.
3. Include account snapshot export/import compatibility.
4. Guard old saves with safe fallback values.

## Feature integration checklists

### New pickup / status effect

- Add spawn rule in `item_spawn.js`.
- Add runtime state initialization in `round_state.js`.
- Add timer/effect handling in `loop_timers.js` or relevant runtime loop path.
- Add collision/effect application in `game.js` orchestration path.
- Add rendering/HUD feedback in `render.js`.
- Add reset cleanup in `reset_prepare.js` and/or `reset_flow.js`.

### New challenge / season / event behavior

- `challenge.js` for daily/rotation challenge logic.
- `season.js` for season progress/reward surfaces.
- `events.js` for event package and period logic.
- `settlement.js` and `recap.js` for end-of-round summary exposure.

### New share / workshop capability

- `workshop.js` for encode/decode and schema fields.
- `workshop_runtime.js` for runtime application/validation.
- Keep backward compatibility for previously shared codes.

## Version/update discipline

For user-visible gameplay updates, keep all synchronized:

- `GAME_VERSION` in `game.js`
- version text in `index.html`
- latest progress entry in `README.md`
