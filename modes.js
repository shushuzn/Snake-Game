(function initSnakeModes(global) {
  const missionOptions = [120, 180, 240, 300];

  const dailyChallengeOptions = [
    { id: 'fast-start', label: '极速热身', speedDelta: -15 },
    { id: 'bonus-rush', label: '多金模式', bonusStep: 30 },
    { id: 'tough-skin', label: '坚韧模式', startShield: 1 },
    { id: 'no-rocks', label: '净空模式', noRocks: true }
  ];

  function pickDailyChallenge(date = new Date()) {
    const dateSeed = Number(date.toISOString().slice(0, 10).replaceAll('-', ''));
    return dailyChallengeOptions[dateSeed % dailyChallengeOptions.length];
  }


  function describeChallenge(challenge) {
    if (!challenge || typeof challenge !== 'object') return '标准规则';
    if (challenge.noRocks) return '本局不生成障碍';
    if (challenge.startShield) return `开局护盾 +${challenge.startShield}`;
    if (challenge.bonusStep) return `奖励果刷新更频繁（每 ${challenge.bonusStep} 分）`;
    if (challenge.speedDelta) return challenge.speedDelta < 0 ? `初始速度提升 ${Math.abs(challenge.speedDelta)}` : `初始速度降低 ${challenge.speedDelta}`;
    return '标准规则';
  }

  function getModeLabel(mode) {
    if (mode === 'timed') return '限时模式';
    if (mode === 'endless') return '无尽模式';
    if (mode === 'roguelike') return '肉鸽模式';
    return '经典模式';
  }

  global.SnakeModes = {
    missionOptions,
    dailyChallengeOptions,
    pickDailyChallenge,
    describeChallenge,
    getModeLabel
  };
})(window);
