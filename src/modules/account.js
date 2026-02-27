window.SnakeAccount = (() => {
  function createAccountModule({
    storage,
    keys,
    state,
    callbacks,
    elements,
    ui
  }) {
    function refreshUI() {
      elements.accountNameEl.textContent = state.getActiveAccount() || '游客';
    }

    function saveAccountStore() {
      storage.writeJson(keys.accountStoreKey, state.getAccountStore());
    }

    function loadAccountStore() {
      state.setAccountStore(storage.readJson(keys.accountStoreKey, {}) || {});
    }

    function saveActiveSnapshot() {
      const activeAccount = state.getActiveAccount();
      if (!activeAccount) return;
      const accountStore = state.getAccountStore();
      accountStore[activeAccount] = callbacks.captureProfileSnapshot();
      saveAccountStore();
    }

    function loadFromStorage() {
      loadAccountStore();
      const activeAccount = storage.readText(keys.currentAccountKey, '').trim();
      state.setActiveAccount(activeAccount);
      const accountStore = state.getAccountStore();
      if (activeAccount && accountStore[activeAccount]) {
        callbacks.applyProfileSnapshot(accountStore[activeAccount]);
      }
      refreshUI();
    }

    function login(name) {
      const username = String(name || '').trim();
      if (!username) return;
      saveActiveSnapshot();
      state.setActiveAccount(username);
      storage.writeText(keys.currentAccountKey, username);
      callbacks.applyProfileSnapshot(state.getAccountStore()[username] || {});
      refreshUI();
      callbacks.reloadAllFromStorage();
    }

    function logout() {
      saveActiveSnapshot();
      state.setActiveAccount('');
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
        currentAccount: state.getActiveAccount(),
        accounts: state.getAccountStore(),
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
        state.setAccountStore((parsed.accounts && typeof parsed.accounts === 'object') ? parsed.accounts : {});
        saveAccountStore();
        const activeAccount = typeof parsed.currentAccount === 'string' ? parsed.currentAccount.trim() : '';
        state.setActiveAccount(activeAccount);
        if (activeAccount) storage.writeText(keys.currentAccountKey, activeAccount);
        else storage.remove(keys.currentAccountKey);
        const accountStore = state.getAccountStore();
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
