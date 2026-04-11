/**
 * 动态奖励系统 v1.23.0
 * 
 * 功能：可配置的奖励规则引擎
 * 规范遵循:
 * - 统一返回类型: { success, data/error }
 * - 公开函数不超过 5 个
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'rewardSystem';
  const REWARD_HISTORY_KEY = 'rewardHistory';

  // 奖励规则定义
  const DEFAULT_RULES = [
    { id: 'first_game', trigger: 'game_complete', condition: { gamesPlayed: 0 }, reward: { type: 'coins', amount: 50 }, once: true },
    { id: 'first_win', trigger: 'game_win', condition: { gamesWon: 0 }, reward: { type: 'coins', amount: 100 }, once: true },
    { id: 'score_50', trigger: 'score_reached', condition: { minScore: 50 }, reward: { type: 'coins', amount: 10 }, once: false },
    { id: 'score_100', trigger: 'score_reached', condition: { minScore: 100 }, reward: { type: 'coins', amount: 20 }, once: false },
  ];

  function createRewardSystemModule({ storage, rules = DEFAULT_RULES }) {
    if (!storage) return null;

    // 当前规则（可动态更新）
    let currentRules = [...rules];

    // 私有: 获取数据
    function getData() {
      try {
        const claimedRewards = storage.get(STORAGE_KEY) || {};
        const history = storage.get(REWARD_HISTORY_KEY) || [];
        return {
          success: true,
          data: {
            rules: currentRules,
            claimedRewards,
            history: history.slice(-20)
          }
        };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 私有: 检查条件是否满足
    function checkCondition(condition, stats) {
      if (!condition) return true;
      
      if (typeof condition.gamesPlayed === 'number' && stats.gamesPlayed !== condition.gamesPlayed) {
        return false;
      }
      if (typeof condition.gamesWon === 'number' && stats.gamesWon !== condition.gamesWon) {
        return false;
      }
      if (typeof condition.minScore === 'number' && stats.highestScore < condition.minScore) {
        return false;
      }
      return true;
    }

    // 私有: 检查是否已领取
    function isClaimed(ruleId) {
      const claimed = storage.get(STORAGE_KEY) || {};
      return claimed[ruleId] === true;
    }

    // 私有: 标记已领取
    function markClaimed(ruleId) {
      const claimed = storage.get(STORAGE_KEY) || {};
      claimed[ruleId] = true;
      storage.set(STORAGE_KEY, claimed);
    }

    // 私有: 添加到历史
    function addToHistory(ruleId, reward) {
      const history = storage.get(REWARD_HISTORY_KEY) || [];
      history.push({
        ruleId,
        reward,
        timestamp: Date.now()
      });
      storage.set(REWARD_HISTORY_KEY, history.slice(-50));
    }

    // 公开: 获取奖励摘要
    function getSummary() {
      try {
        const { data } = getData();
        const pendingRewards = currentRules.filter(rule => {
          if (rule.once && isClaimed(rule.id)) return false;
          return true;
        });
        
        return {
          success: true,
          summary: {
            totalRules: currentRules.length,
            claimedCount: Object.keys(data.claimedRewards).length,
            pendingRewards: pendingRewards.map(r => ({ id: r.id, reward: r.reward }))
          }
        };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 检查触发条件
    function checkTriggers(event, stats) {
      try {
        const results = [];
        
        for (const rule of currentRules) {
          if (rule.trigger !== event) continue;
          if (rule.once && isClaimed(rule.id)) continue;
          if (!checkCondition(rule.condition, stats)) continue;
          
          results.push({
            ruleId: rule.id,
            reward: rule.reward,
            canClaim: true
          });
        }
        
        return { success: true, results };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 领取奖励
    function claimReward(ruleId, applyCallback) {
      try {
        const rule = currentRules.find(r => r.id === ruleId);
        if (!rule) {
          return { success: false, error: 'Rule not found' };
        }
        if (rule.once && isClaimed(ruleId)) {
          return { success: false, error: 'Already claimed' };
        }
        
        // 应用奖励
        if (typeof applyCallback === 'function') {
          applyCallback(rule.reward);
        }
        
        // 标记并记录
        markClaimed(ruleId);
        addToHistory(ruleId, rule.reward);
        
        return {
          success: true,
          result: {
            ruleId,
            reward: rule.reward,
            claimed: true
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
      if (!Array.isArray(currentRules)) errors.push('Rules must be array');
      return { valid: errors.length === 0, errors };
    }

    // 公开 API (5 个函数)
    return {
      getData,
      getSummary,
      checkTriggers,
      claimReward,
      validate
    };
  }

  window.SnakeRewardSystem = { createRewardSystemModule, DEFAULT_RULES };
})();
