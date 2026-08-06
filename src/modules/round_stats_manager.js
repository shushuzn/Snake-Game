/**
 * 本局统计管理模块 (B2f 迁移: 从 game.js 闭包迁入)
 * 职责: 本局最高连击/本局食物/本局关键帧时间线。
 * 纯状态模块, 无 DOM 依赖; 由主循环写入、结算/复盘/统计读取。
 */
window.SnakeRoundStatsManager = (() => {
  function createModule() {
    let roundMaxCombo = 1;
    let roundFoodsEaten = 0;
    let roundKeyframes = [];

    function reset() {
      roundMaxCombo = 1;
      roundFoodsEaten = 0;
      roundKeyframes = [];
    }

    function recordCombo(comboValue) {
      roundMaxCombo = Math.max(roundMaxCombo, comboValue);
    }

    function recordFood() {
      roundFoodsEaten += 1;
    }

    // 关键帧: 去重 + 压栈 + 保留最近 8 条
    function recordKeyframe(label, detail) {
      const safeLabel = String(label || '').trim();
      const safeDetail = String(detail || '').trim();
      if (!safeLabel || !safeDetail) return;
      const duplicated = roundKeyframes.some((item) => item.label === safeLabel && item.detail === safeDetail);
      if (duplicated) return;
      roundKeyframes.push({ label: safeLabel, detail: safeDetail });
      if (roundKeyframes.length > 8) roundKeyframes = roundKeyframes.slice(-8);
    }

    function getMaxCombo() { return roundMaxCombo; }
    function getFoodsEaten() { return roundFoodsEaten; }
    function getTimeline() { return roundKeyframes; }

    // 从暂停/快照恢复本局统计
    function setFromSnapshot(meta) {
      if (typeof meta.roundMaxCombo === 'number') roundMaxCombo = meta.roundMaxCombo;
      if (typeof meta.roundFoodsEaten === 'number') roundFoodsEaten = meta.roundFoodsEaten;
      if (Array.isArray(meta.roundKeyframes)) roundKeyframes = meta.roundKeyframes;
    }

    function getSnapshot() {
      return {
        roundMaxCombo,
        roundFoodsEaten,
        roundKeyframes: [...roundKeyframes]
      };
    }

    return {
      reset,
      recordCombo,
      recordFood,
      recordKeyframe,
      getMaxCombo,
      getFoodsEaten,
      getTimeline,
      setFromSnapshot,
      getSnapshot
    };
  }

  return { createModule };
})();

const SnakeRoundStatsManager = window.SnakeRoundStatsManager;
export { SnakeRoundStatsManager };
