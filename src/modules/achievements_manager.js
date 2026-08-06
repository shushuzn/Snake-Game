/**
 * 成就管理模块 (B2a 迁移: 从 game.js 闭包迁入)
 * 职责: 成就状态持有、加载/保存/刷新、解锁判定。
 * 高耦合的解锁反馈(overlay/toast/音效)由 game.js 在 unlock 返回 true 后处理。
 */
window.SnakeAchievementsManager = (() => {
  const ACHIEVEMENT_KEYS = [
    // 分数类成就
    'score200', 'score500', 'score1000', 'score2000',
    // 连击类成就
    'combo5', 'combo10', 'combo15',
    // 限时模式成就
    'timedClear',
    // 游戏次数成就
    'games10', 'games50', 'games100',
    // 每日签到成就
    'dailyStreak7', 'dailyStreak30',
    // 每日任务成就
    'firstTask', 'allTasks',
    // 对战类成就 - AI对战
    'aiBeatEasy', 'aiBeatNormal', 'aiBeatHard', 'aiBeatHell',
    // 对战类成就 - 多人对战
    'multiplayerWin2', 'multiplayerWin3', 'multiplayerWin4',
    // 对战类成就 - 观战
    'spectate5', 'spectate20',
    // 收集类成就 - 食物收集
    'foods100', 'foods500', 'foods1000',
    // 收集类成就 - 图鉴收集
    'codex5', 'codex10', 'allCodex',
    // 无尽模式成就
    'endlessLevel5', 'endlessLevel10', 'endlessLevel20'
  ];

  function createModule({ storage, key, el }) {
    let achievements = {};

    function createDefault() {
      return ACHIEVEMENT_KEYS.reduce((acc, k) => {
        acc[k] = false;
        return acc;
      }, {});
    }

    function load() {
      const parsed = storage.readJson(key, {});
      achievements = createDefault();
      ACHIEVEMENT_KEYS.forEach((k) => {
        achievements[k] = Boolean(parsed[k]);
      });
      refresh();
    }

    function save() {
      storage.writeJson(key, achievements);
    }

    function refresh() {
      if (!el) return;
      const count = Object.keys(achievements).filter((k) => achievements[k]).length;
      el.textContent = `${count}/${Object.keys(achievements).length}`;
    }

    function isUnlocked(k) {
      return Boolean(achievements[k]);
    }

    function getUnlockedCount() {
      return Object.keys(achievements).filter((k) => achievements[k]).length;
    }

    function getTotalCount() {
      return Object.keys(achievements).length;
    }

    // 纯状态解锁: 已解锁或无效 key 返回 false; 新解锁置位+保存+刷新返回 true
    function unlock(k) {
      if (!Object.prototype.hasOwnProperty.call(achievements, k) || achievements[k]) return false;
      achievements[k] = true;
      save();
      refresh();
      return true;
    }

    function getState() {
      return achievements;
    }

    return {
      ACHIEVEMENT_KEYS,
      createDefault,
      load,
      save,
      refresh,
      isUnlocked,
      unlock,
      getUnlockedCount,
      getTotalCount,
      getState
    };
  }

  return { createModule, ACHIEVEMENT_KEYS };
})();

const SnakeAchievementsManager = window.SnakeAchievementsManager;
export { SnakeAchievementsManager };
