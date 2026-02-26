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
- mode labels shown in records/recap/share outputs
- mode-related best-score persistence and reset behavior

## Persistence and account integration

Core persistence modules:

- `storage.js` (read/write helpers)
- `settings.js` (setting values and defaulting)
- `account.js` (profile snapshot/export/import)
- `records.js` (history and result persistence)

If adding or changing a persistent key:

1. Define load/save defaults.
2. Include clear/reset path.
3. Include account snapshot export/import compatibility.
4. Guard old saves with safe fallback values.

## Feature integration checklists

### New pickup / status effect

- Add spawn rule in `item_spawn.js`.
- Add runtime state initialization in `round_state.js`.
- Add timer/effect handling in `loop_timers.js` or the relevant runtime loop path.
- Add collision/effect application in `game.js` orchestration path.
- Add rendering/HUD feedback in `render.js`.
- Add reset cleanup in `reset_prepare.js` and/or `reset_flow.js`.

### New challenge/season/event behavior

- `challenge.js` for daily/rotation challenge logic.
- `season.js` for season progress/reward surfaces.
- `events.js` for event package and period logic.
- `settlement.js` and `recap.js` for end-of-round summary exposure.

### New share/workshop capability

- `workshop.js` for encode/decode and schema fields.
- `workshop_runtime.js` for runtime application/validation.
- Keep backward compatibility for previously shared codes.

## Version/update discipline

For user-visible gameplay updates, keep all synchronized:

- `GAME_VERSION` in `game.js`
- version text in `index.html`
- latest progress entry in `README.md`
