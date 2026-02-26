window.SnakeSeason = (() => {
  function createSeasonModule({ storage, key, elements, onPersist }) {
    let state = {
      currentSeasonId: '',
      currentBest: { score: 0, mode: 'classic', ts: 0 },
      history: []
    };

    function pad2(v) {
      return String(v).padStart(2, '0');
    }

    function getSeasonId(date = new Date()) {
      return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
    }

    function getSeasonLabel(seasonId) {
      const [y, m] = String(seasonId || '').split('-');
      if (!y || !m) return '--';
      return `${y} 年 ${m} 月赛季`;
    }

    function getSeasonRemaining(date = new Date()) {
      const next = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
      const diffMs = Math.max(0, next.getTime() - date.getTime());
      const totalHours = Math.floor(diffMs / 3600000);
      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;
      return `${days} 天 ${hours} 小时`;
    }

    function normalizeHistory(history) {
      const list = Array.isArray(history) ? history : [];
      return list
        .map(item => ({
          seasonId: String(item?.seasonId || ''),
          score: Number(item?.score || 0),
          mode: String(item?.mode || 'classic'),
          ts: Number(item?.ts || 0)
        }))
        .filter(item => item.seasonId && item.score > 0)
        .sort((a, b) => (b.seasonId.localeCompare(a.seasonId)))
        .slice(0, 6);
    }

    function archiveCurrentSeason() {
      if (!state.currentSeasonId || state.currentBest.score <= 0) return;
      state.history = normalizeHistory([
        {
          seasonId: state.currentSeasonId,
          score: state.currentBest.score,
          mode: state.currentBest.mode,
          ts: state.currentBest.ts
        },
        ...state.history
      ]);
    }

    function ensureSeason(now = new Date()) {
      const seasonId = getSeasonId(now);
      if (!state.currentSeasonId) {
        state.currentSeasonId = seasonId;
        return;
      }
      if (state.currentSeasonId === seasonId) return;
      archiveCurrentSeason();
      state.currentSeasonId = seasonId;
      state.currentBest = { score: 0, mode: 'classic', ts: 0 };
    }

    function save() {
      storage.writeJson(key, state);
      onPersist();
    }

    function render(now = new Date()) {
      elements.seasonIdEl.textContent = getSeasonLabel(state.currentSeasonId);
      elements.seasonRemainingEl.textContent = getSeasonRemaining(now);
      if (state.currentBest.score > 0) {
        elements.seasonBestEl.textContent = `${state.currentBest.score} 分（${state.currentBest.mode}）`;
      } else {
        elements.seasonBestEl.textContent = '--';
      }

      if (!state.history.length) {
        elements.seasonHistoryListEl.innerHTML = '<li>暂无历史赛季记录</li>';
        return;
      }
      elements.seasonHistoryListEl.innerHTML = state.history
        .map(item => `<li>${getSeasonLabel(item.seasonId)}：${item.score} 分（${item.mode}）</li>`)
        .join('');
    }

    function load() {
      const parsed = storage.readJson(key, {});
      state = {
        currentSeasonId: String(parsed.currentSeasonId || ''),
        currentBest: {
          score: Number(parsed.currentBest?.score || 0),
          mode: String(parsed.currentBest?.mode || 'classic'),
          ts: Number(parsed.currentBest?.ts || 0)
        },
        history: normalizeHistory(parsed.history)
      };
      ensureSeason(new Date());
      save();
      render();
    }

    function recordRound(score, mode) {
      ensureSeason(new Date());
      if (score > state.currentBest.score) {
        state.currentBest = { score, mode, ts: Date.now() };
        save();
      }
      render();
    }

    function clear() {
      state = {
        currentSeasonId: getSeasonId(new Date()),
        currentBest: { score: 0, mode: 'classic', ts: 0 },
        history: []
      };
      save();
      render();
    }

    function refreshRemainingOnly() {
      elements.seasonRemainingEl.textContent = getSeasonRemaining(new Date());
    }

    function getCurrentBestScore() {
      return Number(state.currentBest.score || 0);
    }

    function getCurrentSeasonId() {
      return state.currentSeasonId;
    }

    return { load, recordRound, clear, refreshRemainingOnly, getCurrentBestScore, getCurrentSeasonId };
  }

  return { createSeasonModule };
})();
