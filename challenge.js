window.SnakeChallenge = (() => {
  function createChallengeModule({
    snakeModes,
    elements,
    controls,
    runtime,
    setCurrentChallenge
  }) {
    let currentChallengeSeed = 0;
    let pendingChallengeSeed = 0;
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


    function parseSeedToDate(seed) {
      const normalized = String(seed || '');
      if (!/^\d{8}$/.test(normalized)) return new Date();
      const y = Number(normalized.slice(0, 4));
      const m = Number(normalized.slice(4, 6)) - 1;
      const d = Number(normalized.slice(6, 8));
      return new Date(y, m, d);
    }

    function getCurrentChallengeDate() {
      return currentChallengeSeed ? parseSeedToDate(currentChallengeSeed) : new Date();
    }

    function updateCountdownOnly() {
      const text = snakeModes.getChallengeRefreshCountdown();
      if (text === lastChallengeCountdownText) return;
      lastChallengeCountdownText = text;
      elements.challengeRefreshEl.textContent = text;
    }

    function refreshHud() {
      const currentDate = getCurrentChallengeDate();
      const challengeBundle = snakeModes.getDailyChallengeBundle(currentDate);
      const currentChallenge = runtime.getCurrentChallenge() || challengeBundle.current;
      const nextChallenge = challengeBundle.next;
      elements.challengeEl.textContent = currentChallenge.label;
      elements.challengeDetailEl.textContent = snakeModes.describeChallenge(currentChallenge);
      elements.challengeNextEl.textContent = nextChallenge.label;
      elements.challengeNextEl.title = snakeModes.describeChallenge(nextChallenge);
      elements.challengeNextDateEl.textContent = challengeBundle.nextDateLabel;
      elements.challengeDateEl.textContent = challengeBundle.currentDateLabel;
      applyControlLocks(currentChallenge);
      elements.challengeRefreshEl.title = pendingChallengeSeed
        ? '当前对局进行中：跨天后将于本局结束后切换新挑战'
        : '';
      lastChallengeCountdownText = '';
      updateCountdownOnly();
    }

    function selectDailyChallenge(date = new Date()) {
      const picked = snakeModes.pickDailyChallenge(date);
      setCurrentChallenge(picked);
      currentChallengeSeed = snakeModes.getLocalDateSeed(date);
      pendingChallengeSeed = 0;
      refreshHud();
    }

    function refreshByDateIfNeeded() {
      const latestSeed = snakeModes.getLocalDateSeed();
      if (latestSeed === currentChallengeSeed) {
        updateCountdownOnly();
        return;
      }
      if (runtime.isRunning()) {
        pendingChallengeSeed = latestSeed;
        refreshHud();
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
