/**
 * 成就解锁 Toast 通知系统 v1.21.0 (优化版)
 * 
 * 规范遵循:
 * - 统一返回类型: { success, data/error }
 * - 公开函数不超过 5 个
 * - 有 getData() 主入口
 * 
 * 改进:
 * - CSS 样式在模块初始化时创建，避免重复创建 style 元素
 */
(function() {
  'use strict';

  const MAX_TOASTS = 3;
  const TOAST_DURATION = 4000;
  const STYLE_ID = 'snake-toast-styles';
  const STORAGE_KEY = 'shownAchievementToasts';

  // 初始化全局 toast 样式（只执行一次）
  function initGlobalStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @keyframes toastSlideIn { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }
      @keyframes toastSlideOut { from { transform: translateX(0); opacity:1; } to { transform: translateX(100%); opacity:0; } }
      .achievement-toast, .purchase-toast { position:fixed; top:20px; right:20px; z-index:9999; }
      .achievement-toast.hiding, .purchase-toast.hiding { animation:toastSlideOut 0.3s ease-in forwards; }
      .toast-inner { display:flex; align-items:center; gap:10px; padding:12px 16px; background:linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.4); min-width:280px; animation:toastSlideIn 0.3s ease-out; }
      .toast-achievement { border:2px solid #f59e0b; }
      .toast-purchase { border:2px solid #22c55e; }
      .toast-icon { font-size:32px; }
      .toast-content { flex:1; }
      .toast-title { font-weight:bold; font-size:14px; }
      .toast-achievement .toast-title { color:#f59e0b; }
      .toast-purchase .toast-title { color:#22c55e; }
      .toast-name { color:#fff; font-size:13px; }
      .toast-reward { color:#ffd700; font-size:18px; }
    `;
    document.head.appendChild(style);
  }

  function createAchievementToastModule({ storage }) {
    if (!storage) return null;

    // 初始化时创建全局样式
    initGlobalStyles();

    // 私有: 获取已显示的通知
    function getShownToasts() {
      return storage.get(STORAGE_KEY) || [];
    }

    // 私有: 保存已显示的通知
    function saveShownToasts(toasts) {
      storage.set(STORAGE_KEY, toasts.slice(-50));
    }

    // 公开: 获取数据 (主入口)
    function getData() {
      try {
        const shown = getShownToasts();
        return {
          success: true,
          data: {
            shownCount: shown.length,
            latestToast: shown[shown.length - 1] || null,
            recentToasts: shown.slice(-MAX_TOASTS)
          }
        };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 显示成就解锁 toast
    function showAchievementToast(achievement) {
      try {
        if (!achievement || !achievement.id) {
          return { success: false, error: 'Invalid achievement' };
        }

        // Check if already shown recently
        const shown = getShownToasts();
        const recent = shown.find(t => t.id === achievement.id && Date.now() - t.time < 60000);
        if (recent) {
          return { success: false, error: 'Already shown recently' };
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
          <div class="toast-inner toast-achievement">
            <div class="toast-icon">🏆</div>
            <div class="toast-content">
              <div class="toast-title">成就解锁</div>
              <div class="toast-name">${achievement.name || 'Unknown'}</div>
            </div>
            <div class="toast-reward">+${achievement.reward || 0}</div>
          </div>
        `;

        document.body.appendChild(toast);

        // Remove old toasts if too many
        const existingToasts = document.querySelectorAll('.achievement-toast:not(.hiding)');
        if (existingToasts.length > MAX_TOASTS) {
          existingToasts[0].classList.add('hiding');
          setTimeout(() => existingToasts[0].remove(), 300);
        }

        // Auto remove after duration
        setTimeout(() => {
          toast.classList.add('hiding');
          setTimeout(() => toast.remove(), 300);
        }, TOAST_DURATION);

        // Save to history
        shown.push({ id: achievement.id, name: achievement.name, time: Date.now() });
        saveShownToasts(shown);

        return { success: true, result: { toastId: achievement.id } };
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
            shownCount: data.shownCount,
            hasRecentToast: data.recentToasts.length > 0
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
      showAchievementToast,
      getSummary,
      validate
    };
  }

  window.SnakeAchievementToast = { createAchievementToastModule };
})();

const SnakeAchievementToast = window.SnakeAchievementToast;
export { SnakeAchievementToast };
