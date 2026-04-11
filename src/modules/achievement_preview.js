/**
 * 成就预览弹窗系统 v1.9.0
 * 展示下一成就目标，提升 progress_clarity
 */
(function() {
  'use strict';

  function createAchievementPreviewModule({ storage }) {
    if (!storage) return null;

    // 获取所有成就
    function getAllAchievements() {
      return window.ACHIEVEMENTS || [];
    }

    // 获取玩家成就进度
    function getAchievementProgress(achievementId) {
      const progress = storage.get('achievementProgress') || {};
      return progress[achievementId] || { current: 0, unlocked: false };
    }

    // 获取下一个可达成成就
    function getNextAchievableAchievement() {
      const achievements = getAllAchievements();
      const records = storage.get('gameRecords') || [];

      if (records.length === 0) {
        // 新玩家：返回第一个简单成就
        return achievements.find(a => a.category === 'newcomer') || achievements[0];
      }

      // 找到未完成且接近达成的成就
      let best = null;
      let bestScore = 0;

      for (const achievement of achievements) {
        const progress = getAchievementProgress(achievement.id);

        if (progress.unlocked) continue;

        // 计算接近度分数
        const score = calculateProximityScore(achievement, records, progress.current);

        if (score > bestScore) {
          bestScore = score;
          best = achievement;
        }
      }

      return best;
    }

    // 计算接近度分数
    function calculateProximityScore(achievement, records, current) {
      const threshold = achievement.threshold;

      if (threshold === 0) return 0;

      // 进度百分比
      const progressPercent = current / threshold;

      // 优先级调整
      let priorityBonus = 0;
      switch (achievement.category) {
        case 'newcomer': priorityBonus = 20; break;
        case 'combo': priorityBonus = 15; break;
        case 'score': priorityBonus = 10; break;
        default: priorityBonus = 5;
      }

      // 接近度分数（越高越接近完成）
      const proximityScore = progressPercent * 100;

      return proximityScore + priorityBonus;
    }

    // 获取预览数据
    function getPreviewData() {
      const nextAchievement = getNextAchievableAchievement();
      if (!nextAchievement) return null;

      const progress = getAchievementProgress(nextAchievement.id);
      const records = storage.get('gameRecords') || [];

      // 预估完成距离
      let estimatedGames = null;
      if (nextAchievement.category === 'games') {
        estimatedGames = nextAchievement.threshold - records.length;
      } else if (records.length > 0) {
        // 基于历史数据估算
        const avgProgress = records.reduce((sum, r) => {
          if (nextAchievement.id.includes('combo')) return sum + (r.maxCombo || 0);
          if (nextAchievement.id.includes('score')) return sum + (r.score || 0);
          return sum + 1;
        }, 0) / records.length;

        if (avgProgress > 0) {
          const remaining = nextAchievement.threshold - progress.current;
          estimatedGames = Math.ceil(remaining / avgProgress);
        }
      }

      return {
        achievement: nextAchievement,
        progress: progress.current,
        target: nextAchievement.threshold,
        percent: Math.min(100, Math.round((progress.current / nextAchievement.threshold) * 100)),
        estimatedGames,
        tips: getTipsForAchievement(nextAchievement)
      };
    }

    // 获取成就完成提示
    function getTipsForAchievement(achievement) {
      const tips = {
        combo: '保持稳定节奏，避免急躁',
        score: '专注于吃食物，不要冒险',
        games: '多玩游戏自然会达成',
        newcomer: '完成新手任务即可解锁'
      };

      return tips[achievement.category] || '继续加油！';
    }

    // 检查是否应该显示预览
    function shouldShowPreview() {
      // 每天首次游戏显示
      const lastShown = storage.get('achievementPreviewLastShown') || '';
      const today = new Date().toISOString().split('T')[0];

      if (lastShown === today) return false;

      // 有未完成的成就才显示
      const next = getNextAchievableAchievement();
      return !!next;
    }

    // 标记已显示
    function markPreviewShown() {
      const today = new Date().toISOString().split('T')[0];
      storage.set('achievementPreviewLastShown', today);
    }

    // 获取顶部成就列表（显示在界面顶部）
    function getTopAchievements(count = 3) {
      const achievements = getAllAchievements();
      const records = storage.get('gameRecords') || [];

      const withProgress = achievements.map(a => ({
        ...a,
        progress: getAchievementProgress(a.id),
        proximityScore: a.unlocked ? -1 : calculateProximityScore(a, records, getAchievementProgress(a.id).current)
      }));

      // 按接近度排序
      withProgress.sort((a, b) => b.proximityScore - a.proximityScore);

      return withProgress.slice(0, count);
    }

    return {
      getAllAchievements,
      getAchievementProgress,
      getNextAchievableAchievement,
      getPreviewData,
      shouldShowPreview,
      markPreviewShown,
      getTopAchievements,
      calculateProximityScore
    };
  }

  // 暴露到全局
  window.SnakeAchievementPreview = {
    createAchievementPreviewModule
  };
})();
