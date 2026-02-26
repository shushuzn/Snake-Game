# Feature Integration Checklists

## New pickup / status effect

- Add spawn rule in `item_spawn.js`.
- Add runtime state initialization in `round_state.js`.
- Add timer/effect handling in `loop_timers.js` or relevant runtime loop path.
- Add collision/effect application in `game.js` orchestration path.
- Add rendering/HUD feedback in `render.js`.
- Add reset cleanup in `reset_prepare.js` and/or `reset_flow.js`.

## New challenge / season / event behavior

- `challenge.js` for daily/rotation challenge logic.
- `season.js` for season progress/reward surfaces.
- `events.js` for event package and period logic.
- `settlement.js` and `recap.js` for end-of-round summary exposure.

## New share / workshop capability

- `workshop.js` for encode/decode and schema fields.
- `workshop_runtime.js` for runtime application/validation.
- Keep backward compatibility for previously shared codes.
