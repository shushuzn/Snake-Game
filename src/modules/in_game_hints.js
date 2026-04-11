/**
 * 游戏内提示系统 v1.9.0
 * 实时游戏内提示，提升 progress_clarity
 */
(function() {
  'use strict';

  // 提示配置
  const HINT_TYPES = {
    FOOD: 'food',
    DANGER: 'danger',
    GROWTH: 'growth',
    ACHIEVEMENT: 'achievement',
    TIP: 'tip'
  };

  const HINT_MESSAGES = {
    [HINT_TYPES.FOOD]: [
      '寻找食物聚集的区域',
      '食物附近可能有危险'
    ],
    [HINT_TYPES.DANGER]: [
      '前方有障碍物，注意躲避',
      '身体越长越容易碰撞'
    ],
    [HINT_TYPES.GROWTH]: [
      '保持稳定的生长节奏',
      '不要急于求成'
    ],
    [HINT_TYPES.ACHIEVEMENT]: [
      '再吃 {count} 个食物即可达成成就',
      '当前连击数：{combo}'
    ],
    [HINT_TYPES.TIP]: [
      '使用道具可以获得优势',
      '护盾可以抵挡一次碰撞'
    ]
  };

  function createInGameHintsModule({ storage }) {
    if (!storage) return null;

    // 获取提示显示设置
    function isHintsEnabled() {
      return storage.get('hintsEnabled') !== false; // 默认开启
    }

    // 设置提示显示
    function setHintsEnabled(enabled) {
      storage.set('hintsEnabled', enabled);
    }

    // 获取当前分数
    function getCurrentScore() {
      return storage.get('currentGameScore') || 0;
    }

    // 获取当前连击
    function getCurrentCombo() {
      return storage.get('currentGameCombo') || 0;
    }

    // 获取下一个成就目标
    function getNextAchievementTarget() {
      const progress = storage.get('achievementProgress') || {};
      const records = storage.get('gameRecords') || [];

      // 找到最近未完成的成就
      const achievements = window.ACHIEVEMENTS || [];
      for (const achievement of achievements) {
        const current = progress[achievement.id]?.current || 0;
        if (current < achievement.threshold) {
          return {
            name: achievement.name,
            current,
            target: achievement.threshold,
            description: achievement.description
          };
        }
      }

      return null;
    }

    // 生成随机提示
    function getRandomHint(type) {
      const messages = HINT_MESSAGES[type] || HINT_MESSAGES[HINT_TYPES.TIP];
      const message = messages[Math.floor(Math.random() * messages.length)];

      // 替换占位符
      return message
        .replace('{count}', Math.max(0, 5 - (getCurrentScore() % 5)))
        .replace('{combo}', getCurrentCombo());
    }

    // 获取基于当前状态的提示
    function getContextualHint(gameState) {
      if (!isHintsEnabled()) return null;

      // 基于游戏状态返回相关提示
      if (gameState.isGrowing && getCurrentCombo() > 3) {
        return {
          type: HINT_TYPES.ACHIEVEMENT,
          message: getRandomHint(HINT_TYPES.ACHIEVEMENT),
          duration: 3000
        };
      }

      if (gameState.snakeLength > 5) {
        return {
          type: HINT_TYPES.DANGER,
          message: getRandomHint(HINT_TYPES.DANGER),
          duration: 2500
        };
      }

      if (Math.random() < 0.3) {
        return {
          type: HINT_TYPES.TIP,
          message: getRandomHint(HINT_TYPES.TIP),
          duration: 2000
        };
      }

      return null;
    }

    // 获取成就进度提示
    function getAchievementHint() {
      const target = getNextAchievementTarget();
      if (!target) return null;

      const progress = Math.round((target.current / target.target) * 100);

      return {
        type: HINT_TYPES.ACHIEVEMENT,
        message: `成就进度：${target.name} (${progress}%)`,
        details: `${target.current}/${target.target}`,
        duration: 4000
      };
    }

    // 提示频率设置
    function getHintFrequency() {
      return storage.get('hintFrequency') || 'normal'; // low, normal, high
    }

    // 设置提示频率
    function setHintFrequency(frequency) {
      storage.set('hintFrequency', frequency);
    }

    // 获取提示间隔（毫秒）
    function getHintInterval() {
      const frequency = getHintFrequency();
      switch (frequency) {
        case 'low': return 60000;
        case 'high': return 15000;
        default: return 30000;
      }
    }

    return {
      isHintsEnabled,
      setHintsEnabled,
      getCurrentScore,
      getCurrentCombo,
      getNextAchievementTarget,
      getRandomHint,
      getContextualHint,
      getAchievementHint,
      getHintFrequency,
      setHintFrequency,
      getHintInterval,
      HINT_TYPES
    };
  }

  // 暴露到全局
  window.SnakeInGameHints = {
    createInGameHintsModule
  };
})();
