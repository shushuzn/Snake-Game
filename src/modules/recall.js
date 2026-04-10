/**
 * 每日召回系统 (Daily Recall System)
 * v1.5.0
 *
 * 功能：
 * - 沉寂天数追踪（1天/3天/7天）
 * - 回归奖励发放
 * - 连续登录额外奖励
 *
 * localStorage key: 'snake-recall-v1'
 */

window.SnakeRecall = (() => {
  const STORAGE_KEY = 'snake-recall-v1';
  const SCORE_KEY = 'snake-score';
  const SKILL_POINT_KEY = 'snake-skill-points';
  const ITEMS_KEY = 'snake-items';

  // 沉寂天数配置
  const INACTIVE_TIERS = {
    1: { minDays: 1, maxDays: 2, reward: { score: 50 }, tierName: '1天沉寂' },
    3: { minDays: 3, maxDays: 6, reward: { score: 200, items: 1 }, tierName: '3天沉寂' },
    7: { minDays: 7, reward: { score: 500, items: 3, skillPoints: 1 }, tierName: '7天沉寂' }
  };

  // 连续回归奖励配置
  const STREAK_REWARDS = {
    3: { loginDays: 3, reward: { score: 100 }, rewardName: '连续3天登录奖励' },
    7: { loginDays: 7, reward: { score: 300, skillPoints: 1 }, rewardName: '连续7天登录奖励' }
  };

  /**
   * 获取今日 UTC 日期种子（天数偏移）
   */
  function getTodaySeed() {
    const now = new Date();
    const utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    return Math.floor(utc.getTime() / (24 * 60 * 60 * 1000));
  }

  /**
   * 计算两个日期种子之间的天数差
   */
  function getDaysDiff(fromSeed, toSeed) {
    return toSeed - fromSeed;
  }

  /**
   * 加载召回数据
   */
  function loadData(storage) {
    const raw = storage.readJson(STORAGE_KEY, null);
    if (!raw) {
      return {
        lastLoginDay: null,
        totalLoginDays: 0,
        consecutiveLoginDays: 0,
        lastConsecutiveCheck: null,
        rewardsClaimed: {}
      };
    }
    return raw;
  }

  /**
   * 保存召回数据
   */
  function saveData(storage, data) {
    storage.writeJson(STORAGE_KEY, data);
  }

  /**
   * 处理玩家登录，更新登录状态
   * 返回沉寂天数信息
   */
  function handleLogin(storage) {
    const data = loadData(storage);
    const today = getTodaySeed();
    const lastLogin = data.lastLoginDay;

    // 计算沉寂天数
    let inactiveDays = 0;
    if (lastLogin !== null) {
      inactiveDays = getDaysDiff(lastLogin, today);
    }

    // 更新登录数据
    data.lastLoginDay = today;

    // 处理连续登录
    if (lastLogin !== null) {
      const daysSinceLastLogin = getDaysDiff(lastLogin, today);
      if (daysSinceLastLogin === 1) {
        // 连续登录
        data.consecutiveLoginDays += 1;
      } else if (daysSinceLastLogin > 1) {
        // 断开连续登录，重置计数
        data.consecutiveLoginDays = 1;
      }
      // daysSinceLastLogin === 0 表示同一天重复登录，不处理
    } else {
      // 首次登录
      data.consecutiveLoginDays = 1;
    }

    // 更新总登录天数（仅在新的UTC日期首次登录时增加）
    if (data.lastConsecutiveCheck !== today) {
      data.totalLoginDays += 1;
      data.lastConsecutiveCheck = today;
    }

    saveData(storage, data);

    return {
      inactiveDays: inactiveDays,
      consecutiveDays: data.consecutiveLoginDays,
      totalLoginDays: data.totalLoginDays,
      isFirstLogin: lastLogin === null
    };
  }

  /**
   * 获取沉寂状态
   */
  function getInactiveStatus(storage) {
    const data = loadData(storage);
    const today = getTodaySeed();
    let inactiveDays = 0;

    if (data.lastLoginDay !== null) {
      inactiveDays = getDaysDiff(data.lastLoginDay, today);
    }

    // 确定沉寂等级
    let tier = null;
    if (inactiveDays >= 7) {
      tier = INACTIVE_TIERS[7];
    } else if (inactiveDays >= 3) {
      tier = INACTIVE_TIERS[3];
    } else if (inactiveDays >= 1) {
      tier = INACTIVE_TIERS[1];
    }

    return {
      inactiveDays: inactiveDays,
      tier: tier,
      isInactive: inactiveDays >= 1,
      tierLevel: inactiveDays >= 7 ? 7 : inactiveDays >= 3 ? 3 : inactiveDays >= 1 ? 1 : 0
    };
  }

  /**
   * 获取连续登录奖励状态
   */
  function getStreakRewardStatus(storage) {
    const data = loadData(storage);
    const consecutiveDays = data.consecutiveLoginDays || 0;

    return {
      consecutiveDays: consecutiveDays,
      canClaim3Day: consecutiveDays >= 3 && !data.rewardsClaimed['streak_3'],
      canClaim7Day: consecutiveDays >= 7 && !data.rewardsClaimed['streak_7'],
      claimed3Day: !!data.rewardsClaimed['streak_3'],
      claimed7Day: !!data.rewardsClaimed['streak_7']
    };
  }

  /**
   * 发放召回奖励
   */
  function claimRecallReward(storage) {
    const status = getInactiveStatus(storage);

    if (!status.isInactive || !status.tier) {
      return { success: false, message: '无需召回奖励' };
    }

    const data = loadData(storage);
    const rewardKey = `recall_${status.tierLevel}`;

    // 检查是否已领取
    if (data.rewardsClaimed[rewardKey]) {
      return { success: false, message: '该召回奖励已领取' };
    }

    // 发放奖励
    const reward = status.tier.reward;
    const results = [];

    // 加分数
    if (reward.score) {
      const currentScore = parseInt(storage.readText(SCORE_KEY) || '0', 10);
      storage.writeText(SCORE_KEY, String(currentScore + reward.score));
      results.push(`+${reward.score}分数`);
    }

    // 加道具
    if (reward.items) {
      const currentItems = parseInt(storage.readText(ITEMS_KEY) || '0', 10);
      storage.writeText(ITEMS_KEY, String(currentItems + reward.items));
      results.push(`+${reward.items}道具`);
    }

    // 加技能点
    if (reward.skillPoints) {
      const currentPoints = parseInt(storage.readText(SKILL_POINT_KEY) || '0', 10);
      storage.writeText(SKILL_POINT_KEY, String(currentPoints + reward.skillPoints));
      results.push(`+${reward.skillPoints}技能点`);
    }

    // 标记已领取
    data.rewardsClaimed[rewardKey] = true;
    saveData(storage, data);

    return {
      success: true,
      tierLevel: status.tierLevel,
      tierName: status.tier.tierName,
      reward: reward,
      results: results,
      message: `领取成功！${status.tier.tierName}回归奖励：${results.join('、')}`
    };
  }

  /**
   * 领取连续登录奖励
   */
  function claimStreakReward(storage, streakLevel) {
    const status = getStreakRewardStatus(storage);
    const streakConfig = STREAK_REWARDS[streakLevel];

    if (!streakConfig) {
      return { success: false, message: '无效的连续登录等级' };
    }

    if (streakLevel === 3 && !status.canClaim3Day) {
      return { success: false, message: status.claimed3Day ? '3天连续奖励已领取' : '未达到连续3天登录' };
    }

    if (streakLevel === 7 && !status.canClaim7Day) {
      return { success: false, message: status.claimed7Day ? '7天连续奖励已领取' : '未达到连续7天登录' };
    }

    const data = loadData(storage);
    const rewardKey = `streak_${streakLevel}`;

    // 发放奖励
    const reward = streakConfig.reward;
    const results = [];

    if (reward.score) {
      const currentScore = parseInt(storage.readText(SCORE_KEY) || '0', 10);
      storage.writeText(SCORE_KEY, String(currentScore + reward.score));
      results.push(`+${reward.score}分数`);
    }

    if (reward.skillPoints) {
      const currentPoints = parseInt(storage.readText(SKILL_POINT_KEY) || '0', 10);
      storage.writeText(SKILL_POINT_KEY, String(currentPoints + reward.skillPoints));
      results.push(`+${reward.skillPoints}技能点`);
    }

    // 标记已领取
    data.rewardsClaimed[rewardKey] = true;
    saveData(storage, data);

    return {
      success: true,
      streakLevel: streakLevel,
      rewardName: streakConfig.rewardName,
      reward: reward,
      results: results,
      message: `领取成功！${streakConfig.rewardName}：${results.join('、')}`
    };
  }

  /**
   * 获取召回面板显示信息
   */
  function getRecallPanelInfo(storage) {
    const loginStatus = handleLogin(storage);
    const inactiveStatus = getInactiveStatus(storage);
    const streakStatus = getStreakRewardStatus(storage);

    return {
      inactiveDays: loginStatus.inactiveDays,
      inactiveStatus: inactiveStatus,
      streakStatus: streakStatus,
      showPanel: loginStatus.isFirstLogin || inactiveStatus.isInactive,
      tierName: inactiveStatus.tier ? inactiveStatus.tier.tierName : null
    };
  }

  /**
   * 创建召回模块
   */
  function createRecallModule({ storage }) {
    return {
      handleLogin: () => handleLogin(storage),
      getInactiveStatus: () => getInactiveStatus(storage),
      getStreakRewardStatus: () => getStreakRewardStatus(storage),
      claimRecallReward: () => claimRecallReward(storage),
      claimStreakReward: (level) => claimStreakReward(storage, level),
      getRecallPanelInfo: () => getRecallPanelInfo(storage),
      getTodaySeed: () => getTodaySeed(),
      INACTIVE_TIERS: INACTIVE_TIERS,
      STREAK_REWARDS: STREAK_REWARDS
    };
  }

  return { createRecallModule };
})();
