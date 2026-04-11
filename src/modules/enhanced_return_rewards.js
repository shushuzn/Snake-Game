/**
 * 增强回流奖励系统 v1.8.0
 * 丰富的回流奖励内容，提升回流价值感
 */
(function() {
  'use strict';

  // 回流天数配置
  const RETURN_TIERS = [
    { minDays: 1, maxDays: 3, tier: 'bronze', coins: 30, experience: 15, items: [] },
    { minDays: 4, maxDays: 7, tier: 'silver', coins: 60, experience: 30, items: ['shield'] },
    { minDays: 8, maxDays: 14, tier: 'gold', coins: 100, experience: 50, items: ['shield', 'freeze'] },
    { minDays: 15, maxDays: 30, tier: 'platinum', coins: 200, experience: 100, items: ['shield', 'freeze', 'boost'] },
    { minDays: 31, maxDays: Infinity, tier: 'diamond', coins: 500, experience: 250, items: ['shield', 'freeze', 'boost', 'magnet'] }
  ];

  // 连续回流奖励
  const CONSECUTIVE_BONUS = 1.2; // 连续回流增加 20% 奖励

  function createEnhancedReturnRewardsModule({ storage }) {
    if (!storage) return null;

    // 获取回流天数
    function getReturnDays() {
      const lastActive = storage.get('lastActiveTime') || Date.now();
      return Math.floor((Date.now() - lastActive) / (1000 * 60 * 60 * 24));
    }

    // 获取回流等级
    function getReturnTier(days) {
      const tier = RETURN_TIERS.find(t => days >= t.minDays && days <= t.maxDays);
      return tier || RETURN_TIERS[0];
    }

    // 获取回流奖励
    function getReturnReward(days) {
      const tier = getReturnTier(days);

      // 检查连续回流次数
      const consecutiveReturns = storage.get('consecutiveReturns') || 0;
      const lastReturnDate = storage.get('lastReturnDate') || null;
      const today = new Date().toISOString().split('T')[0];

      let bonusMultiplier = 1;
      if (lastReturnDate) {
        const lastDate = new Date(lastReturnDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
          // 7天内回流算连续
          bonusMultiplier = CONSECUTIVE_BONUS;
          storage.set('consecutiveReturns', consecutiveReturns + 1);
        } else {
          storage.set('consecutiveReturns', 1);
        }
      } else {
        storage.set('consecutiveReturns', 1);
      }

      storage.set('lastReturnDate', today);

      const coins = Math.floor(tier.coins * bonusMultiplier);
      const experience = Math.floor(tier.experience * bonusMultiplier);

      return {
        tier: tier.tier,
        days,
        coins,
        experience,
        items: tier.items,
        bonusMultiplier,
        consecutiveReturns: storage.get('consecutiveReturns')
      };
    }

    // 获取奖励预览
    function getRewardPreview() {
      const days = getReturnDays();
      const tier = getReturnTier(days);

      return {
        currentTier: tier.tier,
        daysUntilNextTier: getDaysUntilNextTier(days),
        nextTier: getNextTier(days),
        rewardPreview: {
          coins: tier.coins,
          experience: tier.experience,
          items: tier.items
        }
      };
    }

    // 获取距离下一等级天数
    function getDaysUntilNextTier(currentDays) {
      const currentTierIndex = RETURN_TIERS.findIndex(t => currentDays >= t.minDays && currentDays <= t.maxDays);
      const nextTier = RETURN_TIERS[currentTierIndex + 1];

      if (!nextTier) return null;
      return nextTier.minDays - currentDays;
    }

    // 获取下一等级
    function getNextTier(currentDays) {
      const currentTierIndex = RETURN_TIERS.findIndex(t => currentDays >= t.minDays && currentDays <= t.maxDays);
      return RETURN_TIERS[currentTierIndex + 1]?.tier || null;
    }

    // 领取奖励
    function claimReturnReward() {
      const days = getReturnDays();
      const reward = getReturnReward(days);

      // 添加金币和经验
      const coins = storage.get('coins') || 0;
      const experience = storage.get('experience') || 0;

      storage.set('coins', coins + reward.coins);
      storage.set('experience', experience + reward.experience);

      // 添加道具
      const items = storage.get('items') || {};
      reward.items.forEach(item => {
        items[item] = (items[item] || 0) + 1;
      });
      storage.set('items', items);

      // 更新活跃时间
      storage.set('lastActiveTime', Date.now());

      return {
        success: true,
        message: `欢迎回来！获得${getTierEmoji(reward.tier)}${reward.tier}回流礼包`,
        coins: reward.coins,
        experience: reward.experience,
        items: reward.items,
        consecutiveReturns: reward.consecutiveReturns
      };
    }

    // 获取等级 emoji
    function getTierEmoji(tier) {
      const emojis = {
        bronze: '🥉',
        silver: '🥈',
        gold: '🥇',
        platinum: '💎',
        diamond: '💠'
      };
      return emojis[tier] || '';
    }

    // 获取回流状态
    function getReturnStatus() {
      const days = getReturnDays();
      const claimedToday = storage.get('returnRewardClaimedDate') === new Date().toISOString().split('T')[0];

      return {
        days,
        tier: getReturnTier(days).tier,
        canClaim: !claimedToday && days >= 1,
        alreadyClaimed: claimedToday
      };
    }

    return {
      getReturnDays,
      getReturnTier,
      getReturnReward,
      getRewardPreview,
      getDaysUntilNextTier,
      getNextTier,
      claimReturnReward,
      getReturnStatus,
      RETURN_TIERS
    };
  }

  // 暴露到全局
  window.SnakeEnhancedReturnRewards = {
    createEnhancedReturnRewardsModule
  };
})();
