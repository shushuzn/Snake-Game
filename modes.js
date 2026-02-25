(function initSnakeModes(global) {
  const missionOptions = [120, 180, 240, 300];

  const dailyChallengeOptions = [
    { id: 'fast-start', label: '极速热身', speedDelta: -15 },
    { id: 'bonus-rush', label: '多金模式', bonusStep: 30 },
    { id: 'tough-skin', label: '坚韧模式', startShield: 1 },
    { id: 'no-rocks', label: '净空模式', noRocks: true },
    { id: 'blitz-day', label: '冲刺日', forceMode: 'blitz' }
  ];

  const weeklyThemes = {
    weekday: {
      id: 'weekday-steady',
      label: '工作日稳态',
      summary: '节奏更稳，适合持续推进',
      merge(baseChallenge) {
        const merged = { ...baseChallenge };
        if (merged.id === 'fast-start') {
          merged.speedDelta = -8;
          merged.label = '稳态热身';
        }
        if (!merged.startShield) merged.startShield = 1;
        return merged;
      }
    },
    weekend: {
      id: 'weekend-double',
      label: '周末双倍率',
      summary: '全局得分 x2，冲分窗口更高',
      merge(baseChallenge) {
        return {
          ...baseChallenge,
          scoreFactor: 2,
          bonusStep: Math.max(20, (baseChallenge.bonusStep || 50) - 10)
        };
      }
    }
  };

  const challengeRuleDescribers = [
    (challenge) => (challenge.scoreFactor && challenge.scoreFactor > 1 ? `本局得分 x${challenge.scoreFactor}` : ''),
    (challenge) => (challenge.noRocks ? '本局不生成障碍' : ''),
    (challenge) => (challenge.startShield ? `开局护盾 +${challenge.startShield}` : ''),
    (challenge) => (challenge.bonusStep ? `奖励果刷新更频繁（每 ${challenge.bonusStep} 分）` : ''),
    (challenge) => (challenge.forceMode === 'blitz' ? '本日锁定为冲刺 45 秒模式' : ''),
    (challenge) => {
      if (!challenge.speedDelta) return '';
      return challenge.speedDelta < 0 ? `初始速度提升 ${Math.abs(challenge.speedDelta)}` : `初始速度降低 ${challenge.speedDelta}`;
    }
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

  function getWeeklyTheme(date = new Date()) {
    const day = date.getDay();
    return day === 0 || day === 6 ? weeklyThemes.weekend : weeklyThemes.weekday;
  }

  function applyWeeklyTheme(baseChallenge, date = new Date()) {
    const theme = getWeeklyTheme(date);
    const themed = theme.merge(baseChallenge);
    return {
      ...themed,
      weeklyThemeId: theme.id,
      weeklyThemeLabel: theme.label,
      weeklyThemeSummary: theme.summary,
      label: `${theme.label}·${themed.label || baseChallenge.label}`
    };
  }

  function pickDailyChallenge(date = new Date()) {
    const dateSeed = getLocalDateSeed(date);
    const baseChallenge = dailyChallengeOptions[dateSeed % dailyChallengeOptions.length];
    return applyWeeklyTheme(baseChallenge, date);
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
    const detailLines = challengeRuleDescribers
      .map((describe) => describe(challenge))
      .filter(Boolean);
    if (challenge.weeklyThemeSummary) {
      detailLines.unshift(`周主题：${challenge.weeklyThemeSummary}`);
    }
    return detailLines.length ? detailLines.join('；') : '标准规则';
  }

  function getModeLabel(mode) {
    if (mode === 'timed') return '限时模式';
    if (mode === 'blitz') return '冲刺模式';
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
    getWeeklyTheme,
    pickDailyChallenge,
    pickDailyChallengeByOffset,
    getChallengeRefreshCountdown,
    describeChallenge,
    getModeLabel
  };
})(window);
