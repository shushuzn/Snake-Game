window.SnakeRecords = (() => {
  function createRecordsModule({
    storage,
    keys,
    ui,
    getModeLabel,
    isValidModeValue,
    onPersist
  }) {
    let history = [];
    let lastResult = { score: 0, mode: 'classic', ts: 0 };

    function renderHistory() {
      if (!history.length) {
        ui.historyListEl.innerHTML = '<li>暂无记录</li>';
        return;
      }
      ui.historyListEl.innerHTML = history
        .map(item => {
          const modeLabel = getModeLabel(item.mode).replace('模式', '');
          const d = new Date(item.ts || Date.now());
          const hh = String(d.getHours()).padStart(2, '0');
          const mm = String(d.getMinutes()).padStart(2, '0');
          return `<li>${modeLabel}：${item.score} 分 <small>(${hh}:${mm})</small></li>`;
        })
        .join('');
    }

    function refreshLastResultText() {
      if (!lastResult.ts) {
        ui.lastResultEl.textContent = '--';
        return;
      }
      const modeLabel = getModeLabel(lastResult.mode).replace('模式', '');
      ui.lastResultEl.textContent = `${modeLabel} ${lastResult.score}分`;
    }

    function loadHistory() {
      const parsed = storage.readJson(keys.historyKey, []);
      history = Array.isArray(parsed) ? parsed.slice(0, 5) : [];
      renderHistory();
    }

    function saveHistory() {
      storage.writeJson(keys.historyKey, history.slice(0, 5));
      onPersist();
    }

    function addHistoryEntry(score, mode) {
      history.unshift({ score, mode, ts: Date.now() });
      history = history.slice(0, 5);
      saveHistory();
      renderHistory();
    }

    function clearHistory() {
      history = [];
      renderHistory();
    }

    function loadLastResult() {
      const parsed = storage.readJson(keys.lastResultKey, {});
      lastResult.score = Number(parsed.score || 0);
      lastResult.mode = isValidModeValue(parsed.mode) && parsed.mode !== 'classic' ? parsed.mode : 'classic';
      lastResult.ts = Number(parsed.ts || 0);
      refreshLastResultText();
    }

    function saveLastResult() {
      storage.writeJson(keys.lastResultKey, lastResult);
      onPersist();
    }

    function setLastResult(score, mode) {
      lastResult = { score, mode, ts: Date.now() };
      saveLastResult();
      refreshLastResultText();
    }

    function clearLastResult() {
      lastResult = { score: 0, mode: 'classic', ts: 0 };
      refreshLastResultText();
    }

    function recordRound(score, mode) {
      setLastResult(score, mode);
      addHistoryEntry(score, mode);
    }

    return {
      loadHistory,
      saveHistory,
      addHistoryEntry,
      renderHistory,
      clearHistory,
      loadLastResult,
      saveLastResult,
      refreshLastResultText,
      clearLastResult,
      recordRound
    };
  }

  return { createRecordsModule };
})();
