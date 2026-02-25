window.SnakeModeRules = (() => {
  function createModeRulesModule({
    timedModeDuration,
    blitzModeDuration,
    runtime
  }) {
    function isTimerMode() {
      const mode = runtime.getMode();
      return mode === 'timed' || mode === 'blitz';
    }

    function getModeTimeDuration() {
      return runtime.getMode() === 'blitz' ? blitzModeDuration : timedModeDuration;
    }

    function getTimerStartBonusSeconds() {
      return runtime.getDlcPack() === 'chrono' ? 8 : 0;
    }

    function getTimeFruitBonusSeconds() {
      return runtime.getDlcPack() === 'chrono' ? 8 : 5;
    }

    function getCrownTimeBonusSeconds() {
      return runtime.getDlcPack() === 'chrono' ? 10 : 7;
    }

    function getBonusStep() {
      const currentChallenge = runtime.getCurrentChallenge();
      const base = currentChallenge.bonusStep || 50;
      const dlcDelta = runtime.getDlcPack() === 'frenzy' ? -20 : 0;
      return Math.max(20, base + dlcDelta);
    }

    return {
      isTimerMode,
      getModeTimeDuration,
      getTimerStartBonusSeconds,
      getTimeFruitBonusSeconds,
      getCrownTimeBonusSeconds,
      getBonusStep
    };
  }

  return { createModeRulesModule };
})();
