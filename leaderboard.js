window.SnakeLeaderboard = (() => {
  function createLeaderboardModule({ storage, key, listEl, statusEl, sourceTagEl, toggleBtn, getModeLabel, onPersist }) {
    let entries = [];
    let source = 'local';

    function computeStatus() {
      if (source === 'remote') return '远端榜：当前离线（已回退本地数据）';
      if (!entries.length) return '本地榜：暂无数据';
      const best = entries[0];
      return `本地榜：${entries.length} 条 · 最高 ${best.score} 分`;
    }

    function renderSourceState() {
      sourceTagEl.textContent = source === 'remote' ? '当前来源：远端榜（离线回退）' : '当前来源：本地榜';
      toggleBtn.textContent = source === 'remote' ? '切换到本地榜' : '切换到远端榜';
    }

    function render() {
      if (!entries.length) {
        listEl.innerHTML = '<li>暂无排行数据</li>';
      } else {
        listEl.innerHTML = entries
          .map((item, idx) => {
            const modeLabel = getModeLabel(item.mode).replace('模式', '');
            const d = new Date(item.ts || Date.now());
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `<li>#${idx + 1} ${item.score} 分 · ${modeLabel} <small>(${mm}-${dd})</small></li>`;
          })
          .join('');
      }
      statusEl.textContent = computeStatus();
      renderSourceState();
    }

    function normalize(raw) {
      const list = Array.isArray(raw) ? raw : [];
      return list
        .map((item) => ({
          score: Number(item?.score || 0),
          mode: String(item?.mode || 'classic'),
          ts: Number(item?.ts || 0)
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => (b.score - a.score) || (b.ts - a.ts))
        .slice(0, 20);
    }

    function load() {
      entries = normalize(storage.readJson(key, []));
      render();
    }

    function save() {
      storage.writeJson(key, entries);
      onPersist();
    }

    function recordRound(score, mode) {
      entries = normalize([{ score, mode, ts: Date.now() }, ...entries]);
      save();
      render();
    }

    function clear() {
      entries = [];
      render();
    }

    function toggleSource() {
      source = source === 'local' ? 'remote' : 'local';
      render();
    }

    function bindEvents() {
      toggleBtn.addEventListener('click', toggleSource);
    }

    return { load, render, recordRound, clear, bindEvents };
  }

  return { createLeaderboardModule };
})();
