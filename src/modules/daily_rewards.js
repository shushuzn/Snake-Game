/**
 * Daily Rewards System
 * 每日签到奖励系统
 * 
 * Features:
 * - 7-day reward cycle
 * - Streak tracking
 * - Experience rewards
 */

window.SnakeDailyRewards = (() => {
  const STORAGE_KEY = 'snake-daily-rewards';

  // 7-day reward cycle rewards (experience only)
  const DAILY_REWARDS = [
    { day: 1, exp: 10 },
    { day: 2, exp: 15 },
    { day: 3, exp: 20 },
    { day: 4, exp: 30 },
    { day: 5, exp: 40 },
    { day: 6, exp: 60 },
    { day: 7, exp: 100 }
  ];

  function getTodaySeed() {
    const now = new Date();
    const utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    return Math.floor(utc.getTime() / (24 * 60 * 60 * 1000));
  }

  function loadData(storage) {
    const raw = storage.readJson(STORAGE_KEY, null);
    if (!raw) {
      return {
        lastClaimDay: null,
        streak: 0,
        totalClaims: 0,
        lastClaimDate: null
      };
    }
    return raw;
  }

  function saveData(storage, data) {
    storage.writeJson(STORAGE_KEY, data);
  }

  function getStreakStatus(storage) {
    const data = loadData(storage);
    const today = getTodaySeed();
    const lastClaim = data.lastClaimDay;
    
    if (lastClaim === null) {
      return { streak: 0, canClaim: true, streakBroken: false };
    }
    
    const daysDiff = today - lastClaim;
    
    if (daysDiff === 0) {
      // Already claimed today
      return { 
        streak: data.streak, 
        canClaim: false, 
        streakBroken: false,
        nextClaimTime: getNextClaimTime()
      };
    }
    
    if (daysDiff === 1) {
      // Continue streak
      return { 
        streak: data.streak, 
        canClaim: true, 
        streakBroken: false 
      };
    }
    
    // Streak broken
    return { 
      streak: 0, 
      canClaim: true, 
      streakBroken: true 
    };
  }

  function getNextClaimTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
  }

  function claimReward(storage) {
    const data = loadData(storage);
    const today = getTodaySeed();
    const status = getStreakStatus(storage);
    
    if (!status.canClaim) {
      return { success: false, message: '今日已领取' };
    }
    
    // Calculate streak
    let newStreak = status.streakBroken ? 1 : status.streak + 1;
    if (newStreak > 7) {
      newStreak = 1; // Cycle back to day 1
    }
    
    // Get reward for current day
    const reward = DAILY_REWARDS[newStreak - 1];
    
    // Update data
    data.lastClaimDay = today;
    data.lastClaimDate = today;
    data.streak = newStreak;
    data.totalClaims += 1;
    saveData(storage, data);
    
    // Add experience
    const expResult = addExperience(storage, reward.exp);
    
    return {
      success: true,
      streak: newStreak,
      day: newStreak,
      reward: reward,
      expGained: reward.exp,
      levelUp: expResult.leveledUp,
      newLevel: expResult.newLevel || expResult.currentLevel,
      message: `领取成功！第${newStreak}天奖励，+${reward.exp}经验值`
    };
  }

  function addExperience(storage, exp) {
    const expKey = 'snake-player-exp';
    const currentExp = parseInt(storage.readText(expKey) || '0', 10);
    const newExp = currentExp + exp;
    storage.writeText(expKey, String(newExp));
    
    // Check level up
    const level = calculateLevel(newExp);
    const previousLevel = calculateLevel(currentExp);
    
    if (level > previousLevel) {
      return { leveledUp: true, newLevel: level, expToNext: getExpForLevel(level + 1) - newExp };
    }
    
    return { leveledUp: false, currentLevel: level, expToNext: getExpForLevel(level + 1) - newExp };
  }

  function calculateLevel(exp) {
    // Simple level calculation: level = sqrt(exp / 10)
    return Math.floor(Math.sqrt(exp / 10)) + 1;
  }

  function getExpForLevel(level) {
    // Exp needed to reach level: (level-1)^2 * 10
    return Math.pow(level - 1, 2) * 10;
  }

  function getPlayerLevel(storage) {
    const expKey = 'snake-player-exp';
    const exp = parseInt(storage.readText(expKey) || '0', 10);
    return calculateLevel(exp);
  }

  function getExpProgress(storage) {
    const expKey = 'snake-player-exp';
    const exp = parseInt(storage.readText(expKey) || '0', 10);
    const level = calculateLevel(exp);
    const currentLevelExp = getExpForLevel(level);
    const nextLevelExp = getExpForLevel(level + 1);
    const progress = ((exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    
    return {
      level,
      exp,
      currentLevelExp,
      nextLevelExp,
      progress: Math.min(100, Math.max(0, progress)),
      expToNext: nextLevelExp - exp
    };
  }

  function createDailyRewardsModule({ storage }) {
    return {
      canClaim: () => getStreakStatus(storage).canClaim,
      getStreakStatus: () => getStreakStatus(storage),
      claimReward: () => claimReward(storage),
      getPlayerLevel: () => getPlayerLevel(storage),
      getExpProgress: () => getExpProgress(storage),
      getTodaySeed: () => getTodaySeed(),
      DAILY_REWARDS
    };
  }

  return { createDailyRewardsModule };
})();
