window.SnakeResetPrepare = (() => {
  function createResetPrepareModule({
    state,
    world,
    dlc,
    challenge,
    round,
    mode
  }) {
    function prepareRound() {
      state.setSnake([
        { x: 8, y: 12 },
        { x: 7, y: 12 },
        { x: 6, y: 12 }
      ]);
      state.setDirection({ x: 1, y: 0 });
      state.syncPendingDirection();

      dlc.syncSelectedPack();
      world.resetRocksFromCustom();
      world.spawnFood();

      const spawnState = round.createSpawnState();
      world.applySpawnState(spawnState);

      challenge.refreshHud();
      dlc.refreshHud();
      state.applyRoguelikeMutator();

      return round.createRoundMeta({
        baseSpeed: mode.getBaseSpeed(),
        currentChallenge: challenge.getCurrentChallenge(),
        hardcoreEnabled: mode.isHardcoreEnabled(),
        rogueSpeedDelta: state.getRogueSpeedDelta(),
        rogueStartShield: state.getRogueStartShield(),
        dlcPack: dlc.getPack(),
        isTimerMode: mode.isTimerMode(),
        getTimerStartBonusSeconds: mode.getTimerStartBonusSeconds,
        getModeTimeDuration: mode.getModeTimeDuration,
        missionOptions: mode.getMissionOptions(),
        shieldCap: dlc.getShieldCap ? dlc.getShieldCap() : 2
      });
    }

    return { prepareRound };
  }

  return { createResetPrepareModule };
})();
