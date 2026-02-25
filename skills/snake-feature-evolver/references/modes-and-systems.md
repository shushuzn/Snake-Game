# Snake Modes & Systems Reference

## Modes currently supported

- `classic`
- `timed`
- `endless`
- `roguelike`

When adding a new mode, update all of:
- mode `<select id="mode">` options
- mode parsing in `loadSettings`
- history/last-result mode label rendering
- share text mode label
- `bestByMode` read/write defaults and reset paths

## Persisted system keys (profile-scoped)

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

If adding a new persistent key:
1. Include it in profile capture/apply list
2. Include clear/reset behavior
3. Include export/import compatibility

## Account system integration points

Account controls:
- `accountInput`, `loginAccount`, `logoutAccount`
- `exportSave`, `importSave`

Critical account functions:
- `captureProfileSnapshot`
- `applyProfileSnapshot`
- `saveActiveAccountSnapshot`
- `reloadAllFromStorage`
- `loginAccount` / `logoutAccount`
- `exportSaveData` / `importSaveData`

## New pickup integration checklist

- Add state vars and expire timestamps
- Add collision-safe spawn in `randomFreeCell`
- Add spawn rule function
- Add expire handling in `update`
- Add pickup handling in `update`
- Add rendering in `draw`
- Add codex entry and discovery hook if collectible
- Add reset handling in `resetGame`

## Endless / roguelike reminders

- Endless mode has `level`, `levelTargetScore`, `endlessBestLevel`
- Roguelike mode has mutators and perk persistence (`snake-roguelike-meta-v1`)
- If changing score pacing, re-check endless threshold logic and roguelike reward gain
