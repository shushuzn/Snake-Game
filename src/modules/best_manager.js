/**
 * 最佳纪录管理模块 (B2e 迁移: 从 game.js 闭包迁入)
 * 职责: bestScore/bestByMode/endlessBestLevel 状态 + 持久化。
 * UI 同步通过注入回调完成 (bestEl/modeBestEl/bestLevelEl 更新)。
 */
window.SnakeBestManager = (() => {
  function createModule({ storage, keys, onSnapshot, onRefreshModeBest }) {
    let bestScore = 0;
    let bestByMode = { classic: 0, timed: 0, blitz: 0, endless: 0, roguelike: 0 };
    let endlessBestLevel = 0;

    function getBestScore() { return bestScore; }

    function setBestScore(value) {
      bestScore = Number(value) || 0;
      storage.writeText(keys.best, String(bestScore));
      onSnapshot?.();
    }

    function getModeBest(modeName) { return bestByMode[modeName] || 0; }

    function setModeBest(modeName, value) {
      bestByMode[modeName] = Number(value) || 0;
      saveBestByMode();
      onRefreshModeBest?.();
    }

    function getEndlessBestLevel() { return endlessBestLevel; }

    function setEndlessBestLevel(value) {
      endlessBestLevel = Number(value) || 0;
      saveEndlessBestLevel();
    }

    function loadBestScore() {
      bestScore = Number(storage.readText(keys.best, '0'));
    }

    function loadBestByMode() {
      const parsed = storage.readJson(keys.bestByMode, {});
      bestByMode.classic = Number(parsed.classic || 0);
      bestByMode.timed = Number(parsed.timed || 0);
      bestByMode.blitz = Number(parsed.blitz || 0);
      bestByMode.endless = Number(parsed.endless || 0);
      bestByMode.roguelike = Number(parsed.roguelike || 0);
    }

    function saveBestByMode() {
      storage.writeJson(keys.bestByMode, bestByMode);
      onSnapshot?.();
    }

    function loadEndlessBestLevel() {
      endlessBestLevel = Number(storage.readText(keys.endlessBestLevel, '0'));
    }

    function saveEndlessBestLevel() {
      storage.writeText(keys.endlessBestLevel, String(endlessBestLevel));
      onSnapshot?.();
    }

    function loadAll() {
      loadBestScore();
      loadBestByMode();
      loadEndlessBestLevel();
    }

    function reset() {
      bestScore = 0;
      bestByMode = { classic: 0, timed: 0, blitz: 0, endless: 0, roguelike: 0 };
      endlessBestLevel = 0;
    }

    function getModeBestMap() {
      return { ...bestByMode };
    }

    return {
      getBestScore,
      setBestScore,
      getModeBest,
      setModeBest,
      getEndlessBestLevel,
      setEndlessBestLevel,
      loadAll,
      loadBestScore,
      loadBestByMode,
      saveBestByMode,
      loadEndlessBestLevel,
      saveEndlessBestLevel,
      reset,
      getModeBestMap
    };
  }

  return { createModule };
})();
