/**
 * 模式试玩系统 v1.7.0
 * 允许玩家试用未解锁的模式
 */
(function() {
  'use strict';

  const TRIAL_DURATION_MS = 5 * 60 * 1000; // 5分钟试玩
  const MAX_DAILY_TRIALS = 1; // 每天每模式1次试玩

  // 试玩模式列表
  const TRIAL_MODES = ['ai-battle', 'multiplayer', 'spectate'];

  function createModeTrialModule({ storage }) {
    if (!storage) return null;

    // 获取试玩记录
    function getTrialRecords() {
      const data = storage.get('modeTrialRecords');
      return data || {};
    }

    // 保存试玩记录
    function saveTrialRecords(records) {
      storage.set('modeTrialRecords', records);
    }

    // 获取今日日期字符串
    function getTodayStr() {
      return new Date().toISOString().split('T')[0];
    }

    // 获取模式的试玩状态
    function getModeTrialStatus(modeId) {
      if (!TRIAL_MODES.includes(modeId)) {
        return { unlocked: true, availableForTrial: false };
      }

      // 检查是否已解锁（通过 season 模块）
      // 这里简化处理，实际应该检查 season 模块的解锁状态
      const records = getTrialRecords();
      const today = getTodayStr();

      // 检查是否有有效的试玩记录
      const modeRecords = records[modeId] || [];
      const todayRecord = modeRecords.find(r => r.date === today);

      return {
        unlocked: false, // 假设未解锁，需要试玩
        availableForTrial: true,
        todayTrials: todayRecord ? 1 : 0,
        maxTrials: MAX_DAILY_TRIALS,
        lastTrialDate: todayRecord ? today : null
      };
    }

    // 开始试玩
    function startTrial(modeId) {
      const status = getModeTrialStatus(modeId);

      if (!status.availableForTrial) {
        return { success: false, message: '该模式不可试玩' };
      }

      if (status.unlocked) {
        return { success: false, message: '该模式已解锁，无需试玩' };
      }

      if (status.todayTrials >= status.maxTrials) {
        return { success: false, message: '今日试玩次数已用完' };
      }

      // 记录试玩开始
      const records = getTrialRecords();
      const today = getTodayStr();

      if (!records[modeId]) {
        records[modeId] = [];
      }

      records[modeId].push({
        date: today,
        startTime: Date.now(),
        duration: TRIAL_DURATION_MS
      });

      // 只保留最近7天的记录
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      records[modeId] = records[modeId].filter(r => new Date(r.date) >= sevenDaysAgo);

      saveTrialRecords(records);

      return {
        success: true,
        message: `开始${TRIAL_MODES.includes(modeId) ? getModeDisplayName(modeId) : '试玩'}！试玩时长5分钟。`
      };
    }

    // 获取试玩进度
    function getTrialProgress(modeId, startTime) {
      if (!startTime) return null;

      const elapsed = Date.now() - startTime;
      const remaining = TRIAL_DURATION_MS - elapsed;

      return {
        elapsed,
        remaining: Math.max(0, remaining),
        isExpired: remaining <= 0,
        progress: Math.min(1, elapsed / TRIAL_DURATION_MS)
      };
    }

    // 获取模式显示名称
    function getModeDisplayName(modeId) {
      const names = {
        'ai-battle': 'AI对战',
        'multiplayer': '多人游戏',
        'spectate': '观战模式'
      };
      return names[modeId] || modeId;
    }

    // 检查是否可以试玩
    function canTrial(modeId) {
      const status = getModeTrialStatus(modeId);
      return status.availableForTrial && !status.unlocked && status.todayTrials < status.maxTrials;
    }

    return {
      getModeTrialStatus,
      startTrial,
      getTrialProgress,
      canTrial,
      getTrialRecords,
      TRIAL_MODES,
      TRIAL_DURATION_MS
    };
  }

  // 暴露到全局
  window.SnakeModeTrial = {
    createModeTrialModule
  };
})();
