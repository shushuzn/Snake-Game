/**
 * 个性化成就推荐系统 v1.7.0
 * 根据玩家历史推荐适合的成就
 */
(function() {
  'use strict';

  function createPersonalizedAchievementsModule({ storage, achievements }) {
    if (!storage || !achievements) return null;

    // 获取玩家偏好模式
    function getPreferredModes() {
      const records = storage.get('gameRecords') || [];
      const modeCount = {};

      records.forEach(r => {
        if (r.mode) {
          modeCount[r.mode] = (modeCount[r.mode] || 0) + 1;
        }
      });

      // 排序返回最多的模式
      return Object.entries(modeCount)
        .sort((a, b) => b[1] - a[1])
        .map(([mode]) => mode);
    }

    // 获取玩家平均分数
    function getAverageScore() {
      const records = storage.get('gameRecords') || [];
      if (records.length === 0) return 0;

      const total = records.reduce((sum, r) => sum + (r.score || 0), 0);
      return Math.round(total / records.length);
    }

    // 获取玩家最高连击
    function getBestCombo() {
      const records = storage.get('gameRecords') || [];
      return records.reduce((max, r) => Math.max(max, r.maxCombo || 0), 0);
    }

    // 获取玩家游戏总场次
    function getTotalGames() {
      const records = storage.get('gameRecords') || [];
      return records.length;
    }

    // 推荐成就
    function getRecommendedAchievements(count = 3) {
      const preferredModes = getPreferredModes();
      const avgScore = getAverageScore();
      const bestCombo = getBestCombo();
      const totalGames = getTotalGames();

      // 已解锁的成就
      const unlocked = storage.get('achievementProgress') || {};
      const unlockedIds = Object.keys(unlocked).filter(id => unlocked[id]?.unlocked);

      // 过滤未解锁且可达成的成就
      const recommendations = [];

      achievements.forEach(achievement => {
        if (unlockedIds.includes(achievement.id)) return;

        let score = 0;

        // 基于模式偏好
        if (achievement.category === 'combo' && bestCombo > 0) {
          score += 20; // 喜欢连击
        }

        // 基于平均分
        if (achievement.id.includes('score')) {
          if (avgScore > 500 && achievement.threshold <= avgScore * 1.5) {
            score += 25; // 分数接近可达
          }
        }

        // 基于游戏场次
        if (achievement.category === 'games') {
          const gamesNeeded = achievement.threshold - totalGames;
          if (gamesNeeded > 0 && gamesNeeded <= 10) {
            score += 30; // 很快能完成
          }
        }

        // 新手友好成就优先推荐
        if (achievement.category === 'newcomer' || achievement.id.includes('first')) {
          score += 15;
        }

        // 限时成就优先
        if (achievement.seasonOnly) {
          score += 10;
        }

        if (score > 0) {
          recommendations.push({
            ...achievement,
            recommendationScore: score
          });
        }
      });

      // 按推荐分数排序
      recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);

      return recommendations.slice(0, count);
    }

    // 获取成就完成进度
    function getAchievementProgress(achievementId) {
      const progress = storage.get('achievementProgress') || {};
      return progress[achievementId] || { current: 0, unlocked: false };
    }

    // 预估完成距离
    function getEstimatedDistance(achievement) {
      const progress = getAchievementProgress(achievement.id);

      if (achievement.category === 'combo') {
        const bestCombo = getBestCombo();
        return Math.max(0, achievement.threshold - bestCombo);
      }

      if (achievement.category === 'score') {
        const avgScore = getAverageScore();
        return Math.max(0, achievement.threshold - avgScore);
      }

      if (achievement.category === 'games') {
        const totalGames = getTotalGames();
        return Math.max(0, achievement.threshold - totalGames);
      }

      return achievement.threshold;
    }

    return {
      getPreferredModes,
      getAverageScore,
      getBestCombo,
      getTotalGames,
      getRecommendedAchievements,
      getAchievementProgress,
      getEstimatedDistance
    };
  }

  // 暴露到全局
  window.SnakePersonalizedAchievements = {
    createPersonalizedAchievementsModule
  };
})();
