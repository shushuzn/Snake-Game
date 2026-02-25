window.SnakeChallenge = (() => {
  function createChallengeModule({
    snakeModes,
    elements,
    controls,
    runtime,
    setCurrentChallenge
  }) {
    let currentChallengeSeed = 0;
    let lastChallengeCountdownText = '';
    let refreshTimer = null;

    function applyControlLocks(currentChallenge) {
      const lockRocks = Boolean(currentChallenge.noRocks);
      if (lockRocks) {
        if (!controls.obstacleModeInput.disabled) runtime.setObstacleModePreference(controls.obstacleModeInput.checked);
        controls.obstacleModeInput.checked = false;
        controls.obstacleModeInput.disabled = true;
        controls.obstacleModeInput.title = '今日挑战：净空模式（障碍规则已锁定为关闭）';
      } else {
        controls.obstacleModeInput.disabled = false;
        controls.obstacleModeInput.title = '';
        controls.obstacleModeInput.checked = runtime.getObstacleModePreference();
      }

      const forceMode = currentChallenge.forceMode;
      if (forceMode) {
        if (!controls.modeSelect.disabled) runtime.setModePreference(controls.modeSelect.value);
        controls.modeSelect.disabled = true;
        if (runtime.isRunning()) {
          controls.modeSelect.title = `今日挑战：下一局将锁定为${snakeModes.getModeLabel(forceMode)}`;
          return;
        }
        controls.modeSelect.value = forceMode;
        runtime.syncMode(forceMode);
        controls.modeSelect.title = `今日挑战：模式锁定为${snakeModes.getModeLabel(forceMode)}`;
        return;
      }

      if (controls.modeSelect.disabled && !runtime.isRunning()) {
        const preferredMode = runtime.getModePreference();
        controls.modeSelect.value = preferredMode;
        runtime.syncMode(preferredMode);
      }
      controls.modeSelect.disabled = false;
      controls.modeSelect.title = '';
    }

    function updateCountdownOnly() {
      const text = snakeModes.getChallengeRefreshCountdown();
      if (text === lastChallengeCountdownText) return;
      lastChallengeCountdownText = text;
      elements.challengeRefreshEl.textContent = text;
    }

    function refreshHud() {
      const currentChallenge = runtime.getCurrentChallenge();
      elements.challengeEl.textContent = currentChallenge.label;
      elements.challengeDetailEl.textContent = snakeModes.describeChallenge(currentChallenge);
      const nextChallenge = snakeModes.pickDailyChallengeByOffset(1);
      elements.challengeNextEl.textContent = nextChallenge.label;
      elements.challengeNextEl.title = snakeModes.describeChallenge(nextChallenge);
      elements.challengeNextDateEl.textContent = snakeModes.formatRelativeLocalDateLabel(1);
      elements.challengeDateEl.textContent = snakeModes.formatLocalDateLabel();
      applyControlLocks(currentChallenge);
      lastChallengeCountdownText = '';
      updateCountdownOnly();
    }

    function selectDailyChallenge() {
      const picked = snakeModes.pickDailyChallenge();
      setCurrentChallenge(picked);
      currentChallengeSeed = snakeModes.getLocalDateSeed();
      refreshHud();
    }

    function refreshByDateIfNeeded() {
      const latestSeed = snakeModes.getLocalDateSeed();
      if (latestSeed === currentChallengeSeed) {
        updateCountdownOnly();
        return;
      }
      selectDailyChallenge();
    }

    function startTicker() {
      clearInterval(refreshTimer);
      refreshByDateIfNeeded();
      refreshTimer = setInterval(refreshByDateIfNeeded, 1000);
    }

    function stopTicker() {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }

    return {
      refreshHud,
      selectDailyChallenge,
      refreshByDateIfNeeded,
      startTicker,
      stopTicker
    };
  }

  return { createChallengeModule };
})();
