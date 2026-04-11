/**
 * 回流玩家引导优化 v1.7.0
 * 针对沉默后回流的玩家提供快速复习引导
 */
(function() {
  'use strict';

  // 回流玩家沉默阈值（天数）
  const RETURNING_THRESHOLD_DAYS = 7;

  function createReturningGuideModule({ storage }) {
    if (!storage) return null;

    // 检查是否是回流玩家
    function isReturningPlayer() {
      const lastActive = storage.get('lastActiveTime') || Date.now();
      const now = Date.now();
      const daysSinceActive = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));

      // 曾经玩过（不是纯新手）
      const gamesPlayed = storage.get('gamesPlayed') || 0;

      return daysSinceActive >= RETURNING_THRESHOLD_DAYS && gamesPlayed > 0;
    }

    // 获取回流天数
    function getReturningDays() {
      const lastActive = storage.get('lastActiveTime') || Date.now();
      const now = Date.now();
      return Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
    }

    // 检查是否显示快速复习
    function shouldShowQuickReview() {
      // 已经显示过的当天不重复显示
      const lastShown = storage.get('returningGuideLastShown') || '';
      const today = new Date().toISOString().split('T')[0];

      if (lastShown === today) return false;

      return isReturningPlayer();
    }

    // 标记已显示
    function markQuickReviewShown() {
      const today = new Date().toISOString().split('T')[0];
      storage.set('returningGuideLastShown', today);
    }

    // 获取快速复习内容
    function getQuickReviewItems() {
      // 基于玩家历史推荐需要复习的内容
      const records = storage.get('gameRecords') || [];
      const modeCount = {};

      records.forEach(r => {
        if (r.mode) {
          modeCount[r.mode] = (modeCount[r.mode] || 0) + 1;
        }
      });

      // 找出玩家不常玩的模式
      const allModes = ['classic', 'timed', 'blitz', 'endless', 'roguelike', 'ai-battle'];
      const unfamiliarModes = allModes.filter(m => !modeCount[m] || modeCount[m] < 3);

      const items = [];

      // 添加复习项
      if (unfamiliarModes.length > 0) {
        items.push({
          id: 'new_mode',
          title: '新模式解锁',
          description: `您还没尝试过 ${unfamiliarModes.slice(0, 2).join('、')} 模式`,
          action: 'highlight_modes'
        });
      }

      // 检查道具使用情况
      const itemUsage = storage.get('itemUsage') || {};
      const unusedItems = Object.entries(itemUsage)
        .filter(([_, count]) => count < 3)
        .map(([item]) => item);

      if (unusedItems.length > 0) {
        items.push({
          id: 'item_tips',
          title: '道具使用技巧',
          description: `您可能忘记了 ${unusedItems.slice(0, 2).join('、')} 的使用方式`,
          action: 'show_item_guide'
        });
      }

      // 默认复习项
      items.push({
        id: 'controls',
        title: '操作复习',
        description: '温习方向键、WASD、触屏操作',
        action: 'show_controls'
      });

      return items;
    }

    // 跳过回流引导
    function skipQuickReview() {
      markQuickReviewShown();
      return true;
    }

    // 获取回流欢迎奖励
    function getReturningReward() {
      const days = getReturningDays();

      if (days >= 30) {
        return {
          coins: 200,
          experience: 100,
          message: '久别归来！获得回归大礼包：200金币 + 100经验'
        };
      } else if (days >= 14) {
        return {
          coins: 100,
          experience: 50,
          message: '欢迎回来！获得回归礼包：100金币 + 50经验'
        };
      } else if (days >= 7) {
        return {
          coins: 50,
          experience: 25,
          message: '好久不见！获得回归奖励：50金币 + 25经验'
        };
      }

      return null;
    }

    return {
      isReturningPlayer,
      getReturningDays,
      shouldShowQuickReview,
      markQuickReviewShown,
      getQuickReviewItems,
      skipQuickReview,
      getReturningReward,
      RETURNING_THRESHOLD_DAYS
    };
  }

  // 暴露到全局
  window.SnakeReturningGuide = {
    createReturningGuideModule
  };
})();
