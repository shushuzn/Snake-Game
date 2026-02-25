window.SnakeWorkshopRuntime = (() => {
  function createWorkshopRuntime({
    workshop,
    controls,
    runtime,
    ui
  }) {
    function getStateSnapshot() {
      return {
        mode: runtime.getModeSettingValue(),
        difficulty: controls.difficultySelect.value,
        skin: controls.skinSelect.value,
        dlcPack: controls.dlcPackSelect.value,
        wrapMode: controls.wrapModeInput.checked,
        obstacleMode: runtime.getObstacleModeSettingValue(),
        hardcoreMode: controls.hardcoreModeInput.checked,
        contrastMode: controls.contrastModeInput.checked,
        miniHudMode: controls.miniHudModeInput.checked,
        autoPauseMode: controls.autoPauseModeInput.checked,
        mapCode: runtime.getMapCode ? runtime.getMapCode() : ''
      };
    }

    function applyControls(next) {
      if (next.mode !== undefined) controls.modeSelect.value = next.mode;
      runtime.setModePreference(controls.modeSelect.value);
      if (next.difficulty !== undefined) controls.difficultySelect.value = next.difficulty;
      if (next.skin !== undefined) controls.skinSelect.value = next.skin;
      if (next.dlcPack !== undefined) controls.dlcPackSelect.value = next.dlcPack;
      controls.wrapModeInput.checked = Boolean(next.wrapMode);
      controls.obstacleModeInput.checked = next.obstacleMode !== false;
      runtime.setObstacleModePreference(controls.obstacleModeInput.checked);
      controls.hardcoreModeInput.checked = Boolean(next.hardcoreMode);
      controls.contrastModeInput.checked = Boolean(next.contrastMode);
      controls.miniHudModeInput.checked = Boolean(next.miniHudMode);
      controls.autoPauseModeInput.checked = next.autoPauseMode !== false;
    }

    async function copyCode() {
      const code = controls.workshopCodeInput.value.trim() || workshop.generateCode(getStateSnapshot);
      if (!code) return;
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(code);
        ui.showOverlay('<p><strong>已复制工坊代码</strong></p><p>可直接发送给好友</p>');
        setTimeout(() => { if (ui.isRunning() && !ui.isPaused()) ui.hideOverlay(); }, 700);
      } catch {
        ui.showOverlay('<p><strong>复制失败</strong></p><p>请手动复制文本框内容</p>');
        setTimeout(() => { if (ui.isRunning() && !ui.isPaused()) ui.hideOverlay(); }, 900);
      }
    }

    function bindEvents() {
      controls.genWorkshopBtn.addEventListener('click', () => {
        const code = workshop.generateCode(getStateSnapshot);
        if (!code) return;
        ui.showOverlay('<p><strong>创意工坊代码已生成</strong></p><p>可复制后分享给好友</p>');
        setTimeout(() => { if (ui.isRunning() && !ui.isPaused()) ui.hideOverlay(); }, 700);
      });

      controls.copyWorkshopBtn.addEventListener('click', copyCode);

      controls.applyWorkshopBtn.addEventListener('click', () => {
        const ok = workshop.applyCode(controls.workshopCodeInput.value, applyControls, getStateSnapshot);
        if (!ok) {
          ui.showOverlay('<p><strong>工坊代码无效</strong></p><p>请检查 SWK1 格式或地图码字段</p>');
          setTimeout(() => { if (ui.isRunning() && !ui.isPaused()) ui.hideOverlay(); }, 900);
          return;
        }
        ui.showOverlay('<p><strong>已应用工坊规则</strong></p><p>已重置并按新规则开始</p>');
        setTimeout(() => { if (ui.isRunning() && !ui.isPaused()) ui.hideOverlay(); }, 800);
      });

      controls.applyWorkshopPresetBtn.addEventListener('click', () => {
        const key = controls.workshopPresetSelect.value;
        const ok = workshop.applyPreset(key, applyControls, getStateSnapshot);
        if (!ok) {
          ui.showOverlay('<p><strong>请选择预设</strong></p><p>可先选择一个创意工坊模板</p>');
          setTimeout(() => { if (ui.isRunning() && !ui.isPaused()) ui.hideOverlay(); }, 800);
          return;
        }
        workshop.generateCode(getStateSnapshot);
        ui.showOverlay('<p><strong>预设已应用</strong></p><p>规则已切换并生成对应分享码</p>');
        setTimeout(() => { if (ui.isRunning() && !ui.isPaused()) ui.hideOverlay(); }, 800);
      });
    }

    function generateInitialCode() {
      workshop.generateCode(getStateSnapshot);
    }

    return {
      getStateSnapshot,
      applyControls,
      bindEvents,
      generateInitialCode
    };
  }

  return { createWorkshopRuntime };
})();
