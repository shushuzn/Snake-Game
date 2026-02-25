(function initSnakeModes(global) {
  const missionOptions = [120, 180, 240, 300];

  const dailyChallengeOptions = [
    { id: 'fast-start', label: '极速热身', speedDelta: -15 },
    { id: 'bonus-rush', label: '多金模式', bonusStep: 30 },
    { id: 'tough-skin', label: '坚韧模式', startShield: 1 },
    { id: 'no-rocks', label: '净空模式', noRocks: true }
  ];

  function getLocalDateSeed(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return Number(`${y}${m}${d}`);
  }


  function formatLocalDateLabel(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${y}-${m}-${d} ${weekdays[date.getDay()]}`;
  }

  function formatRelativeLocalDateLabel(offsetDays = 0, date = new Date()) {
    const shiftedDate = new Date(date);
    shiftedDate.setDate(shiftedDate.getDate() + offsetDays);
    return formatLocalDateLabel(shiftedDate);
  }

  function pickDailyChallenge(date = new Date()) {
    const dateSeed = getLocalDateSeed(date);
    return dailyChallengeOptions[dateSeed % dailyChallengeOptions.length];
  }

  function pickDailyChallengeByOffset(offsetDays = 0, date = new Date()) {
    const shiftedDate = new Date(date);
    shiftedDate.setDate(shiftedDate.getDate() + offsetDays);
    return pickDailyChallenge(shiftedDate);
  }

  function getChallengeRefreshCountdown(now = new Date()) {
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);
    const diffMs = Math.max(0, next.getTime() - now.getTime());
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
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
    getLocalDateSeed,
    formatLocalDateLabel,
    formatRelativeLocalDateLabel,
    pickDailyChallenge,
    pickDailyChallengeByOffset,
    getChallengeRefreshCountdown,
    describeChallenge,
    getModeLabel
  };
})(window);
