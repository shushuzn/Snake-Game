window.SnakeSettings = (() => {
  function createSettingsModule({
    storage,
    settingsKey,
    settingsSchemaVersion,
    controls,
    validators,
    skinThemes,
    getModePreference,
    setModePreference,
    getObstacleModePreference,
    setObstacleModePreference,
    onSave
  }) {
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

    function applyMiniHudMode() {
      document.body.classList.toggle('compact-hud', Boolean(controls.miniHudModeInput?.checked));
    }

    function applyVisualModes() {
      applyContrastMode();
      applyMiniHudMode();
    }

    function normalizeSettingsPayload(raw = {}) {
      const normalized = { ...(raw || {}) };
      if (!('schemaVersion' in normalized)) normalized.schemaVersion = 1;
      if (normalized.schemaVersion < 2) {
        if (!('dlcPack' in normalized)) normalized.dlcPack = 'none';
        normalized.schemaVersion = 2;
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
      controls.miniHudModeInput.checked = Boolean(parsed.miniHudMode);
      controls.autoPauseModeInput.checked = parsed.autoPauseMode !== false;
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
        miniHudMode: controls.miniHudModeInput.checked,
        autoPauseMode: controls.autoPauseModeInput.checked
      });
      onSave?.();
    }

    return {
      getModeSettingValue,
      getObstacleModeSettingValue,
      applyContrastMode,
      applyMiniHudMode,
      applyVisualModes,
      loadSettings,
      saveSettings
    };
  }

  return { createSettingsModule };
})();
