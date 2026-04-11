/**
 * 赛季奖励预览系统 v1.7.0
 * 展示赛季奖励内容和预览
 */
(function() {
  'use strict';

  // 奖励层级配置
  const REWARD_TIERS = [
    { tier: 1, points: 100, rewards: { coins: 50, experience: 20, badge: null } },
    { tier: 2, points: 300, rewards: { coins: 100, experience: 40, badge: 'bronze' } },
    { tier: 3, points: 600, rewards: { coins: 200, experience: 80, badge: 'silver' } },
    { tier: 4, points: 1000, rewards: { coins: 500, experience: 150, badge: 'gold' } },
    { tier: 5, points: 1500, rewards: { coins: 1000, experience: 300, badge: 'diamond' } }
  ];

  function createSeasonRewardsPreviewModule({ storage }) {
    if (!storage) return null;

    // 获取当前赛季信息
    function getCurrentSeasonInfo() {
      const now = new Date();
      const seasonNumber = Math.floor(now.getMonth()) + 1;
      const year = now.getFullYear();

      // 计算赛季剩余天数
      const lastDay = new Date(year, now.getMonth() + 1, 0);
      const daysLeft = lastDay.getDate() - now.getDate();

      return {
        seasonNumber,
        year,
        daysLeft: Math.max(0, daysLeft),
        month: now.getMonth() + 1
      };
    }

    // 获取玩家赛季积分
    function getSeasonPoints() {
      return storage.get('seasonPoints') || 0;
    }

    // 获取玩家已领取的奖励
    function getClaimedRewards() {
      return storage.get('claimedSeasonRewards') || [];
    }

    // 获取下一档可领取奖励
    function getNextReward() {
      const points = getSeasonPoints();
      const claimed = getClaimedRewards();

      for (const tier of REWARD_TIERS) {
        if (points >= tier.points && !claimed.includes(tier.tier)) {
          return tier;
        }
      }

      return null;
    }

    // 获取所有奖励状态
    function getAllRewardsStatus() {
      const points = getSeasonPoints();
      const claimed = getClaimedRewards();

      return REWARD_TIERS.map(tier => ({
        ...tier,
        earned: points >= tier.points,
        claimed: claimed.includes(tier.tier),
        current: points >= tier.points && points < (REWARD_TIERS[REWARD_TIERS.indexOf(tier) + 1]?.points || Infinity)
      }));
    }

    // 获取赛季排名
    function getSeasonRank() {
      const points = getSeasonPoints();

      // 根据积分计算排名（简化版）
      let rank = '青铜';
      if (points >= 1500) rank = '钻石';
      else if (points >= 1000) rank = '黄金';
      else if (points >= 600) rank = '白银';
      else if (points >= 300) rank = '青铜';

      return {
        rank,
        points,
        tier: REWARD_TIERS.find(t => t.points > points)?.tier || REWARD_TIERS.length
      };
    }

    // 获取进度百分比
    function getProgressToNextTier() {
      const points = getSeasonPoints();

      for (let i = 0; i < REWARD_TIERS.length; i++) {
        const tier = REWARD_TIERS[i];
        if (points < tier.points) {
          const prevPoints = i > 0 ? REWARD_TIERS[i - 1].points : 0;
          const progress = (points - prevPoints) / (tier.points - prevPoints);
          return {
            progress: Math.max(0, Math.min(1, progress)),
            nextTier: tier,
            pointsNeeded: tier.points - points
          };
        }
      }

      // 已达到最高
      return {
        progress: 1,
        nextTier: null,
        pointsNeeded: 0
      };
    }

    // 领取奖励
    function claimReward(tier) {
      const reward = REWARD_TIERS.find(t => t.tier === tier);
      if (!reward) return { success: false, message: '无效的奖励层级' };

      const points = getSeasonPoints();
      if (points < reward.points) {
        return { success: false, message: '积分不足' };
      }

      const claimed = getClaimedRewards();
      if (claimed.includes(tier)) {
        return { success: false, message: '已领取过该奖励' };
      }

      // 添加奖励
      const coins = storage.get('coins') || 0;
      const experience = storage.get('experience') || 0;

      storage.set('coins', coins + reward.rewards.coins);
      storage.set('experience', experience + reward.rewards.experience);

      // 标记已领取
      claimed.push(tier);
      storage.set('claimedSeasonRewards', claimed);

      return {
        success: true,
        message: `领取成功！获得 ${reward.rewards.coins} 金币 + ${reward.rewards.experience} 经验`,
        rewards: reward.rewards
      };
    }

    return {
      getCurrentSeasonInfo,
      getSeasonPoints,
      getClaimedRewards,
      getNextReward,
      getAllRewardsStatus,
      getSeasonRank,
      getProgressToNextTier,
      claimReward,
      REWARD_TIERS
    };
  }

  // 暴露到全局
  window.SnakeSeasonRewardsPreview = {
    createSeasonRewardsPreviewModule
  };
})();
