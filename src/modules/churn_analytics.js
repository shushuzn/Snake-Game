/**
 * 流失玩家分析系统 v1.8.0
 * 分析玩家流失原因，提供改进建议
 */
(function() {
  'use strict';

  // 沉默天数阈值
  const CHURN_THRESHOLD_DAYS = 3;
  const HIGH_RISK_DAYS = 7;

  function createChurnAnalyticsModule({ storage }) {
    if (!storage) return null;

    // 获取玩家游戏记录
    function getGameRecords() {
      return storage.get('gameRecords') || [];
    }

    // 获取最后活跃时间
    function getLastActiveTime() {
      return storage.get('lastActiveTime') || Date.now();
    }

    // 计算沉默天数
    function getSilentDays() {
      const lastActive = getLastActiveTime();
      const now = Date.now();
      return Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
    }

    // 分析流失风险
    function analyzeChurnRisk() {
      const records = getGameRecords();
      const silentDays = getSilentDays();

      // 风险等级
      let riskLevel = 'low';
      if (silentDays >= HIGH_RISK_DAYS) {
        riskLevel = 'high';
      } else if (silentDays >= CHURN_THRESHOLD_DAYS) {
        riskLevel = 'medium';
      }

      // 分析流失原因
      const reasons = [];

      if (records.length === 0) {
        reasons.push({ type: 'new_player', message: '新玩家，尚未建立游戏习惯' });
      } else {
        // 分析游戏频率
        const lastWeekRecords = records.filter(r => {
          const gameTime = new Date(r.timestamp || r.date).getTime();
          const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          return gameTime > weekAgo;
        });

        if (lastWeekRecords.length === 0 && records.length > 0) {
          reasons.push({ type: 'no_recent_games', message: '超过7天没有游戏记录' });
        }

        // 分析游戏表现
        const avgScore = records.reduce((sum, r) => sum + (r.score || 0), 0) / records.length;
        if (avgScore < 100) {
          reasons.push({ type: 'low_performance', message: '平均分较低，可能缺乏成就感' });
        }

        // 分析成就进度
        const achievementProgress = storage.get('achievementProgress') || {};
        const unlockedCount = Object.values(achievementProgress).filter(a => a?.unlocked).length;
        if (unlockedCount === 0 && records.length >= 5) {
          reasons.push({ type: 'no_achievements', message: '游戏次数较多但未解锁任何成就' });
        }

        // 分析模式多样性
        const modesPlayed = new Set(records.map(r => r.mode));
        if (modesPlayed.size === 1 && records.length >= 10) {
          reasons.push({ type: 'limited_modes', message: '只玩单一模式，可能缺乏新鲜感' });
        }
      }

      return {
        riskLevel,
        silentDays,
        reasons,
        totalGames: records.length,
        isAtRisk: silentDays >= CHURN_THRESHOLD_DAYS
      };
    }

    // 获取流失风险建议
    function getImprovementSuggestions() {
      const analysis = analyzeChurnRisk();
      const suggestions = [];

      if (analysis.riskLevel === 'high') {
        suggestions.push({
          priority: 'high',
          area: 'retention',
          suggestion: '发送回流召回通知，提供丰厚回归礼包'
        });
      }

      analysis.reasons.forEach(reason => {
        switch (reason.type) {
          case 'new_player':
            suggestions.push({
              priority: 'high',
              area: 'onboarding',
              suggestion: '简化新手引导，提供快速上手奖励'
            });
            break;
          case 'no_recent_games':
            suggestions.push({
              priority: 'medium',
              area: 'engagement',
              suggestion: '增加每日任务奖励，激励每日登录'
            });
            break;
          case 'low_performance':
            suggestions.push({
              priority: 'medium',
              area: 'difficulty',
              suggestion: '提供难度调整选项，降低入门门槛'
            });
            break;
          case 'no_achievements':
            suggestions.push({
              priority: 'low',
              area: 'progression',
              suggestion: '设计更容易达成的成就，提升成就感'
            });
            break;
          case 'limited_modes':
            suggestions.push({
              priority: 'low',
              area: 'content',
              suggestion: '推荐其他游戏模式，提供试玩机会'
            });
            break;
        }
      });

      return suggestions.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    }

    // 获取留存率统计
    function getRetentionStats() {
      const records = getGameRecords();

      if (records.length === 0) {
        return {
          day1Retention: 0,
          day7Retention: 0,
          day30Retention: 0,
          totalPlayers: 0
        };
      }

      // 简化计算：基于记录时间分布估算
      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

      const day1 = records.filter(r => new Date(r.timestamp || r.date).getTime() > dayAgo).length;
      const day7 = records.filter(r => new Date(r.timestamp || r.date).getTime() > weekAgo).length;
      const day30 = records.filter(r => new Date(r.timestamp || r.date).getTime() > monthAgo).length;

      return {
        day1Retention: records.length > 0 ? Math.min(100, (day1 / records.length) * 100) : 0,
        day7Retention: records.length > 0 ? Math.min(100, (day7 / records.length) * 100) : 0,
        day30Retention: records.length > 0 ? Math.min(100, (day30 / records.length) * 100) : 0,
        totalPlayers: records.length
      };
    }

    return {
      getGameRecords,
      getLastActiveTime,
      getSilentDays,
      analyzeChurnRisk,
      getImprovementSuggestions,
      getRetentionStats,
      CHURN_THRESHOLD_DAYS,
      HIGH_RISK_DAYS
    };
  }

  // 暴露到全局
  window.SnakeChurnAnalytics = {
    createChurnAnalyticsModule
  };
})();

const SnakeChurnAnalytics = window.SnakeChurnAnalytics;
export { SnakeChurnAnalytics };
