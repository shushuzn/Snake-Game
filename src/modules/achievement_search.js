/**
 * 成就搜索与排序系统 v1.11.0
 * 搜索和排序成就
 */
(function() {
  'use strict';

  function createAchievementSearchModule({ storage }) {
    if (!storage) return null;

    // 搜索成就
    function searchAchievements(query) {
      const achievements = window.ACHIEVEMENTS || [];
      const progress = storage.get('achievementProgress') || {};

      if (!query || query.trim() === '') {
        return achievements;
      }

      query = query.toLowerCase().trim();

      return achievements.filter(a => {
        const name = (a.name || '').toLowerCase();
        const desc = (a.description || '').toLowerCase();
        const category = (a.category || '').toLowerCase();

        return name.includes(query) || desc.includes(query) || category.includes(query);
      });
    }

    // 排序成就
    function sortAchievements(achievements, sortBy = 'progress') {
      const progress = storage.get('achievementProgress') || {};

      return [...achievements].sort((a, b) => {
        const aProgress = progress[a.id] || { current: 0, unlocked: false };
        const bProgress = progress[b.id] || { current: 0, unlocked: false };

        switch (sortBy) {
          case 'progress':
            // 按进度降序，未完成优先
            if (aProgress.unlocked !== bProgress.unlocked) {
              return aProgress.unlocked ? 1 : -1;
            }
            const aPercent = aProgress.current / (a.threshold || 1);
            const bPercent = bProgress.current / (b.threshold || 1);
            return bPercent - aPercent;

          case 'name':
            return (a.name || '').localeCompare(b.name || '');

          case 'category':
            return (a.category || '').localeCompare(b.category || '');

          case 'difficulty':
            const difficultyOrder = { newcomer: 0, easy: 1, medium: 2, hard: 3 };
            return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);

          default:
            return 0;
        }
      });
    }

    // 获取排序选项
    function getSortOptions() {
      return [
        { value: 'progress', label: '按进度' },
        { value: 'name', label: '按名称' },
        { value: 'category', label: '按分类' },
        { value: 'difficulty', label: '按难度' }
      ];
    }

    return {
      searchAchievements,
      sortAchievements,
      getSortOptions
    };
  }

  // 暴露到全局
  window.SnakeAchievementSearch = {
    createAchievementSearchModule
  };
})();
