/**
 * 效果计时域模块 (B3 迁移: 从 game.js 闭包迁入)
 * 职责: 本局 6 个效果计时状态 — scoreMultiplier / multiplierExpireAt /
 * freezeUntil / phaseUntil / magnetUntil / comboGuardUntil。
 * 纯状态模块: 无 DOM 依赖、无存储依赖; UI 同步 (multiplierEl / refreshStateText)
 * 由调用方 game.js 负责。
 *
 * 合并语义说明: 所有 until 类 setter 内部 Math.max 合并。
 * 与迁移前语义等价 —— 各效果单次时长 4000~8000ms 且 now 单调递增,
 * 直接赋值与 max 合并结果一致 (现有最大时长 8000 恒不小于已有剩余时长)。
 */
window.SnakeEffectTimer = (() => {
  function createEffectTimerModule() {
    let scoreMultiplier = 1;
    let multiplierExpireAt = 0;
    let freezeUntil = 0;
    let phaseUntil = 0;
    let magnetUntil = 0;
    let comboGuardUntil = 0;

    function getMultiplier() { return scoreMultiplier; }
    function getMultiplierExpireAt() { return multiplierExpireAt; }
    function getFreezeUntil() { return freezeUntil; }
    function getPhaseUntil() { return phaseUntil; }
    function getMagnetUntil() { return magnetUntil; }
    function getComboGuardUntil() { return comboGuardUntil; }

    // 设置倍率 + 到期时间 (内部 max 合并, 与迁移前 Math.max 语义一致)
    function setMultiplier(mult, until) {
      scoreMultiplier = mult;
      if (until > multiplierExpireAt) multiplierExpireAt = until;
    }

    function setFreeze(until) { if (until > freezeUntil) freezeUntil = until; }
    function setPhase(until) { if (until > phaseUntil) phaseUntil = until; }
    function setMagnet(until) { if (until > magnetUntil) magnetUntil = until; }
    function setComboGuard(until) { if (until > comboGuardUntil) comboGuardUntil = until; }

    // 主循环每帧调用: 过期清理 (含 scoreMultiplier 归 1)。
    // 返回 { multiplierExpired } 供调用方同步倍率 UI (multiplierEl)。
    function expireCheck(now) {
      let multiplierExpired = false;
      if (scoreMultiplier > 1 && now > multiplierExpireAt) {
        scoreMultiplier = 1;
        multiplierExpired = true;
      }
      if (now > freezeUntil) freezeUntil = 0;
      if (now > phaseUntil) phaseUntil = 0;
      if (now > magnetUntil) magnetUntil = 0;
      if (now > comboGuardUntil) comboGuardUntil = 0;
      return { multiplierExpired };
    }

    // 快照恢复 (roundMeta → 本局状态, 由 resetFlow applyRoundMeta 调用)
    function setFromSnapshot(meta) {
      if (!meta) return;
      scoreMultiplier = Number(meta.scoreMultiplier) || 1;
      multiplierExpireAt = Number(meta.multiplierExpireAt) || 0;
      freezeUntil = Number(meta.freezeUntil) || 0;
      phaseUntil = Number(meta.phaseUntil) || 0;
      magnetUntil = Number(meta.magnetUntil) || 0;
      comboGuardUntil = Number(meta.comboGuardUntil) || 0;
    }

    // 快照导出 (供 roundMeta/持久化; 当前 roundMeta 由 round_state 新建, 暂无消费方, 保留为 API 完整性)
    function getSnapshot() {
      return {
        scoreMultiplier,
        multiplierExpireAt,
        freezeUntil,
        phaseUntil,
        magnetUntil,
        comboGuardUntil
      };
    }

    return {
      getMultiplier,
      getMultiplierExpireAt,
      getFreezeUntil,
      getPhaseUntil,
      getMagnetUntil,
      getComboGuardUntil,
      setMultiplier,
      setFreeze,
      setPhase,
      setMagnet,
      setComboGuard,
      expireCheck,
      setFromSnapshot,
      getSnapshot
    };
  }

  return { createEffectTimerModule };
})();

const SnakeEffectTimer = window.SnakeEffectTimer;
export { SnakeEffectTimer };
