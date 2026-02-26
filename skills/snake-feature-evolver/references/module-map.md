# Snake Module Map

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

## Version/update discipline

For user-visible gameplay updates, keep all synchronized:

- `GAME_VERSION` in `game.js`
- version text in `index.html`
- latest progress entry in `README.md`
