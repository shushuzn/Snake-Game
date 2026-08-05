window.SnakePlayState = (() => {
  function createPlayStateModule({
    runtime,
    ui,
    timers,
    stats,
    onCountdownDone,
    onResume,
    onRestart,
    onToggleMute
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
      ui.showOverlay(`
        <p><strong>⏸ 已暂停</strong></p>
        <div style="display:flex;gap:10px;justify-content:center;margin:14px 0;flex-wrap:wrap;">
          <button id="pauseResumeBtn" type="button" class="secondary">▶ 继续</button>
          <button id="pauseRestartBtn" type="button" class="secondary">🔄 重新开始</button>
          <button id="pauseMuteBtn" type="button" class="secondary">🔊 音效开关</button>
        </div>
        <p style="font-size:12px;color:#888;">空格 / P 恢复游戏</p>`);
      // 绑定暂停菜单按钮 (overlay.innerHTML 同步渲染, DOM 立即可用)
      const resumeBtn = document.getElementById('pauseResumeBtn');
      if (resumeBtn) resumeBtn.addEventListener('click', () => startGameIfNeeded());
      const restartBtn = document.getElementById('pauseRestartBtn');
      if (restartBtn && typeof onRestart === 'function') {
        restartBtn.addEventListener('click', () => onRestart());
      }
      const muteBtnEl = document.getElementById('pauseMuteBtn');
      if (muteBtnEl && typeof onToggleMute === 'function') {
        muteBtnEl.addEventListener('click', () => onToggleMute());
      }
    }

    return {
      startGameIfNeeded,
      togglePause
    };
  }

  return { createPlayStateModule };
})();
