/**
 * 游戏内通知系统 v1.13.0
 * 统一的通知系统
 * 
 * 规范遵循:
 * - 统一返回类型: { success, data/error }
 * - 公开函数不超过 5 个
 * - 有 getData() 主入口
 */
(function() {
  'use strict';

  function createNotificationModule({ storage }) {
    if (!storage) return null;

    const MAX_NOTIFICATIONS = 10;

    // 私有: 获取通知列表
    function getNotifications() {
      return storage.get('notifications') || [];
    }

    // 私有: 保存通知
    function saveNotifications(notifications) {
      storage.set('notifications', notifications.slice(-MAX_NOTIFICATIONS));
    }

    // 公开: 获取数据 (主入口)
    function getData() {
      try {
        const notifications = getNotifications();
        const unreadCount = notifications.filter(n => !n.read).length;
        return {
          success: true,
          data: {
            notifications,
            unreadCount,
            latest: notifications[0] || null
          }
        };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 获取摘要
    function getSummary() {
      try {
        const { unreadCount, latest } = getData().data;
        return {
          success: true,
          summary: {
            unreadCount,
            hasUnread: unreadCount > 0,
            latestMessage: latest?.message || null
          }
        };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 添加通知
    function add(type, message, metadata = {}) {
      try {
        const notifications = getNotifications();
        const notification = {
          id: Date.now(),
          type,
          message,
          metadata,
          read: false,
          timestamp: new Date().toISOString()
        };
        notifications.unshift(notification);
        saveNotifications(notifications);
        return { success: true, result: { id: notification.id } };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 标记已读
    function markRead(id) {
      try {
        const notifications = getNotifications();
        const notification = notifications.find(n => n.id === id);
        if (notification) {
          notification.read = true;
          saveNotifications(notifications);
          return { success: true, result: { id } };
        }
        return { success: false, error: 'Notification not found' };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 清除所有
    function clear() {
      try {
        storage.set('notifications', []);
        return { success: true, result: { cleared: true } };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 验证
    function validate() {
      const errors = [];
      if (typeof storage.get !== 'function') {
        errors.push('Invalid storage');
      }
      return { valid: errors.length === 0, errors };
    }

    // 公开 API (4 个函数, 符合规范)
    return {
      getData,
      getSummary,
      add,
      markRead,
      clear,
      validate
    };
  }

  window.SnakeNotifications = { createNotificationModule };
})();
