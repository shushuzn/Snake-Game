(function initSnakeSettlement(global) {
  function createSettlementModule({ settlementListEl }) {
    const state = {
      startBonus: 0,
      fruitBonus: 0,
      crownBonus: 0,
      scoreBySource: {
        food: 0,
        bonus: 0,
        timeFruit: 0,
        crown: 0,
        comboFruit: 0,
        comboChain: 0,
        milestone: 0
      }
    };

    function resetRound(startBonus = 0) {
      state.startBonus = Math.max(0, Number(startBonus) || 0);
      state.fruitBonus = 0;
      state.crownBonus = 0;
      for (const key of Object.keys(state.scoreBySource)) state.scoreBySource[key] = 0;
    }

    function addScore(source, points) {
      const value = Number(points || 0);
      if (!value) return;
      if (Object.hasOwn(state.scoreBySource, source)) state.scoreBySource[source] += value;
    }

    function addTimeBonus(type, seconds) {
      const value = Math.max(0, Number(seconds) || 0);
      if (!value) return;
      if (type === 'fruit') state.fruitBonus += value;
      if (type === 'crown') state.crownBonus += value;
    }

    function render({ modeLabel, dlcText, score, timerMode, remainingTime }) {
      if (!settlementListEl) return;
      const lines = [
        `模式：${modeLabel}`,
        `DLC：${dlcText}`,
        `得分：${score}`,
        `得分拆分：基础果 ${state.scoreBySource.food} / 奖励果 ${state.scoreBySource.bonus} / 时间果 ${state.scoreBySource.timeFruit} / 王冠 ${state.scoreBySource.crown} / 连击果 ${state.scoreBySource.comboFruit} / 连击奖励 ${state.scoreBySource.comboChain} / 里程碑 ${state.scoreBySource.milestone}`
      ];

      if (timerMode) {
        lines.push(`开局加时：+${state.startBonus}s`);
        lines.push(`时间果加时：+${state.fruitBonus}s`);
        lines.push(`王冠加时：+${state.crownBonus}s`);
        if (typeof remainingTime === 'number') lines.push(`结束剩余：${Math.max(0, Math.ceil(remainingTime))}s`);
      }

      settlementListEl.innerHTML = lines.map(line => `<li>${line}</li>`).join('');
    }

    return { resetRound, addScore, addTimeBonus, render };
  }

  global.SnakeSettlement = { createSettlementModule };
})(window);
