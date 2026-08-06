/**
 * 回流专属任务系统 v1.15.0
 * 
 * 规范遵循:
 * - 统一返回类型: { success, data/error }
 * - 公开函数不超过 5 个
 * - 有 getData() 主入口
 */
(function() {
  'use strict';

  const RETURN_MISSION_TEMPLATES = [
    { id: 'return_1', title: '回归首胜', description: '回来后赢一局', target: 1, reward: { coins: 50 }, type: 'wins' },
    { id: 'return_2', title: '连续登录', description: '连续登录3天', target: 3, reward: { coins: 30 }, type: 'days' },
    { id: 'return_3', title: '完成5局', description: '完成5局游戏', target: 5, reward: { coins: 80 }, type: 'games' },
    { id: 'return_4', title: '解锁成就', description: '解锁任意成就', target: 1, reward: { coins: 40 }, type: 'achievements' },
    { id: 'return_5', title: '收集100食物', description: '累计吃100个食物', target: 100, reward: { coins: 60 }, type: 'foods' }
  ];

  function createReturnMissionsModule({ storage }) {
    if (!storage) return null;

    // 私有: 获取任务进度
    function getMissionProgress() {
      return storage.get('returnMissionProgress') || {};
    }

    // 私有: 保存任务进度
    function saveMissionProgress(progress) {
      storage.set('returnMissionProgress', progress);
    }

    // 私有: 获取玩家当前数据
    function getPlayerStats() {
      const gameRecords = storage.get('gameRecords') || [];
      const achievements = storage.get('achievementProgress') || {};
      const lastActive = storage.get('lastActiveTime') || Date.now();
      const daysSinceActive = Math.floor((Date.now() - lastActive) / (1000 * 60 * 60 * 24));

      // 计算连续登录天数
      const loginHistory = storage.get('loginHistory') || [];
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      let consecutiveDays = 0;
      if (loginHistory.includes(today)) {
        consecutiveDays = 1;
        for (let i = loginHistory.length - 2; i >= 0; i--) {
          const d = new Date(loginHistory[i]).toDateString();
          const prev = new Date(loginHistory[i + 1]).toDateString();
          if (new Date(d).getTime() - new Date(prev).getTime() === 86400000) {
            consecutiveDays++;
          } else break;
        }
      }

      // 计算总食物数
      const totalFoods = gameRecords.reduce((sum, r) => sum + (r.foodsEaten || 0), 0);

      // 计算胜利次数（需要追踪）
      const totalWins = gameRecords.filter(r => r.result === 'win').length;

      return {
        wins: totalWins,
        games: gameRecords.length,
        achievements: Object.values(achievements).filter(a => a?.unlocked).length,
        foods: totalFoods,
        days: consecutiveDays,
        isReturningUser: daysSinceActive >= 1
      };
    }

    // 公开: 获取数据 (主入口)
    function getData() {
      try {
        const progress = getMissionProgress();
        const stats = getPlayerStats();
        const missions = RETURN_MISSION_TEMPLATES.map(t => {
          const p = progress[t.id] || { completed: false, claimed: false, current: 0 };
          const current = getMissionCurrent(t.type, stats);
          return {
            ...t,
            current: Math.min(current, t.target),
            progress: Math.round((current / t.target) * 100),
            completed: current >= t.target,
            claimed: p.claimed
          };
        });

        const availableMissions = missions.filter(m => !m.claimed);
        const totalReward = availableMissions.reduce((sum, m) => sum + m.reward.coins, 0);

        return {
          success: true,
          data: {
            missions,
            availableCount: availableMissions.length,
            totalReward,
            isReturningUser: stats.isReturningUser
          }
        };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 私有: 获取当前进度
    function getMissionCurrent(type, stats) {
      switch (type) {
        case 'wins': return stats.wins;
        case 'games': return stats.games;
        case 'days': return stats.days;
        case 'achievements': return stats.achievements;
        case 'foods': return stats.foods;
        default: return 0;
      }
    }

    // 公开: 获取摘要
    function getSummary() {
      try {
        const { data } = getData();
        return {
          success: true,
          summary: {
            availableCount: data.availableCount,
            totalReward: data.totalReward,
            isReturningUser: data.isReturningUser
          }
        };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 领取奖励
    function claimReward(missionId) {
      try {
        const progress = getMissionProgress();
        const p = progress[missionId] || {};
        if (p.claimed) {
          return { success: false, error: 'Already claimed' };
        }

        const mission = RETURN_MISSION_TEMPLATES.find(m => m.id === missionId);
        if (!mission) {
          return { success: false, error: 'Mission not found' };
        }

        const stats = getPlayerStats();
        const current = getMissionCurrent(mission.type, stats);
        if (current < mission.target) {
          return { success: false, error: 'Mission not completed' };
        }

        // 标记已领取
        progress[missionId] = { ...p, claimed: true, claimedAt: Date.now() };
        saveMissionProgress(progress);

        return {
          success: true,
          result: {
            missionId,
            reward: mission.reward
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

    // 公开: 重置任务 (超过7天自动重置)
    function resetMissions() {
      try {
        const progress = getMissionProgress();
        const now = Date.now();
        const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
        let reset = false;

        RETURN_MISSION_TEMPLATES.forEach(m => {
          const p = progress[m.id];
          if (p && p.claimedAt && (now - p.claimedAt) > EXPIRY_MS) {
            // Mission expired, reset it
            delete progress[m.id];
            reset = true;
          }
        });

        if (reset) {
          saveMissionProgress(progress);
        }

        return { success: true, result: { reset } };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开 API (5 个函数, 符合规范)
    return {
      getData,
      getSummary,
      claimReward,
      resetMissions,
      validate
    };
  }

  window.SnakeReturnMissions = { createReturnMissionsModule };
})();

const SnakeReturnMissions = window.SnakeReturnMissions;
export { SnakeReturnMissions };
