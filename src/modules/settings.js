window.SnakeSettings = (() => {
  // B1b-2 迁移: 皮肤主题从 game.js 迁入
  const skinThemes = {
    'classic-green': { board: '#0f1322', head: '#7dffa5', body: '#22c55e', phaseHead: '#d8b4fe', grid: 'rgba(255,255,255,0.07)' },
    'classic-blue': { board: '#0f1722', head: '#60a5fa', body: '#3b82f6', phaseHead: '#93c5fd', grid: 'rgba(255,255,255,0.07)' },
    'classic-red': { board: '#1f0f0f', head: '#f87171', body: '#ef4444', phaseHead: '#fca5a5', grid: 'rgba(255,255,255,0.07)' },
    'neon-purple': { board: '#130f2b', head: '#c084fc', body: '#a855f7', phaseHead: '#67e8f9', grid: 'rgba(255,255,255,0.1)' },
    'golden': { board: '#1a1408', head: '#fbbf24', body: '#f59e0b', phaseHead: '#fde047', grid: 'rgba(255,255,255,0.08)' },
    'rainbow': { board: '#0f1322', head: '#f472b6', body: '#ec4899', phaseHead: '#f9a8d4', grid: 'rgba(255,255,255,0.07)' },
    'christmas': { board: '#0f1f0f', head: '#4ade80', body: '#22c55e', phaseHead: '#86efac', grid: 'rgba(255,255,255,0.07)' },
    'halloween': { board: '#1f0f1a', head: '#fb923c', body: '#f97316', phaseHead: '#fdba74', grid: 'rgba(255,255,255,0.08)' },
    'spring': { board: '#0f1a0f', head: '#f472b6', body: '#22c55e', phaseHead: '#d8b4fe', grid: 'rgba(255,255,255,0.07)' },
    'dragon': { board: '#1a0f0f', head: '#ef4444', body: '#dc2626', phaseHead: '#f87171', grid: 'rgba(255,255,255,0.07)' },
    'phoenix': { board: '#1f0f00', head: '#f97316', body: '#ea580c', phaseHead: '#fb923c', grid: 'rgba(255,255,255,0.08)' }
  };

  function createSettingsModule({
    storage,
    settingsKey,
    settingsSchemaVersion,
    controls,
    validators,
    onSave
  }) {
    // B1b 迁移: 模式偏好状态从 game.js 闭包移入模块内部
    let modePreference = controls.modeSelect.value;
    let obstacleModePreference = controls.obstacleModeInput.checked;
    // B1b-2 迁移: 当前皮肤状态
    let currentSkin = 'classic-green';
    // B2c 迁移: 当前每日挑战 (初始由 game.js 在初始化时 setCurrentChallenge)
    let currentChallenge = null;

    function getCurrentChallenge() {
      return currentChallenge;
    }

    function setCurrentChallenge(value) {
      currentChallenge = value;
    }

    function getSkinThemes() {
      return skinThemes;
    }

    function getCurrentSkin() {
      return currentSkin;
    }

    function setCurrentSkin(value) {
      if (Object.hasOwn(skinThemes, value)) currentSkin = value;
    }

    function isValidSkin(value) {
      return Object.hasOwn(skinThemes, value);
    }

    function getModePreference() {
      return modePreference;
    }

    function setModePreference(value) {
      modePreference = value;
    }

    function getObstacleModePreference() {
      return obstacleModePreference;
    }

    function setObstacleModePreference(value) {
      obstacleModePreference = value;
    }

    function getModeSettingValue() {
      if (controls.modeSelect.disabled) return getModePreference();
      return controls.modeSelect.value;
    }

    function getObstacleModeSettingValue() {
      if (controls.obstacleModeInput.disabled) return getObstacleModePreference();
      return controls.obstacleModeInput.checked;
    }

    function applyContrastMode() {
      document.body.classList.toggle('high-contrast', Boolean(controls.contrastModeInput?.checked));
    }

    function applyLightMode() {
      document.body.classList.toggle('light-mode', Boolean(controls.lightModeInput?.checked));
    }

    function applyMiniHudMode() {
      document.body.classList.toggle('compact-hud', Boolean(controls.miniHudModeInput?.checked));
    }

    function applyVisualModes() {
      applyContrastMode();
      applyLightMode();
      applyMiniHudMode();
    }

    function normalizeSettingsPayload(raw = {}) {
      const normalized = { ...(raw || {}) };
      if (!('schemaVersion' in normalized)) normalized.schemaVersion = 1;
      if (normalized.schemaVersion < 2) {
        if (!('dlcPack' in normalized)) normalized.dlcPack = 'none';
        normalized.schemaVersion = 2;
      }
      if (normalized.schemaVersion < 3) {
        if (!validators.isValidSwipeThreshold(normalized.swipeThreshold)) normalized.swipeThreshold = '18';
        normalized.schemaVersion = 3;
      }
      if (!validators.isValidDlcPack(normalized.dlcPack)) {
        normalized.dlcPack = 'none';
      }
      return normalized;
    }

    function maybePersistSettingsMigration(normalized, raw) {
      if (!normalized || !raw || normalized.schemaVersion === raw.schemaVersion) return;
      storage.writeJson(settingsKey, normalized);
    }

    function loadSettings() {
      const raw = storage.readJson(settingsKey, {});
      const parsed = normalizeSettingsPayload(raw);
      maybePersistSettingsMigration(parsed, raw);
      if (validators.isValidMode(parsed.mode)) controls.modeSelect.value = parsed.mode;
      setModePreference(controls.modeSelect.value);
      if (validators.isValidDifficulty(parsed.difficulty)) controls.difficultySelect.value = String(parsed.difficulty);
      if (Object.hasOwn(skinThemes, parsed.skin)) controls.skinSelect.value = parsed.skin;
      if (validators.isValidDlcPack(parsed.dlcPack)) controls.dlcPackSelect.value = parsed.dlcPack;
      controls.wrapModeInput.checked = Boolean(parsed.wrapMode);
      controls.obstacleModeInput.checked = parsed.obstacleMode !== false;
      setObstacleModePreference(controls.obstacleModeInput.checked);
      controls.hardcoreModeInput.checked = Boolean(parsed.hardcoreMode);
      controls.contrastModeInput.checked = Boolean(parsed.contrastMode);
      controls.lightModeInput.checked = Boolean(parsed.lightMode);
      controls.miniHudModeInput.checked = Boolean(parsed.miniHudMode);
      controls.autoPauseModeInput.checked = parsed.autoPauseMode !== false;
      if (validators.isValidSwipeThreshold(parsed.swipeThreshold)) controls.swipeThresholdSelect.value = String(parsed.swipeThreshold);
      applyVisualModes();
    }

    function saveSettings() {
      storage.writeJson(settingsKey, {
        schemaVersion: settingsSchemaVersion,
        mode: getModeSettingValue(),
        difficulty: controls.difficultySelect.value,
        skin: controls.skinSelect.value,
        dlcPack: controls.dlcPackSelect.value,
        wrapMode: controls.wrapModeInput.checked,
        obstacleMode: getObstacleModeSettingValue(),
        hardcoreMode: controls.hardcoreModeInput.checked,
        contrastMode: controls.contrastModeInput.checked,
        lightMode: controls.lightModeInput.checked,
        miniHudMode: controls.miniHudModeInput.checked,
        autoPauseMode: controls.autoPauseModeInput.checked,
        swipeThreshold: controls.swipeThresholdSelect.value
      });
      onSave?.();
    }

    return {
      getModeSettingValue,
      getObstacleModeSettingValue,
      getModePreference,
      setModePreference,
      getObstacleModePreference,
      setObstacleModePreference,
      getSkinThemes,
      getCurrentSkin,
      setCurrentSkin,
      isValidSkin,
      getCurrentChallenge,
      setCurrentChallenge,
      applyContrastMode,
      applyLightMode,
      applyMiniHudMode,
      applyVisualModes,
      loadSettings,
      saveSettings
    };
  }

  return { createSettingsModule };
})();

const SnakeSettings = window.SnakeSettings;
export { SnakeSettings };
