/**
 * 生命周期统计管理模块 (B2h 迁移: 从 game.js 闭包迁入)
 * 职责: foodsEaten/totalPlays/streakWins 三状态 + 持久化 (snake-stats-v1)。
 * UI 同步通过注入 elements 完成 (foodsEl/playsEl/streakEl);
 * 持久化后通过 onPersist 回调通知外层 (账号快照同步)。
 */
window.SnakeLifetimeStats = (() => {
  function createModule({ storage, key, elements, onPersist }) {
    let foodsEaten = 0;
    let totalPlays = 0;
    let streakWins = 0;

    function refreshUI() {
      elements.foodsEl.textContent = String(foodsEaten);
      elements.playsEl.textContent = String(totalPlays);
      elements.streakEl.textContent = String(streakWins);
    }

    function load() {
      const parsed = storage.readJson(key, {});
      foodsEaten = Number(parsed.foodsEaten || 0);
      totalPlays = Number(parsed.totalPlays || 0);
      streakWins = Number(parsed.streakWins || 0);
      refreshUI();
    }

    function save() {
      storage.writeJson(key, { foodsEaten, totalPlays, streakWins });
      if (onPersist) onPersist();
    }

    function getFoodsEaten() { return foodsEaten; }
    function getTotalPlays() { return totalPlays; }
    function getStreak() { return streakWins; }

    function incrementFood() {
      foodsEaten += 1;
      elements.foodsEl.textContent = String(foodsEaten);
      save();
    }

    function incrementPlays() {
      totalPlays += 1;
      elements.playsEl.textContent = String(totalPlays);
      save();
    }

    // 连胜仅在结算时设置, 由调用方在 setStreak 后显式 persist (与迁移前语义一致)
    function setStreak(value) {
      streakWins = Number(value) || 0;
      elements.streakEl.textContent = String(streakWins);
    }

    function reset() {
      foodsEaten = 0;
      totalPlays = 0;
      streakWins = 0;
      refreshUI();
    }

    return {
      load,
      save,
      getFoodsEaten,
      getTotalPlays,
      getStreak,
      incrementFood,
      incrementPlays,
      setStreak,
      reset
    };
  }

  return { createModule };
})();

const SnakeLifetimeStats = window.SnakeLifetimeStats;
export { SnakeLifetimeStats };
