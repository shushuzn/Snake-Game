/**
 * 回流提醒系统 v1.14.0
 * 
 * 规范遵循:
 * - 统一返回类型: { success, data/error }
 * - 公开函数不超过 5 个
 * - 有 getData() 主入口
 */
(function() {
  'use strict';

  function createReturnReminderModule({ storage }) {
    if (!storage) return null;

    const REMINDER_INTERVALS = [1, 3, 7, 14, 30]; // days

    // 私有: 获取上次提醒时间
    function getLastReminderTime() {
      return storage.get('returnReminderLastShown') || 0;
    }

    // 私有: 设置上次提醒时间
    function setLastReminderTime(time) {
      storage.set('returnReminderLastShown', time);
    }

    // 公开: 获取数据 (主入口)
    function getData() {
      try {
        const lastActive = storage.get('lastActiveTime') || Date.now();
        const daysSinceActive = Math.floor((Date.now() - lastActive) / (1000 * 60 * 60 * 24));
        const lastReminder = getLastReminderTime();
        const hoursSinceReminder = (Date.now() - lastReminder) / (1000 * 60 * 60);

        // 计算下次提醒时间
        const nextReminderDay = REMINDER_INTERVALS.find(d => d > daysSinceActive) || 30;
        const daysUntilNext = nextReminderDay - daysSinceActive;

        return {
          success: true,
          data: {
            daysSinceActive,
            hoursSinceReminder,
            shouldRemind: shouldShowReminder(daysSinceActive, hoursSinceReminder),
            nextReminderInDays: daysUntilNext,
            nextReminderDay
          }
        };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 私有: 判断是否应该显示提醒
    function shouldShowReminder(daysSinceActive, hoursSinceReminder) {
      if (daysSinceActive < 1) return false;
      if (daysSinceActive >= 30) return hoursSinceReminder >= 12;
      if (daysSinceActive >= 7) return hoursSinceReminder >= 24;
      if (daysSinceActive >= 3) return hoursSinceReminder >= 36;
      return hoursSinceReminder >= 48;
    }

    // 公开: 获取摘要
    function getSummary() {
      try {
        const { data } = getData();
        return {
          success: true,
          summary: {
            status: data.daysSinceActive < 1 ? 'active' : 'inactive',
            shouldRemind: data.shouldRemind,
            daysSinceActive: data.daysSinceActive
          }
        };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 标记已提醒
    function markReminded() {
      try {
        setLastReminderTime(Date.now());
        return { success: true, result: { reminded: true } };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 获取提醒消息
    function getReminderMessage() {
      try {
        const { data } = getData();
        const messages = {
          1: '好久不见！回来玩一把？',
          3: '3 天没见了，快回来看看！',
          7: '一周没玩啦，奖励等你领取！',
          14: '两周不见，我们升级了新功能！',
          30: '一个月了！回来就送大礼包！'
        };
        const msg = messages[data.nextReminderDay] || '回来玩吧！';
        return { success: true, data: { message: msg, days: data.daysSinceActive } };
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
      getSummary,
      markReminded,
      getReminderMessage,
      validate
    };
  }

  window.SnakeReturnReminder = { createReturnReminderModule };
})();

const SnakeReturnReminder = window.SnakeReturnReminder;
export { SnakeReturnReminder };
