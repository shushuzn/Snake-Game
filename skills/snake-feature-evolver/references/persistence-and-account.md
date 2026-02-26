# Persistence and Account Compatibility

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

## Core persistence modules

- `storage.js` (read/write helpers)
- `settings.js` (setting values and defaults)
- `account.js` (profile snapshot/export/import)
- `records.js` (history and result persistence)

## New key checklist

1. Define load/save defaults.
2. Include clear/reset path.
3. Include account snapshot export/import compatibility.
4. Guard old saves with safe fallback values.
