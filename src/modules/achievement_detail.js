/**
 * 成就详情弹窗系统 v1.10.0
 * 点击成就显示详细信息
 */
(function() {
  'use strict';

  function createAchievementDetailModule({ storage }) {
    if (!storage) return null;

    // 获取成就详情
    function getAchievementDetail(achievementId) {
      const achievements = window.ACHIEVEMENTS || [];
      const achievement = achievements.find(a => a.id === achievementId);

      if (!achievement) return null;

      const progress = storage.get('achievementProgress') || {};
      const current = progress[achievementId]?.current || 0;
      const unlocked = progress[achievementId]?.unlocked || false;
      const unlockedTime = progress[achievementId]?.unlockedTime || null;

      return {
        ...achievement,
        current,
        unlocked,
        unlockedTime,
        progress: Math.min(100, Math.round((current / achievement.threshold) * 100)),
        remaining: Math.max(0, achievement.threshold - current)
      };
    }

    // 获取成就完成提示
    function getCompletionTips(achievementId) {
      const achievement = getAchievementDetail(achievementId);
      if (!achievement || achievement.unlocked) return null;

      const tips = {
        combo: '保持稳定节奏，避免急躁失误',
        score: '专注于吃食物，保持存活',
        games: '多玩游戏自然会达成',
        newcomer: '完成新手任务即可解锁',
        special: '尝试完成特殊挑战'
      };

      return tips[achievement.category] || '继续加油！';
    }

    return {
      getAchievementDetail,
      getCompletionTips
    };
  }

  // 暴露到全局
  window.SnakeAchievementDetail = {
    createAchievementDetailModule
  };
})();

const SnakeAchievementDetail = window.SnakeAchievementDetail;
export { SnakeAchievementDetail };
