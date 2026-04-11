/**
 * 成就解锁 Toast 通知系统 v1.17.0
 * 
 * 规范遵循:
 * - 统一返回类型: { success, data/error }
 * - 公开函数不超过 5 个
 * - 有 getData() 主入口
 */
(function() {
  'use strict';

  function createAchievementToastModule({ storage }) {
    if (!storage) return null;

    const MAX_TOASTS = 3;
    const TOAST_DURATION = 4000;

    // 私有: 获取已显示的通知
    function getShownToasts() {
      return storage.get('shownAchievementToasts') || [];
    }

    // 私有: 保存已显示的通知
    function saveShownToasts(toasts) {
      storage.set('shownAchievementToasts', toasts.slice(-50));
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
          <div style="display:flex; align-items:center; gap:10px; padding:12px 16px; background:linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border:2px solid #f59e0b; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.4); min-width:280px; animation:slideIn 0.3s ease-out;">
            <div style="font-size:32px;">🏆</div>
            <div style="flex:1;">
              <div style="color:#f59e0b; font-weight:bold; font-size:14px;">成就解锁</div>
              <div style="color:#fff; font-size:13px;">${achievement.name || 'Unknown'}</div>
            </div>
            <div style="color:#ffd700; font-size:18px;">+${achievement.reward || 0}</div>
          </div>
        `;

        // Add animation keyframes if not exists
        if (!document.getElementById('toast-styles')) {
          const style = document.createElement('style');
          style.id = 'toast-styles';
          style.textContent = `
            @keyframes slideIn { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity:1; } to { transform: translateX(100%); opacity:0; } }
            .achievement-toast { position:fixed; top:20px; right:20px; z-index:9999; }
            .achievement-toast.hiding { animation:slideOut 0.3s ease-in forwards; }
          `;
          document.head.appendChild(style);
        }

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
          setTimeout(() => {
            toast.remove();
            // Clean up styles if no toasts left
            if (document.querySelectorAll('.achievement-toast').length === 0) {
              const style = document.getElementById('toast-styles');
              if (style) style.remove();
            }
          }, 300);
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
      if (typeof document !== 'object') errors.push('Invalid document');
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
