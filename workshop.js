(function initSnakeWorkshop(global) {
  function encodePayload(payload) {
    return `SWK1:${btoa(unescape(encodeURIComponent(JSON.stringify(payload))))}`;
  }

  function decodePayload(code) {
    const text = String(code || '').trim();
    if (!text.startsWith('SWK1:')) return null;
    try {
      const decoded = decodeURIComponent(escape(atob(text.slice(5))));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  function createWorkshopModule(config) {
    const {
      version,
      inputEl,
      isValidMode,
      isValidDifficulty,
      isValidSkin,
      isValidDlcPack,
      applyVisualModes,
      saveSettings,
      syncRuntime,
      resetAndRefresh
    } = config;

    const presets = {
      'timed-rush': { mode: 'timed', difficulty: '80', skin: 'neon', dlcPack: 'frenzy', wrapMode: false, obstacleMode: true, hardcoreMode: false, contrastMode: false, miniHudMode: true, autoPauseMode: true },
      'rogue-hardcore': { mode: 'roguelike', difficulty: '80', skin: 'pixel', wrapMode: false, obstacleMode: true, hardcoreMode: true, contrastMode: true, miniHudMode: true, autoPauseMode: true },
      'endless-relax': { mode: 'endless', difficulty: '140', skin: 'classic', wrapMode: true, obstacleMode: false, hardcoreMode: false, contrastMode: false, miniHudMode: false, autoPauseMode: true }
    };

    function buildPayload(state) {
      return {
        v: version,
        mode: state.mode,
        difficulty: state.difficulty,
        skin: state.skin,
        dlcPack: state.dlcPack,
        wrapMode: state.wrapMode,
        obstacleMode: state.obstacleMode,
        hardcoreMode: state.hardcoreMode,
        contrastMode: state.contrastMode,
        miniHudMode: state.miniHudMode,
        autoPauseMode: state.autoPauseMode
      };
    }

    function applyPayload(parsed, applyToDom, snapshotCurrentState) {
      if (!parsed || typeof parsed !== 'object') return false;
      applyToDom({
        mode: isValidMode(parsed.mode) ? parsed.mode : undefined,
        difficulty: isValidDifficulty(parsed.difficulty) ? String(parsed.difficulty) : undefined,
        skin: isValidSkin(parsed.skin) ? parsed.skin : undefined,
        dlcPack: isValidDlcPack(parsed.dlcPack) ? parsed.dlcPack : undefined,
        wrapMode: Boolean(parsed.wrapMode),
        obstacleMode: parsed.obstacleMode !== false,
        hardcoreMode: Boolean(parsed.hardcoreMode),
        contrastMode: Boolean(parsed.contrastMode),
        miniHudMode: Boolean(parsed.miniHudMode),
        autoPauseMode: parsed.autoPauseMode !== false
      });

      applyVisualModes();
      saveSettings();
      const state = snapshotCurrentState();
      syncRuntime(state);
      resetAndRefresh();
      return true;
    }

    function generateCode(snapshotCurrentState) {
      try {
        const payload = buildPayload(snapshotCurrentState());
        const code = encodePayload(payload);
        inputEl.value = code;
        return code;
      } catch {
        return '';
      }
    }

    function applyCode(raw, applyToDom, snapshotCurrentState) {
      const parsed = decodePayload(raw);
      if (!parsed) return false;
      return applyPayload(parsed, applyToDom, snapshotCurrentState);
    }

    function applyPreset(key, applyToDom, snapshotCurrentState) {
      const preset = presets[key];
      if (!preset) return false;
      return applyPayload(preset, applyToDom, snapshotCurrentState);
    }

    return { presets, generateCode, applyCode, applyPreset };
  }

  global.SnakeWorkshop = { createWorkshopModule };
})(window);
