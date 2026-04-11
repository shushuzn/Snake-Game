/**
 * 成就统计面板系统 v1.11.0
 * 显示成就详细统计
 */
(function() {
  'use strict';

  function createAchievementStatsModule({ storage }) {
    if (!storage) return null;

    // 获取成就统计
    function getAchievementStats() {
      const achievements = window.ACHIEVEMENTS || [];
      const progress = storage.get('achievementProgress') || {};

      const stats = {
        total: achievements.length,
        unlocked: 0,
        locked: 0,
        totalProgress: 0,
        byCategory: {},
        byDifficulty: {},
        recentUnlocked: []
      };

      achievements.forEach(a => {
        const p = progress[a.id] || { current: 0, unlocked: false };

        if (p.unlocked) {
          stats.unlocked++;
          if (p.unlockedTime) {
            stats.recentUnlocked.push({
              id: a.id,
              name: a.name,
              time: p.unlockedTime
            });
          }
        } else {
          stats.locked++;
        }

        stats.totalProgress += Math.min(100, Math.round((p.current / (a.threshold || 1)) * 100));

        // By category
        if (!stats.byCategory[a.category]) {
          stats.byCategory[a.category] = { total: 0, unlocked: 0 };
        }
        stats.byCategory[a.category].total++;
        if (p.unlocked) stats.byCategory[a.category].unlocked++;

        // By difficulty
        const diff = a.difficulty || 'medium';
        if (!stats.byDifficulty[diff]) {
          stats.byDifficulty[diff] = { total: 0, unlocked: 0 };
        }
        stats.byDifficulty[diff].total++;
        if (p.unlocked) stats.byDifficulty[diff].unlocked++;
      });

      // Sort recent unlocked by time
      stats.recentUnlocked.sort((a, b) => new Date(b.time) - new Date(a.time));

      return stats;
    }

    // 获取完成度百分比
    function getCompletionPercentage() {
      const stats = getAchievementStats();
      if (stats.total === 0) return 0;
      return Math.round((stats.unlocked / stats.total) * 100);
    }

    // 获取预计完成时间
    function getEstimatedCompletion() {
      const stats = getAchievementStats();
      if (stats.locked === 0) return null;

      // 基于当前进度估算
      const avgProgress = stats.totalProgress / stats.total;
      const remaining = 100 - avgProgress;

      // 简化估算：每 10% 进度约需要 5 局游戏
      const estimatedGames = Math.ceil((remaining / 10) * 5);

      return {
        games: estimatedGames,
        message: `约需 ${estimatedGames} 局游戏可完成所有成就`
      };
    }

    return {
      getAchievementStats,
      getCompletionPercentage,
      getEstimatedCompletion
    };
  }

  // 暴露到全局
  window.SnakeAchievementStats = {
    createAchievementStatsModule
  };
})();
