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
      resetAndRefresh,
      getMapCode,
      applyMapCode
    } = config;

    const presets = {
      'classic-beginner': { mode: 'classic', difficulty: '140', skin: 'classic', dlcPack: 'none', wrapMode: false, obstacleMode: false, hardcoreMode: false, contrastMode: false, miniHudMode: false, autoPauseMode: true },
      'timed-rush': { mode: 'timed', difficulty: '80', skin: 'neon', dlcPack: 'chrono', wrapMode: false, obstacleMode: true, hardcoreMode: false, contrastMode: false, miniHudMode: true, autoPauseMode: true },
      'blitz-fury': { mode: 'blitz', difficulty: '80', skin: 'neon', dlcPack: 'frenzy', wrapMode: false, obstacleMode: true, hardcoreMode: false, contrastMode: false, miniHudMode: true, autoPauseMode: true },
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
        autoPauseMode: state.autoPauseMode,
        mapCode: state.mapCode || '',
        swipeThreshold: state.swipeThreshold || '18'
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
        autoPauseMode: parsed.autoPauseMode !== false,
        swipeThreshold: ['12', '18', '24', '32'].includes(String(parsed.swipeThreshold)) ? String(parsed.swipeThreshold) : undefined
      });

      if (parsed.mapCode && applyMapCode) {
        const applied = applyMapCode(parsed.mapCode);
        if (!applied || !applied.ok) return false;
      }

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

    // 分析地图质量 - 用于分享前校验
    function analyzeRockQuality(mapCode) {
      if (!mapCode) return null;
      
      const lines = mapCode.trim().split('\n');
      const rocks = [];
      for (const line of lines) {
        const parts = line.trim().split(',');
        if (parts.length === 2) {
          const x = parseInt(parts[0], 10);
          const y = parseInt(parts[1], 10);
          if (!isNaN(x) && !isNaN(y)) {
            rocks.push({ x, y });
          }
        }
      }
      
      if (rocks.length === 0) {
        return { isTooEmpty: true, isTooCrowded: false, isBlocked: false };
      }
      
      // 检查是否过于密集 (超过20%)
      const totalCells = 20 * 20; // tileCount * tileCount
      const coveragePercent = (rocks.length / totalCells) * 100;
      
      if (coveragePercent > 20) {
        return { isTooEmpty: false, isTooCrowded: true, isBlocked: false };
      }
      
      // 检查是否阻挡了出生点 (假设中心区域)
      const centerX = 10;
      const centerY = 10;
      const spawnRadius = 2;
      for (const rock of rocks) {
        if (Math.abs(rock.x - centerX) <= spawnRadius && Math.abs(rock.y - centerY) <= spawnRadius) {
          return { isTooEmpty: false, isTooCrowded: false, isBlocked: true };
        }
      }
      
      return { isTooEmpty: false, isTooCrowded: false, isBlocked: false };
    }

    // 生成随机地图
    function generateRandomMap(count = 15, avoidCenter = true) {
      const rocks = [];
      const centerX = 10;
      const centerY = 10;
      const spawnRadius = 3;
      const maxAttempts = count * 10;
      
      for (let i = 0; i < maxAttempts && rocks.length < count; i++) {
        const x = Math.floor(Math.random() * 20);
        const y = Math.floor(Math.random() * 20);
        
        // 避免出生点区域
        if (avoidCenter && Math.abs(x - centerX) <= spawnRadius && Math.abs(y - centerY) <= spawnRadius) {
          continue;
        }
        
        // 避免重复
        const exists = rocks.some(r => r.x === x && r.y === y);
        if (!exists) {
          rocks.push({ x, y });
        }
      }
      
      return rocks.map(item => `${item.x},${item.y}`).join('\n');
    }

    return { presets, generateCode, applyCode, applyPreset, analyzeRockQuality, generateRandomMap };
  }

  global.SnakeWorkshop = { createWorkshopModule };
})(window);
