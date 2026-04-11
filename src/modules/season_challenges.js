/**
 * 赛季挑战系统 v1.19.0
 * 
 * 规范遵循:
 * - 统一返回类型: { success, data/error }
 * - 公开函数不超过 5 个
 */
(function() {
  'use strict';

  const SEASON_DURATION_DAYS = 7;
  const SEASON_TEMPLATES = [
    { id: 's1', name: '初学者', description: '完成10局游戏', target: 10, type: 'games', reward: { coins: 100 } },
    { id: 's2', name: '连胜达人', description: '获得3次连胜', target: 3, type: 'streak', reward: { coins: 150 } },
    { id: 's3', name: '美食家', description: '吃掉100个食物', target: 100, type: 'foods', reward: { coins: 80 } },
    { id: 's4', name: '高分玩家', description: '单局获得500分', target: 500, type: 'score', reward: { coins: 120 } },
    { id: 's5', name: '收藏家', description: '解锁3个皮肤', target: 3, type: 'skins', reward: { coins: 100 } }
  ];

  function createSeasonChallengesModule({ storage }) {
    if (!storage) return null;

    // 私有: 获取当前赛季数据
    function getSeasonData() {
      return storage.get('currentSeason') || null;
    }

    // 私有: 保存赛季数据
    function saveSeasonData(data) {
      storage.set('currentSeason', data);
    }

    // 私有: 计算赛季结束时间
    function calculateSeasonEnd() {
      const now = Date.now();
      const seasonData = getSeasonData();
      if (!seasonData) return now + SEASON_DURATION_DAYS * 24 * 60 * 60 * 1000;

      const startTime = seasonData.startTime || now;
      const endTime = startTime + SEASON_DURATION_DAYS * 24 * 60 * 60 * 1000;
      return endTime;
    }

    // 私有: 初始化新赛季
    function initNewSeason() {
      const now = Date.now();
      const seasonNum = (storage.get('seasonNumber') || 0) + 1;
      storage.set('seasonNumber', seasonNum);

      return {
        seasonNumber: seasonNum,
        startTime: now,
        challenges: SEASON_TEMPLATES.map(t => ({
          id: t.id,
          current: 0,
          completed: false,
          claimed: false
        })),
        isNew: true
      };
    }

    // 公开: 获取数据 (主入口)
    function getData() {
      try {
        let seasonData = getSeasonData();
        const now = Date.now();
        const endTime = calculateSeasonEnd();
        const daysLeft = Math.max(0, Math.ceil((endTime - now) / (24 * 60 * 60 * 1000)));
        const hoursLeft = Math.max(0, Math.ceil((endTime - now) / (60 * 60 * 1000)));

        // Check if season expired
        if (!seasonData || now >= endTime) {
          seasonData = initNewSeason();
          saveSeasonData(seasonData);
        }

        const challenges = SEASON_TEMPLATES.map((t, idx) => {
          const progress = seasonData.challenges[idx] || { current: 0, completed: false, claimed: false };
          return {
            ...t,
            current: progress.current,
            completed: progress.completed,
            claimed: progress.claimed,
            progress: Math.round((progress.current / t.target) * 100)
          };
        });

        const completedCount = challenges.filter(c => c.completed).length;
        const claimedCount = challenges.filter(c => c.claimed).length;
        const totalReward = challenges.filter(c => c.completed && !c.claimed).reduce((sum, c) => sum + c.reward.coins, 0);

        return {
          success: true,
          data: {
            seasonNumber: seasonData.seasonNumber,
            startTime: seasonData.startTime,
            daysLeft,
            hoursLeft,
            isNew: seasonData.isNew || false,
            challenges,
            completedCount,
            claimedCount,
            totalReward,
            isExpired: now >= endTime
          }
        };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 更新进度
    function updateProgress(type, amount) {
      try {
        const seasonData = getSeasonData();
        if (!seasonData) return { success: false, error: 'No active season' };

        const challengeIdx = SEASON_TEMPLATES.findIndex(t => t.type === type);
        if (challengeIdx === -1) return { success: false, error: 'Challenge type not found' };

        const challenge = seasonData.challenges[challengeIdx];
        if (!challenge) return { success: false, error: 'Challenge not found' };

        if (challenge.completed) return { success: true, result: { alreadyCompleted: true } };

        challenge.current = Math.min(challenge.current + amount, SEASON_TEMPLATES[challengeIdx].target);
        if (challenge.current >= SEASON_TEMPLATES[challengeIdx].target) {
          challenge.completed = true;
        }

        seasonData.isNew = false;
        saveSeasonData(seasonData);

        return {
          success: true,
          result: {
            challengeId: SEASON_TEMPLATES[challengeIdx].id,
            newProgress: challenge.current,
            completed: challenge.completed
          }
        };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 领取奖励
    function claimReward(challengeId) {
      try {
        const seasonData = getSeasonData();
        if (!seasonData) return { success: false, error: 'No active season' };

        const challengeIdx = SEASON_TEMPLATES.findIndex(t => t.id === challengeId);
        if (challengeIdx === -1) return { success: false, error: 'Challenge not found' };

        const challenge = seasonData.challenges[challengeIdx];
        if (!challenge.completed) return { success: false, error: 'Challenge not completed' };
        if (challenge.claimed) return { success: false, error: 'Already claimed' };

        const template = SEASON_TEMPLATES[challengeIdx];
        challenge.claimed = true;
        seasonData.isNew = false;
        saveSeasonData(seasonData);

        return {
          success: true,
          result: {
            challengeId,
            reward: template.reward
          }
        };
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
            seasonNumber: data.seasonNumber,
            daysLeft: data.daysLeft,
            completedCount: data.completedCount,
            totalChallenges: SEASON_TEMPLATES.length,
            totalReward: data.totalReward
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

    // 公开 API (5 个函数, 符合规范)
    return {
      getData,
      updateProgress,
      claimReward,
      getSummary,
      validate
    };
  }

  window.SnakeSeasonChallenges = { createSeasonChallengesModule };
})();
