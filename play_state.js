window.SnakePlayState = (() => {
  function createPlayStateModule({
    runtime,
    ui,
    timers,
    stats,
    onCountdownDone,
    onResume
  }) {
    function startGameIfNeeded() {
      if (runtime.isRunning() && !runtime.isPaused()) return;
      if (!runtime.isRunning()) {
        runtime.setRunning(true);
        runtime.setPaused(false);
        if (!runtime.isPlayCountedThisRound()) {
          stats.incrementTotalPlays();
          runtime.setPlayCountedThisRound(true);
        }
        ui.setPauseButtonPausedLabel();
        timers.startCountdown(() => {
          if (runtime.isPaused() || !runtime.isRunning()) return;
          ui.hideOverlay();
          onCountdownDone();
        });
        return;
      }
      if (runtime.isPaused()) {
        runtime.setPaused(false);
        ui.hideOverlay();
        ui.setPauseButtonPausedLabel();
        onResume();
      }
    }

    function togglePause() {
      if (!runtime.isRunning()) return;
      if (runtime.isPaused()) {
        startGameIfNeeded();
        return;
      }
      runtime.setPaused(true);
      timers.stopAll();
      ui.setPauseButtonResumeLabel();
      ui.showOverlay('<p><strong>已暂停</strong></p><p>按空格 / P 或“继续”恢复游戏</p>');
    }

    return {
      startGameIfNeeded,
      togglePause
    };
  }

  return { createPlayStateModule };
})();
