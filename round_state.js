window.SnakeRoundState = (() => {
  function createRoundStateModule() {
    function createSpawnState() {
      return {
        bonusFood: null,
        bonusExpireAt: 0,
        shieldFood: null,
        shieldExpireAt: 0,
        boostFood: null,
        boostExpireAt: 0,
        timeFood: null,
        timeExpireAt: 0,
        freezeFood: null,
        freezeExpireAt: 0,
        phaseFood: null,
        phaseExpireAt: 0,
        crownFood: null,
        crownExpireAt: 0,
        magnetFood: null,
        magnetExpireAt: 0,
        comboFood: null,
        comboExpireAt: 0
      };
    }

    function createRoundMeta(params) {
      const {
        baseSpeed,
        currentChallenge,
        hardcoreEnabled,
        rogueSpeedDelta,
        rogueStartShield,
        dlcPack,
        isTimerMode,
        getTimerStartBonusSeconds,
        getModeTimeDuration,
        missionOptions,
        shieldCap = 2
      } = params;
      const startBonusSeconds = isTimerMode ? getTimerStartBonusSeconds() : 0;
      const hardcoreDelta = hardcoreEnabled ? -20 : 0;
      const speed = Math.max(45, baseSpeed + (currentChallenge.speedDelta || 0) + hardcoreDelta + rogueSpeedDelta);
      let shields = hardcoreEnabled ? 0 : (currentChallenge.startShield || 0);
      if (!hardcoreEnabled) {
        shields = Math.min(shieldCap, shields + rogueStartShield);
        if (dlcPack === 'guardian') shields = Math.min(shieldCap, shields + 1);
      }
      const missionTarget = missionOptions[Math.floor(Math.random() * missionOptions.length)];
      return {
        startBonusSeconds,
        remainingTime: getModeTimeDuration() + startBonusSeconds,
        speed,
        shields,
        missionTarget,
        score: 0,
        running: false,
        paused: false,
        level: 1,
        levelTargetScore: 100,
        lastTickMs: 0,
        combo: 1,
        roundMaxCombo: 1,
        lastEatMs: 0,
        missionAchieved: false,
        playCountedThisRound: false,
        scoreMultiplier: 1,
        multiplierExpireAt: 0,
        freezeUntil: 0,
        phaseUntil: 0,
        magnetUntil: 0,
        comboGuardUntil: 0,
        roundFoodsEaten: 0
      };
    }

    return {
      createSpawnState,
      createRoundMeta
    };
  }

  return { createRoundStateModule };
})();
