/**
 * 图鉴管理模块 (B2c 迁移: 从 game.js 闭包迁入)
 * 职责: 道具图鉴目录 + 发现状态持有、加载/保存/刷新、发现判定。
 * 高耦合的发现反馈(overlay)由 game.js 在 discover 返回 true 后处理。
 */
window.SnakeCodexManager = (() => {
  const codexCatalog = [
    { id: 'food', label: '基础果', hint: '常规食物，稳定加分。' },
    { id: 'bonus', label: '奖励果', hint: '短时出现，高额分数。' },
    { id: 'shield', label: '护盾果', hint: '提供护盾，容错更高。' },
    { id: 'boost', label: '倍率果', hint: '短时间分数 x2。' },
    { id: 'time', label: '时间果', hint: '限时模式可延长倒计时。' },
    { id: 'freeze', label: '冰冻果', hint: '暂时减速，便于走位。' },
    { id: 'phase', label: '相位果', hint: '短时间穿越障碍石。' },
    { id: 'crown', label: '王冠果', hint: '触发随机奖励：加分/护盾/增益时间。' },
    { id: 'magnet', label: '磁力果', hint: '短时间吸附附近道具。' },
    { id: 'combo', label: '连击果', hint: '提供连击护航，短时不断连。' },
    { id: 'ghost', label: '幽灵果', hint: '短时间无敌，可穿越墙壁与自身。' }
  ];

  function createModule({ storage, key, progressEl, listEl }) {
    let discoveredCodex = {};

    function defaultState() {
      return Object.fromEntries(codexCatalog.map((item) => [item.id, false]));
    }

    function load() {
      const base = defaultState();
      const parsed = storage.readJson(key, {});
      discoveredCodex = { ...base, ...parsed };
      refresh();
    }

    function save() {
      storage.writeJson(key, discoveredCodex);
    }

    function refresh() {
      if (!progressEl || !listEl) return;
      const count = codexCatalog.filter((item) => discoveredCodex[item.id]).length;
      progressEl.textContent = `${count}/${codexCatalog.length}`;
      listEl.innerHTML = codexCatalog.map((item) => {
        if (!discoveredCodex[item.id]) return '<li>❓ 未发现道具</li>';
        return `<li>✅ <strong>${item.label}</strong>：${item.hint}</li>`;
      }).join('');
    }

    // 纯状态发现: 已发现返回 false; 新发现置位+保存+刷新返回 true
    function discover(id) {
      if (discoveredCodex[id]) return false;
      discoveredCodex[id] = true;
      save();
      refresh();
      return true;
    }

    function isDiscovered(id) {
      return Boolean(discoveredCodex[id]);
    }

    function getDiscoveredCount() {
      return Object.values(discoveredCodex).filter(Boolean).length;
    }

    function getTotalCount() {
      return codexCatalog.length;
    }

    function getState() {
      return discoveredCodex;
    }

    return {
      codexCatalog,
      defaultState,
      load,
      save,
      refresh,
      discover,
      isDiscovered,
      getDiscoveredCount,
      getTotalCount,
      getState
    };
  }

  return { createModule, codexCatalog };
})();
