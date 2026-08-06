/**
 * 购买反馈系统 v1.21.0 (优化版)
 * 
 * 规范遵循:
 * - 统一返回类型: { success, data/error }
 * - 公开函数不超过 5 个
 * 
 * 改进:
 * - 使用 CSS 类而非内联样式
 * - 复用 achievement_toast 的全局样式
 */
(function() {
  'use strict';

  const TOAST_DURATION = 3000;
  const STORAGE_KEY = 'purchaseHistory';

  function createPurchaseFeedbackModule({ storage }) {
    if (!storage) return null;

    // 私有: 创建 toast 元素
    function createToast(content) {
      const toast = document.createElement('div');
      toast.className = 'purchase-toast';
      toast.innerHTML = content;
      document.body.appendChild(toast);

      // Auto remove
      setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
      }, TOAST_DURATION);
    }

    // 公开: 获取数据 (主入口)
    function getData() {
      try {
        const purchaseHistory = storage.get(STORAGE_KEY) || [];
        return {
          success: true,
          data: {
            totalPurchases: purchaseHistory.length,
            recentPurchases: purchaseHistory.slice(-5),
            totalSpent: purchaseHistory.reduce((sum, p) => sum + (p.coinsSpent || 0), 0)
          }
        };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 显示购买成功 toast
    function showPurchaseToast(itemName, cost, itemType) {
      try {
        const icons = { skin: '👕', boost: '⚡', unlock: '🔓', other: '🎁' };
        const icon = icons[itemType] || '🎁';

        const content = `
          <div class="toast-inner toast-purchase">
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
              <div class="toast-title">购买成功</div>
              <div class="toast-name">${itemName}</div>
            </div>
            <div class="toast-reward">-${cost}金币</div>
          </div>
        `;

        createToast(content);

        // Save to history
        const history = storage.get(STORAGE_KEY) || [];
        history.push({ itemName, cost, itemType, timestamp: Date.now() });
        storage.set(STORAGE_KEY, history.slice(-50));

        return { success: true, result: { purchased: true } };
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
            totalPurchases: data.totalPurchases,
            totalSpent: data.totalSpent
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

    // 公开 API (4 个函数, 符合规范)
    return {
      getData,
      showPurchaseToast,
      getSummary,
      validate
    };
  }

  window.SnakePurchaseFeedback = { createPurchaseFeedbackModule };
})();

const SnakePurchaseFeedback = window.SnakePurchaseFeedback;
export { SnakePurchaseFeedback };
