/**
 * 肉鸽模式管理模块 (B2i 迁移: 从 game.js 闭包迁入)
 * 职责: roguePerks(持久化 rogueMetaKey) + 本局突变状态
 * (speedDelta/scoreBonus/comboWindowBonus/startShield/mutatorLabel)。
 * UI 同步通过注入 elements 完成; 皮肤商店同步经 onSyncShop 回调。
 */
window.SnakeRogueManager = (() => {
  const MUTATOR_POOL = [
    { label: '疾风', speedDelta: -10, comboWindowBonus: -200 },
    { label: '丰收', scoreBonus: 2 },
    { label: '稳健', startShield: 1 },
    { label: '连击', comboWindowBonus: 350 }
  ];

  function createModule({ storage, key, elements, isRoguelikeMode, onSyncShop, onPersist, onRefreshDlcHud }) {
    let perks = 0;
    let mutatorLabel = '--';
    let speedDelta = 0;
    let scoreBonus = 0;
    let comboWindowBonus = 0;
    let startShield = 0;

    function refreshPerksUI() {
      elements.perksEl.textContent = String(perks);
    }

    function refreshMutatorUI() {
      elements.mutatorEl.textContent = mutatorLabel;
    }

    function load() {
      const parsed = storage.readJson(key, {});
      perks = Number(parsed.perks || 0);
      refreshPerksUI();
      onSyncShop(perks);
    }

    function save() {
      storage.writeJson(key, { perks });
      refreshPerksUI();
      onSyncShop(perks);
      if (onPersist) onPersist();
    }

    function getPerks() { return perks; }

    function setPerks(value) {
      perks = Number(value) || 0;
      save();
    }

    function addPerks(gain) {
      perks += Number(gain) || 0;
      save();
    }

    // 本局突变状态读取 (主循环/结算消费)
    function getMutatorLabel() { return mutatorLabel; }
    function getSpeedDelta() { return speedDelta; }
    function getScoreBonus() { return scoreBonus; }
    function getComboWindowBonus() { return comboWindowBonus; }
    function getStartShield() { return startShield; }

    // 随机选取本局突变 (roguelike 模式开局时由 resetPrepare 调用)
    function applyMutator() {
      speedDelta = 0;
      scoreBonus = 0;
      comboWindowBonus = 0;
      startShield = 0;
      mutatorLabel = '--';

      if (!isRoguelikeMode()) {
        refreshMutatorUI();
        if (onRefreshDlcHud) onRefreshDlcHud();
        return;
      }

      const pick = MUTATOR_POOL[Math.floor(Math.random() * MUTATOR_POOL.length)];
      const perkBoost = Math.min(perks, 10);
      mutatorLabel = pick.label;
      speedDelta = (pick.speedDelta || 0) - Math.floor(perkBoost / 4);
      scoreBonus = (pick.scoreBonus || 0) + Math.floor(perkBoost / 3);
      comboWindowBonus = (pick.comboWindowBonus || 0) + Math.floor(perkBoost / 2) * 20;
      startShield = pick.startShield ? 1 : 0;
      refreshMutatorUI();
    }

    // 清档: 归零并持久化
    function reset() {
      perks = 0;
      save();
    }

    return {
      load,
      save,
      getPerks,
      setPerks,
      addPerks,
      getMutatorLabel,
      getSpeedDelta,
      getScoreBonus,
      getComboWindowBonus,
      getStartShield,
      applyMutator,
      reset
    };
  }

  return { createModule };
})();

const SnakeRogueManager = window.SnakeRogueManager;
export { SnakeRogueManager };
