/**
 * 流失预警系统 v1.7.0
 * 检测玩家沉默天数，触发预警和召回
 */
(function() {
  'use strict';

  // 配置
  const CHURN_THRESHOLD_DAYS = 3; // 沉默超过3天触发预警
  const URGENT_THRESHOLD_DAYS = 7; // 沉默超过7天触发紧急召回

  function createChurnWarningModule({ storage }) {
    if (!storage) return null;

    // 获取最后活跃时间
    function getLastActiveTime() {
      return storage.get('lastActiveTime') || Date.now();
    }

    // 更新活跃时间
    function updateLastActiveTime() {
      storage.set('lastActiveTime', Date.now());
    }

    // 获取沉默天数
    function getSilentDays() {
      const lastActive = getLastActiveTime();
      const now = Date.now();
      const diffMs = now - lastActive;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return diffDays;
    }

    // 获取流失风险等级
    function getChurnRiskLevel() {
      const silentDays = getSilentDays();

      if (silentDays >= URGENT_THRESHOLD_DAYS) {
        return {
          level: 'urgent',
          silentDays,
          message: '您已经很久没玩了！快回来领取回归奖励',
          canRecall: true
        };
      } else if (silentDays >= CHURN_THRESHOLD_DAYS) {
        return {
          level: 'warning',
          silentDays,
          message: `您已经 ${silentDays} 天没玩游戏了`,
          canRecall: true
        };
      }

      return {
        level: 'normal',
        silentDays: 0,
        message: '',
        canRecall: false
      };
    }

    // 检查是否应该显示召回弹窗
    function shouldShowRecallModal() {
      const risk = getChurnRiskLevel();
      if (!risk.canRecall) return false;

      // 检查是否已经显示过（当天不重复显示）
      const lastShown = storage.get('churnModalLastShown') || '';
      const today = new Date().toISOString().split('T')[0];

      if (lastShown === today) return false;

      return true;
    }

    // 标记弹窗已显示
    function markRecallModalShown() {
      const today = new Date().toISOString().split('T')[0];
      storage.set('churnModalLastShown', today);
    }

    // 获取召回奖励信息
    function getRecallReward() {
      const silentDays = getSilentDays();

      if (silentDays >= URGENT_THRESHOLD_DAYS) {
        return {
          coins: 100,
          experience: 50,
          message: '紧急召回奖励：100金币 + 50经验'
        };
      } else if (silentDays >= CHURN_THRESHOLD_DAYS) {
        return {
          coins: 50,
          experience: 25,
          message: '回归奖励：50金币 + 25经验'
        };
      }

      return null;
    }

    // 领取召回奖励
    function claimRecallReward() {
      const reward = getRecallReward();
      if (!reward) return { success: false, message: '无奖励可领取' };

      // 添加奖励
      const coins = storage.get('coins') || 0;
      const experience = storage.get('experience') || 0;

      storage.set('coins', coins + reward.coins);
      storage.set('experience', experience + reward.experience);

      // 清除流失预警状态
      storage.set('lastActiveTime', Date.now());

      return {
        success: true,
        message: reward.message,
        coins: reward.coins,
        experience: reward.experience
      };
    }

    // 每次游戏结束后调用，更新活跃时间
    function onGameEnd() {
      updateLastActiveTime();
    }

    return {
      getLastActiveTime,
      updateLastActiveTime,
      getSilentDays,
      getChurnRiskLevel,
      shouldShowRecallModal,
      markRecallModalShown,
      getRecallReward,
      claimRecallReward,
      onGameEnd,
      CHURN_THRESHOLD_DAYS,
      URGENT_THRESHOLD_DAYS
    };
  }

  // 暴露到全局
  window.SnakeChurnWarning = {
    createChurnWarningModule
  };
})();
