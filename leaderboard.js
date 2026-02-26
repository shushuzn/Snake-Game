window.SnakeLeaderboard = (() => {
  function createLeaderboardModule({ storage, key, listEl, statusEl, sourceTagEl, toggleBtn, getModeLabel, onPersist, remoteConfig = {} }) {
    let entries = [];
    let source = 'local';
    let remoteMeta = { ok: false, message: '未请求远端榜单' };
    const remoteUrl = String(remoteConfig.url || '').trim();
    const remoteTimeoutMs = Number(remoteConfig.timeoutMs || 1800);

    function computeStatus() {
      if (source === 'remote') {
        if (remoteMeta.ok) {
          const best = entries[0];
          return `远端榜：已同步 ${entries.length} 条${best ? ` · 最高 ${best.score} 分` : ''}`;
        }
        return `远端榜：请求失败（${remoteMeta.message}），已回退本地数据`;
      }
      if (!entries.length) return '本地榜：暂无数据';
      const best = entries[0];
      return `本地榜：${entries.length} 条 · 最高 ${best.score} 分`;
    }

    function renderSourceState() {
      sourceTagEl.textContent = source === 'remote' ? '当前来源：远端榜（失败自动回退）' : '当前来源：本地榜';
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
            const mark = source === 'remote' && remoteMeta.ok ? '🌐' : '🏠';
            return `<li>${mark} #${idx + 1} ${item.score} 分 · ${modeLabel} <small>(${mm}-${dd})</small></li>`;
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

    function loadLocalEntries() {
      return normalize(storage.readJson(key, []));
    }

    function load() {
      entries = loadLocalEntries();
      render();
    }

    function save() {
      storage.writeJson(key, entries);
      onPersist();
    }

    function recordRound(score, mode) {
      const localEntries = loadLocalEntries();
      entries = normalize([{ score, mode, ts: Date.now() }, ...localEntries]);
      storage.writeJson(key, entries);
      onPersist();
      if (source !== 'remote') {
        render();
      }
    }

    function clear() {
      entries = [];
      remoteMeta = { ok: false, message: '远端数据未加载' };
      render();
    }

    async function fetchRemoteEntries() {
      if (!remoteUrl) {
        remoteMeta = { ok: false, message: '未配置远端地址' };
        entries = loadLocalEntries();
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
        entries = remoteEntries;
        remoteMeta = { ok: true, message: `更新时间 ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}` };
      } catch (err) {
        entries = loadLocalEntries();
        remoteMeta = { ok: false, message: err?.name === 'AbortError' ? '请求超时' : (err?.message || '网络异常') };
      } finally {
        clearTimeout(timeout);
        render();
      }
    }

    function switchToLocal() {
      source = 'local';
      entries = loadLocalEntries();
      render();
    }

    async function switchToRemote() {
      source = 'remote';
      entries = loadLocalEntries();
      remoteMeta = { ok: false, message: '请求中...' };
      render();
      await fetchRemoteEntries();
    }

    function toggleSource() {
      if (source === 'local') {
        switchToRemote();
      } else {
        switchToLocal();
      }
    }

    function bindEvents() {
      toggleBtn.addEventListener('click', toggleSource);
    }

    return { load, render, recordRound, clear, bindEvents, fetchRemoteEntries };
  }

  return { createLeaderboardModule };
})();
