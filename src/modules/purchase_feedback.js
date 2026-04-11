/**
 * 购买反馈系统 v1.18.0
 * 
 * 规范遵循:
 * - 统一返回类型: { success, data/error }
 * - 公开函数不超过 5 个
 */
(function() {
  'use strict';

  function createPurchaseFeedbackModule({ storage }) {
    if (!storage) return null;

    const TOAST_DURATION = 3000;

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
        const purchaseHistory = storage.get('purchaseHistory') || [];
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
          <div style="display:flex; align-items:center; gap:10px; padding:12px 16px; background:linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border:2px solid #22c55e; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.4); min-width:220px; animation:slideIn 0.3s ease-out;">
            <div style="font-size:28px;">${icon}</div>
            <div style="flex:1;">
              <div style="color:#22c55e; font-weight:bold; font-size:13px;">购买成功</div>
              <div style="color:#fff; font-size:14px;">${itemName}</div>
            </div>
            <div style="color:#ffd700; font-size:14px;">-${cost}金币</div>
          </div>
        `;

        createToast(content);

        // Save to history
        const history = storage.get('purchaseHistory') || [];
        history.push({ itemName, cost, itemType, timestamp: Date.now() });
        storage.set('purchaseHistory', history.slice(-50));

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
