window.SnakeAccount = (() => {
  function createAccountModule({
    storage,
    keys,
    callbacks,
    elements,
    ui
  }) {
    // B2g 迁移: 账号状态从 game.js 闭包移入模块内部
    let activeAccount = '';
    let accountStore = {};

    function getActiveAccount() { return activeAccount; }
    function setActiveAccount(value) { activeAccount = String(value || ''); }
    function getAccountStore() { return accountStore; }
    function setAccountStore(value) { accountStore = (value && typeof value === 'object') ? value : {}; }

    function refreshUI() {
      elements.accountNameEl.textContent = getActiveAccount() || '游客';
    }

    function saveAccountStore() {
      storage.writeJson(keys.accountStoreKey, getAccountStore());
    }

    function loadAccountStore() {
      setAccountStore(storage.readJson(keys.accountStoreKey, {}) || {});
    }

    function saveActiveSnapshot() {
      const activeName = getActiveAccount();
      if (!activeName) return;
      const store = getAccountStore();
      store[activeName] = callbacks.captureProfileSnapshot();
      saveAccountStore();
    }

    function loadFromStorage() {
      loadAccountStore();
      const activeName = storage.readText(keys.currentAccountKey, '').trim();
      setActiveAccount(activeName);
      const store = getAccountStore();
      if (activeName && store[activeName]) {
        callbacks.applyProfileSnapshot(store[activeName]);
      }
      refreshUI();
    }

    function login(name) {
      const username = String(name || '').trim();
      if (!username) return;
      saveActiveSnapshot();
      setActiveAccount(username);
      storage.writeText(keys.currentAccountKey, username);
      callbacks.applyProfileSnapshot(getAccountStore()[username] || {});
      refreshUI();
      callbacks.reloadAllFromStorage();
    }

    function logout() {
      saveActiveSnapshot();
      setActiveAccount('');
      storage.remove(keys.currentAccountKey);
      callbacks.applyProfileSnapshot({});
      refreshUI();
      callbacks.reloadAllFromStorage();
    }

    function exportSaveData(version) {
      saveActiveSnapshot();
      const payload = {
        version,
        exportedAt: new Date().toISOString(),
        currentAccount: getActiveAccount(),
        accounts: getAccountStore(),
        guest: callbacks.captureProfileSnapshot()
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `snake-save-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    async function importSaveData(file) {
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object') throw new Error('bad format');
        setAccountStore((parsed.accounts && typeof parsed.accounts === 'object') ? parsed.accounts : {});
        saveAccountStore();
        const activeAccount = typeof parsed.currentAccount === 'string' ? parsed.currentAccount.trim() : '';
        setActiveAccount(activeAccount);
        if (activeAccount) storage.writeText(keys.currentAccountKey, activeAccount);
        else storage.remove(keys.currentAccountKey);
        const accountStore = getAccountStore();
        if (activeAccount && accountStore[activeAccount]) callbacks.applyProfileSnapshot(accountStore[activeAccount]);
        else callbacks.applyProfileSnapshot((parsed.guest && typeof parsed.guest === 'object') ? parsed.guest : {});
        refreshUI();
        callbacks.reloadAllFromStorage();
        ui.showOverlay('<p><strong>✅ 导入成功</strong></p><p>存档已恢复</p>');
        setTimeout(() => { if (ui.isRunning() && !ui.isPaused()) ui.hideOverlay(); }, 800);
      } catch {
        ui.showOverlay('<p><strong>导入失败</strong></p><p>存档文件无效</p>');
        setTimeout(() => { if (ui.isRunning() && !ui.isPaused()) ui.hideOverlay(); }, 900);
      } finally {
        elements.importSaveInput.value = '';
      }
    }

    return {
      getActiveAccount,
      setActiveAccount,
      getAccountStore,
      setAccountStore,
      refreshUI,
      saveActiveSnapshot,
      saveAccountStore,
      loadFromStorage,
      login,
      logout,
      exportSaveData,
      importSaveData
    };
  }

  return { createAccountModule };
})();
