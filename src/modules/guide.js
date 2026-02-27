/**
 * 新手引导分层系统
 * 
 * Layer 1: 基础操作 - 移动、吃食物、成长
 * Layer 2: 道具认知 - 理解道具效果
 * Layer 3: 模式策略 - 理解不同游戏模式
 */

window.SnakeGuide = (() => {
  const GUIDE_LAYERS = {
    BASIC: 1,    // 基础操作
    ITEMS: 2,    // 道具认知
    MODES: 3     // 模式策略
  };

  // 引导提示内容
  const HINTS = {
    // Layer 1: 基础操作
    [GUIDE_LAYERS.BASIC]: {
      start: '🎮 使用方向键或 WASD 控制蛇的移动',
      growth: '🍎 吃掉食物让蛇成长，蛇越长得分越高',
      avoid: '⚠️ 小心不要撞到墙壁或自己的身体'
    },
    // Layer 2: 道具认知
    [GUIDE_LAYERS.ITEMS]: {
      shield: '🛡️ 护盾：可以抵挡一次碰撞',
      boost: '🚀 加速：提升移动速度',
      magnet: '🧲 磁铁：吸引附近食物',
      combo: '🔥 连击：大幅提升连击倍数',
      freeze: '❄️ 冻结：暂停所有障碍物',
      time: '⏰ 时间：增加剩余时间'
    },
    // Layer 3: 模式策略
    [GUIDE_LAYERS.MODES]: {
      classic: '🎯 经典模式：无限时间，尽可能获得最高分',
      timed: '⏱️ 计时模式：在限定时间内冲刺最高分',
      blitz: '⚡ 闪电模式：极短时间，快速反应',
      mission: '📋 任务模式：完成目标挑战'
    }
  };

  function createGuideModule({ storage, key }) {
    let guideState = {
      currentLayer: GUIDE_LAYERS.BASIC,
      completedLayers: [],
      hintsShown: {
        basic: { start: false, growth: false, avoid: false },
        items: {},
        modes: {}
      },
      gamesPlayed: 0
    };

    function load() {
      const raw = storage.readJson(key, null);
      if (raw && typeof raw === 'object') {
        guideState = {
          currentLayer: Number(raw.currentLayer) || GUIDE_LAYERS.BASIC,
          completedLayers: Array.isArray(raw.completedLayers) ? raw.completedLayers : [],
          hintsShown: raw.hintsShown || guideState.hintsShown,
          gamesPlayed: Number(raw.gamesPlayed) || 0
        };
      }
    }

    function save() {
      storage.writeJson(key, guideState);
    }

    function incrementGamesPlayed() {
      guideState.gamesPlayed++;
      // 根据游戏局数自动解锁更高层次的引导
      if (guideState.gamesPlayed >= 3 && !guideState.completedLayers.includes(GUIDE_LAYERS.BASIC)) {
        completeLayer(GUIDE_LAYERS.BASIC);
      }
      if (guideState.gamesPlayed >= 10 && !guideState.completedLayers.includes(GUIDE_LAYERS.ITEMS)) {
        completeLayer(GUIDE_LAYERS.ITEMS);
      }
      if (guideState.gamesPlayed >= 20 && !guideState.completedLayers.includes(GUIDE_LAYERS.MODES)) {
        completeLayer(GUIDE_LAYERS.MODES);
      }
      save();
    }

    function completeLayer(layer) {
      if (!guideState.completedLayers.includes(layer)) {
        guideState.completedLayers.push(layer);
        // 自动进入下一层
        if (layer < GUIDE_LAYERS.MODES) {
          guideState.currentLayer = layer + 1;
        }
        save();
      }
    }

    function markHintShown(layerKey, hintKey) {
      if (layerKey === 'items' || layerKey === 'modes') {
        if (!guideState.hintsShown[layerKey]) {
          guideState.hintsShown[layerKey] = {};
        }
        guideState.hintsShown[layerKey][hintKey] = true;
      } else {
        guideState.hintsShown[layerKey][hintKey] = true;
      }
      save();
    }

    function isHintShown(layerKey, hintKey) {
      if (layerKey === 'items' || layerKey === 'modes') {
        return guideState.hintsShown[layerKey]?.[hintKey] || false;
      }
      return guideState.hintsShown[layerKey]?.[hintKey] || false;
    }

    function getCurrentLayer() {
      return guideState.currentLayer;
    }

    function getCompletedLayers() {
      return guideState.completedLayers;
    }

    function getGamesPlayed() {
      return guideState.gamesPlayed;
    }

    function getHint(layer, key) {
      return HINTS[layer]?.[key] || null;
    }

    function getAvailableHints() {
      const hints = [];
      const layer = guideState.currentLayer;
      
      if (layer === GUIDE_LAYERS.BASIC) {
        if (!isHintShown('basic', 'start')) hints.push({ key: 'start', text: HINTS[GUIDE_LAYERS.BASIC].start });
        if (!isHintShown('basic', 'growth')) hints.push({ key: 'growth', text: HINTS[GUIDE_LAYERS.BASIC].growth });
        if (!isHintShown('basic', 'avoid')) hints.push({ key: 'avoid', text: HINTS[GUIDE_LAYERS.BASIC].avoid });
      }
      
      return hints;
    }

    function forceCompleteAll() {
      guideState.completedLayers = [GUIDE_LAYERS.BASIC, GUIDE_LAYERS.ITEMS, GUIDE_LAYERS.MODES];
      guideState.currentLayer = GUIDE_LAYERS.MODES;
      save();
    }

    function reset() {
      guideState = {
        currentLayer: GUIDE_LAYERS.BASIC,
        completedLayers: [],
        hintsShown: {
          basic: { start: false, growth: false, avoid: false },
          items: {},
          modes: {}
        },
        gamesPlayed: 0
      };
      save();
    }

    // Initialize
    load();

    return {
      incrementGamesPlayed,
      completeLayer,
      markHintShown,
      isHintShown,
      getCurrentLayer,
      getCompletedLayers,
      getGamesPlayed,
      getHint,
      getAvailableHints,
      forceCompleteAll,
      reset,
      GUIDE_LAYERS,
      HINTS
    };
  }

  return {
    createGuideModule,
    GUIDE_LAYERS
  };
})();
