/**
 * 奖励预览面板 v1.24.0
 * 
 * 功能：显示用户可获奖励列表
 * 规范遵循:
 * - 统一返回类型: { success, data/error }
 * - 公开函数不超过 5 个
 */
(function() {
  'use strict';

  function createRewardPreviewModule({ rewardSystem, storage }) {
    if (!rewardSystem || !storage) return null;

    // 私有: 获取奖励状态
    function getRewardStatus(rule) {
      const summary = rewardSystem.getSummary().summary;
      const isPending = summary.pendingRewards.some(r => r.id === rule.id);
      const claimed = summary.claimedCount > 0 && 
        !summary.pendingRewards.some(r => r.id === rule.id);
      
      return {
        id: rule.id,
        name: getRuleName(rule.id),
        reward: rule.reward,
        status: isPending ? 'pending' : (claimed ? 'claimed' : 'locked'),
        condition: rule.condition,
        once: rule.once
      };
    }

    // 私有: 规则名称映射
    function getRuleName(ruleId) {
      const names = {
        'first_game': '首战完成',
        'first_win': '首战告捷',
        'score_50': '得分达人',
        'score_100': '百分挑战',
        'streak_3': '三连胜',
        'games_10': '老手玩家'
      };
      return names[ruleId] || ruleId;
    }

    // 私有: 获取条件描述
    function getConditionDesc(rule) {
      if (!rule.condition) return '';
      const { gamesPlayed, gamesWon, minScore } = rule.condition;
      if (typeof gamesPlayed === 'number' && gamesPlayed === 0) return '完成第一局游戏';
      if (typeof gamesWon === 'number' && gamesWon === 0) return '赢得第一局';
      if (typeof minScore === 'number') return `得分达到 ${minScore}`;
      return '';
    }

    // 公开: 获取数据 (主入口)
    function getData() {
      try {
        const { data } = rewardSystem.getData();
        const statuses = data.rules.map(rule => ({
          ...getRewardStatus(rule),
          conditionDesc: getConditionDesc(rule)
        }));
        
        return {
          success: true,
          data: {
            rewards: statuses,
            totalRules: statuses.length,
            pendingCount: statuses.filter(r => r.status === 'pending').length,
            claimedCount: statuses.filter(r => r.status === 'claimed').length
          }
        };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 显示预览面板
    function showPreview() {
      try {
        const { data } = getData();
        const pending = data.rewards.filter(r => r.status === 'pending');
        const locked = data.rewards.filter(r => r.status === 'locked');
        const claimed = data.rewards.filter(r => r.status === 'claimed');

        let html = `
          <div style="padding:15px; color:#fff; max-width:320px;">
            <h3 style="text-align:center; margin:0 0 15px; color:#f59e0b;">🎁 奖励预览</h3>
        `;

        // Pending rewards (can claim now)
        if (pending.length > 0) {
          html += '<div style="margin-bottom:15px;">';
          pending.forEach(r => {
            html += `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:10px; background:linear-gradient(135deg, #1a1a2e, #16213e); border-radius:8px; margin-bottom:8px; border:1px solid #f59e0b;">
                <div>
                  <div style="color:#f59e0b; font-weight:bold;">${r.name}</div>
                  <div style="color:#9ca3af; font-size:12px;">${r.conditionDesc}</div>
                </div>
                <div style="color:#ffd700; font-size:18px;">+${r.reward.amount}</div>
              </div>
            `;
          });
          html += '</div>';
        }

        // Locked rewards (not yet earned)
        if (locked.length > 0) {
          html += '<div style="margin-bottom:15px;">';
          html += '<div style="color:#6b7280; font-size:12px; margin-bottom:8px;">进行中</div>';
          locked.forEach(r => {
            html += `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:10px; background:rgba(255,255,255,0.05); border-radius:8px; margin-bottom:8px; opacity:0.7;">
                <div>
                  <div style="color:#d1d5db;">${r.name}</div>
                  <div style="color:#6b7280; font-size:12px;">${r.conditionDesc}</div>
                </div>
                <div style="color:#6b7280;">+${r.reward.amount}</div>
              </div>
            `;
          });
          html += '</div>';
        }

        // Claimed rewards
        if (claimed.length > 0) {
          html += '<div>';
          html += '<div style="color:#6b7280; font-size:12px; margin-bottom:8px;">已完成</div>';
          claimed.forEach(r => {
            html += `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:10px; background:rgba(34,197,94,0.1); border-radius:8px; margin-bottom:8px; border:1px solid rgba(34,197,94,0.3);">
                <div>
                  <div style="color:#22c55e;">${r.name}</div>
                  <div style="color:#6b7280; font-size:12px;">${r.conditionDesc}</div>
                </div>
                <div style="color:#22c55e;">✓</div>
              </div>
            `;
          });
          html += '</div>';
        }

        html += '</div>';

        // Use game's showOverlay if available
        if (typeof showOverlay === 'function') {
          showOverlay(html);
        }

        return { success: true, result: { shown: true } };
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
            totalRewards: data.totalRules,
            pendingRewards: data.pendingCount,
            claimedRewards: data.claimedCount
          }
        };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 公开: 验证
    function validate() {
      const errors = [];
      if (!rewardSystem) errors.push('Invalid rewardSystem');
      if (typeof storage.get !== 'function') errors.push('Invalid storage');
      return { valid: errors.length === 0, errors };
    }

    // 公开 API (5 个函数)
    return {
      getData,
      showPreview,
      getSummary,
      validate
    };
  }

  window.SnakeRewardPreview = { createRewardPreviewModule };
})();
