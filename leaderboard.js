window.SnakeLeaderboard = (() => {
  function createLeaderboardModule({
    storage,
    key,
    listEl,
    statusEl,
    sourceTagEl,
    toggleBtn,
    dimensionSelectEl,
    getModeLabel,
    onPersist,
    remoteConfig = {}
  }) {
    let allEntries = [];
    let visibleEntries = [];
    let source = 'local';
    let dimension = 'all';
    let remoteMeta = { ok: false, message: '未请求远端榜单' };
    const remoteUrl = String(remoteConfig.url || '').trim();
    const remoteTimeoutMs = Number(remoteConfig.timeoutMs || 1800);

    function getDimensionLabel() {
      if (dimension === 'all') return '综合榜';
      return `${getModeLabel(dimension).replace('模式', '')}榜`;
    }

    function applyDimensionFilter() {
      if (dimension === 'all') {
        visibleEntries = allEntries.slice(0, 20);
        return;
      }
      visibleEntries = allEntries.filter(item => item.mode === dimension).slice(0, 20);
    }

    function computeStatus() {
      const dimensionLabel = getDimensionLabel();
      if (source === 'remote') {
        if (remoteMeta.ok) {
          const best = visibleEntries[0];
          return `远端${dimensionLabel}：${visibleEntries.length} 条${best ? ` · 最高 ${best.score} 分` : ''}`;
        }
        return `远端${dimensionLabel}：请求失败（${remoteMeta.message}），已回退本地数据`;
      }
      if (!visibleEntries.length) return `本地${dimensionLabel}：暂无数据`;
      const best = visibleEntries[0];
      return `本地${dimensionLabel}：${visibleEntries.length} 条 · 最高 ${best.score} 分`;
    }

    function renderSourceState() {
      sourceTagEl.textContent = source === 'remote' ? '当前来源：远端榜（失败自动回退）' : '当前来源：本地榜';
      toggleBtn.textContent = source === 'remote' ? '切换到本地榜' : '切换到远端榜';
    }

    function renderList() {
      if (!visibleEntries.length) {
        listEl.innerHTML = '<li>暂无排行数据</li>';
        return;
      }
      listEl.innerHTML = visibleEntries
        .map((item, idx) => {
          const modeLabel = getModeLabel(item.mode).replace('模式', '');
          const d = new Date(item.ts || Date.now());
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          const mark = source === 'remote' && remoteMeta.ok ? '🌐' : '🏠';
          return `<li>${mark} #${idx + 1} ${item.score} 分 · ${modeLabel} <small>(${mm}-${dd})</small></li>`;
        })
        .join('');
    }

    function render() {
      applyDimensionFilter();
      renderList();
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

    function loadLocalEntries() {
      return normalize(storage.readJson(key, []));
    }

    function load() {
      allEntries = loadLocalEntries();
      render();
    }

    function recordRound(score, mode) {
      const localEntries = loadLocalEntries();
      allEntries = normalize([{ score, mode, ts: Date.now() }, ...localEntries]);
      storage.writeJson(key, allEntries);
      onPersist();
      if (source !== 'remote') render();
    }

    function clear() {
      allEntries = [];
      visibleEntries = [];
      remoteMeta = { ok: false, message: '远端数据未加载' };
      render();
    }

    async function fetchRemoteEntries() {
      if (!remoteUrl) {
        remoteMeta = { ok: false, message: '未配置远端地址' };
        allEntries = loadLocalEntries();
        render();
        return;
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), Math.max(600, remoteTimeoutMs));
      try {
        const res = await fetch(remoteUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
          cache: 'no-store'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const remoteEntries = normalize(data?.entries || data);
        if (!remoteEntries.length) throw new Error('空榜单');
        allEntries = remoteEntries;
        remoteMeta = { ok: true, message: `更新时间 ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}` };
      } catch (err) {
        allEntries = loadLocalEntries();
        remoteMeta = { ok: false, message: err?.name === 'AbortError' ? '请求超时' : (err?.message || '网络异常') };
      } finally {
        clearTimeout(timeout);
        render();
      }
    }

    function switchToLocal() {
      source = 'local';
      allEntries = loadLocalEntries();
      render();
    }

    async function switchToRemote() {
      source = 'remote';
      allEntries = loadLocalEntries();
      remoteMeta = { ok: false, message: '请求中...' };
      render();
      await fetchRemoteEntries();
    }

    function toggleSource() {
      if (source === 'local') switchToRemote();
      else switchToLocal();
    }

    function onDimensionChange() {
      const value = String(dimensionSelectEl?.value || 'all');
      dimension = value;
      render();
    }

    function bindEvents() {
      toggleBtn.addEventListener('click', toggleSource);
      if (dimensionSelectEl) dimensionSelectEl.addEventListener('change', onDimensionChange);
    }

    return { load, render, recordRound, clear, bindEvents, fetchRemoteEntries };
  }

  return { createLeaderboardModule };
})();
