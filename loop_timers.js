window.SnakeLoopTimers = (() => {
  function createLoopTimersModule({ showOverlay, getEffectiveSpeed, onTick, isPaused, isRunning }) {
    let loopTimer = null;
    let countdownTimer = null;

    function stopAll() {
      clearInterval(loopTimer);
      clearInterval(countdownTimer);
      loopTimer = null;
      countdownTimer = null;
    }

    function startLoop() {
      stopAll();
      loopTimer = setInterval(onTick, getEffectiveSpeed());
    }

    function startCountdown(onDone) {
      clearInterval(countdownTimer);
      let count = 3;
      showOverlay(`<p><strong>${count}</strong></p><p>准备开始</p>`);
      countdownTimer = setInterval(() => {
        if (isPaused() || !isRunning()) {
          clearInterval(countdownTimer);
          countdownTimer = null;
          return;
        }
        count -= 1;
        if (count <= 0) {
          clearInterval(countdownTimer);
          countdownTimer = null;
          onDone();
          return;
        }
        showOverlay(`<p><strong>${count}</strong></p><p>准备开始</p>`);
      }, 550);
    }

    return {
      startLoop,
      startCountdown,
      stopAll
    };
  }

  return { createLoopTimersModule };
})();
