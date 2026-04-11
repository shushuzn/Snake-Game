/**
 * 快速上手奖励系统 v1.22.0
 * 
 * 功能：新手完成首局游戏获得奖励
 * 简化引导流程，提供即时奖励
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'quickStartBonus';
  const FIRST_GAME_REWARD = 50; // 首次完成游戏的奖励

  function createQuickStartModule({ storage }) {
    if (!storage) return null;

    // 私有: 获取数据
    function getData() {
      try {
        const data = storage.get(STORAGE_KEY) || {
          firstGamePlayed: false,
          firstGameCompleted: false,
          bonusClaimed: false,
          bonusAmount: FIRST_GAME_REWARD,
          firstGameTime: null
        };
        return { success: true, data };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 标记首次游戏开始
    function markFirstGameStarted() {
      try {
        const data = getData().data || {};
        if (!data.firstGamePlayed) {
          data.firstGamePlayed = true;
          data.firstGameTime = Date.now();
          storage.set(STORAGE_KEY, data);
        }
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 标记首次游戏完成
    function markFirstGameCompleted() {
      try {
        const data = getData().data || {};
        if (!data.firstGameCompleted && data.firstGamePlayed) {
          data.firstGameCompleted = true;
          storage.set(STORAGE_KEY, data);
          return { success: true, result: { canClaim: true, bonus: data.bonusAmount } };
        }
        return { success: true, result: { canClaim: false } };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 领取奖励
    function claimBonus(coinsCallback) {
      try {
        const data = getData().data || {};
        if (!data.firstGameCompleted) {
          return { success: false, error: 'First game not completed' };
        }
        if (data.bonusClaimed) {
          return { success: false, error: 'Bonus already claimed' };
        }

        data.bonusClaimed = true;
        storage.set(STORAGE_KEY, data);

        // Apply bonus
        if (typeof coinsCallback === 'function') {
          coinsCallback(data.bonusAmount);
        }

        return { success: true, result: { claimed: true, amount: data.bonusAmount } };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 获取摘要
    function getSummary() {
      try {
        const { data } = getData();
        return {
          success: true,
          summary: {
            hasPlayedFirstGame: data.firstGamePlayed,
            hasCompletedFirstGame: data.firstGameCompleted,
            hasClaimedBonus: data.bonusClaimed,
            bonusAmount: data.bonusAmount,
            canClaim: data.firstGameCompleted && !data.bonusClaimed
          }
        };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 验证
    function validate() {
      const errors = [];
      if (typeof storage.get !== 'function') errors.push('Invalid storage');
      return { valid: errors.length === 0, errors };
    }

    // 公开 API
    return {
      getData,
      markFirstGameStarted,
      markFirstGameCompleted,
      claimBonus,
      getSummary,
      validate
    };
  }

  window.SnakeQuickStart = { createQuickStartModule };
})();
