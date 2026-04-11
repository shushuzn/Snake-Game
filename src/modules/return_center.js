/**
 * 回流中心系统 v1.12.0
 * 合并回流奖励预览 + 进度追踪
 */
(function() {
  'use strict';

  const RETURN_TIERS = [
    { minDays: 1, maxDays: 3, tier: 'bronze', coins: 30, experience: 15 },
    { minDays: 4, maxDays: 7, tier: 'silver', coins: 60, experience: 30 },
    { minDays: 8, maxDays: 14, tier: 'gold', coins: 100, experience: 50 },
    { minDays: 15, maxDays: 30, tier: 'platinum', coins: 200, experience: 100 },
    { minDays: 31, maxDays: Infinity, tier: 'diamond', coins: 500, experience: 250 }
  ];

  function createReturnCenterModule({ storage }) {
    if (!storage) return null;

    // 获取回流天数
    function getReturnDays() {
      const lastActive = storage.get('lastActiveTime') || Date.now();
      return Math.floor((Date.now() - lastActive) / (1000 * 60 * 60 * 24));
    }

    // 获取当前等级
    function getCurrentTier() {
      const days = getReturnDays();
      return RETURN_TIERS.find(t => days >= t.minDays && days <= t.maxDays) || RETURN_TIERS[0];
    }

    // 获取下一等级
    function getNextTier() {
      const days = getReturnDays();
      const currentIndex = RETURN_TIERS.findIndex(t => days >= t.minDays && days <= t.maxDays);
      return RETURN_TIERS[currentIndex + 1] || null;
    }

    // 获取奖励预览
    function getRewardPreview() {
      const days = getReturnDays();
      const currentTier = getCurrentTier();
      const nextTier = getNextTier();

      return {
        days,
        currentTier: currentTier.tier,
        nextTier: nextTier?.tier || null,
        daysUntilNextTier: nextTier ? nextTier.minDays - days : null,
        currentReward: { coins: currentTier.coins, experience: currentTier.experience },
        nextReward: nextTier ? { coins: nextTier.coins, experience: nextTier.experience } : null
      };
    }

    // 获取回流阶段
    function getReturnStage() {
      const days = getReturnDays();
      if (days <= 1) return 'active';
      if (days <= 3) return 'at_risk';
      if (days <= 7) return 'dormant';
      return 'churned';
    }

    // 获取阶段标签
    function getStageLabel(stage) {
      const labels = { active: '活跃', at_risk: '风险', dormant: '沉默', churned: '流失' };
      return labels[stage] || '未知';
    }

    // 获取阶段颜色
    function getStageColor(stage) {
      const colors = { active: '#22c55e', at_risk: '#f59e0b', dormant: '#ef4444', churned: '#6b7280' };
      return colors[stage] || '#888';
    }

    // 获取回流完整数据
    function getReturnCenterData() {
      const preview = getRewardPreview();
      const stage = getReturnStage();
      const progress = storage.get('achievementProgress') || {};
      const unlockedCount = Object.values(progress).filter(a => a?.unlocked).length;

      return {
        ...preview,
        stage,
        stageLabel: getStageLabel(stage),
        stageColor: getStageColor(stage),
        achievementsUnlocked: unlockedCount,
        totalGames: (storage.get('gameRecords') || []).length
      };
    }

    return {
      getReturnDays,
      getCurrentTier,
      getNextTier,
      getRewardPreview,
      getReturnStage,
      getStageLabel,
      getStageColor,
      getReturnCenterData,
      RETURN_TIERS
    };
  }

  window.SnakeReturnCenter = { createReturnCenterModule };
})();
