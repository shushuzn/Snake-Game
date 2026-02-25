window.SnakeResetFlow = (() => {
  function createResetFlowModule({
    runtime,
    ui,
    timers,
    challenge,
    render
  }) {
    function applyResetRound({ roundMeta, snakeLength, showStartOverlay }) {
      runtime.applyRoundMeta(roundMeta);
      timers.stopAll();
      challenge.stopTicker();

      ui.setPauseButtonPausedLabel();
      ui.setScore(0);
      ui.setLength(snakeLength);
      ui.setCombo(1);
      ui.setShield(runtime.getShields());
      ui.setMissionTarget(runtime.getMissionTarget());
      ui.setMultiplier(1);
      ui.refreshStateText();

      challenge.startTicker();
      ui.updateTimeText();
      ui.updateLevelText();
      if (showStartOverlay) ui.showStartOverlay();
      render.draw();
    }

    return { applyResetRound };
  }

  return { createResetFlowModule };
})();
