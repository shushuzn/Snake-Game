/**
 * Title System (称号系统)
 *
 * Features:
 * - Title definitions with unlock conditions
 * - Title storage and persistence
 * - Title unlock checking based on game stats
 * - Title display in profile and HUD
 * - Title selection and equip
 */

window.SnakeTitles = (() => {
  // Title categories
  const CATEGORIES = {
    beginner: { name: '初学者', icon: '🌱' },
    score: { name: '得分达人', icon: '📊' },
    combo: { name: '连击高手', icon: '⚡' },
    survival: { name: '生存大师', icon: '🏆' },
    special: { name: '特殊成就', icon: '🌟' },
    secret: { name: '隐藏荣誉', icon: '🔮' }
  };

  // Title definitions with unlock conditions
  const TITLES = [
    // 初学者称号 (beginner)
    {
      id: 'first-game',
      name: '初出茅庐',
      description: '完成第一局游戏',
      category: 'beginner',
      icon: '🎮',
      condition: { type: 'totalGames', value: 1 },
      secret: false
    },
    {
      id: 'ten-games',
      name: '小试牛刀',
      description: '累计完成10局游戏',
      category: 'beginner',
      icon: '🎯',
      condition: { type: 'totalGames', value: 10 },
      secret: false
    },
    {
      id: 'fifty-games',
      name: '资深玩家',
      description: '累计完成50局游戏',
      category: 'beginner',
      icon: '🎲',
      condition: { type: 'totalGames', value: 50 },
      secret: false
    },
    {
      id: 'hundred-games',
      name: '百战老兵',
      description: '累计完成100局游戏',
      category: 'beginner',
      icon: '🕹️',
      condition: { type: 'totalGames', value: 100 },
      secret: false
    },

    // 得分达人称号 (score)
    {
      id: 'score-100',
      name: '破百斩',
      description: '单局得分超过100分',
      category: 'score',
      icon: '💯',
      condition: { type: 'bestScore', value: 100 },
      secret: false
    },
    {
      id: 'score-500',
      name: '五百雄兵',
      description: '单局得分超过500分',
      category: 'score',
      icon: '💰',
      condition: { type: 'bestScore', value: 500 },
      secret: false
    },
    {
      id: 'score-1000',
      name: '千分大师',
      description: '单局得分超过1000分',
      category: 'score',
      icon: '💎',
      condition: { type: 'bestScore', value: 1000 },
      secret: false
    },
    {
      id: 'score-2000',
      name: '两千突击',
      description: '单局得分超过2000分',
      category: 'score',
      icon: '👑',
      condition: { type: 'bestScore', value: 2000 },
      secret: false
    },
    {
      id: 'score-5000',
      name: '五千传说',
      description: '单局得分超过5000分',
      category: 'score',
      icon: '🏅',
      condition: { type: 'bestScore', value: 5000 },
      secret: false
    },
    {
      id: 'score-10000',
      name: '万分至尊',
      description: '单局得分超过10000分',
      category: 'score',
      icon: '🦄',
      condition: { type: 'bestScore', value: 10000 },
      secret: false
    },

    // 连击高手称号 (combo)
    {
      id: 'combo-3',
      name: '三连斩',
      description: '达成3连击',
      category: 'combo',
      icon: '🔥',
      condition: { type: 'highestCombo', value: 3 },
      secret: false
    },
    {
      id: 'combo-5',
      name: '五星连珠',
      description: '达成5连击',
      category: 'combo',
      icon: '✨',
      condition: { type: 'highestCombo', value: 5 },
      secret: false
    },
    {
      id: 'combo-10',
      name: '十面埋伏',
      description: '达成10连击',
      category: 'combo',
      icon: '⚔️',
      condition: { type: 'highestCombo', value: 10 },
      secret: false
    },
    {
      id: 'combo-20',
      name: '二十连击',
      description: '达成20连击',
      category: 'combo',
      icon: '🌪️',
      condition: { type: 'highestCombo', value: 20 },
      secret: false
    },
    {
      id: 'combo-50',
      name: '五十弦翻',
      description: '达成50连击',
      category: 'combo',
      icon: '🎆',
      condition: { type: 'highestCombo', value: 50 },
      secret: false
    },

    // 生存大师称号 (survival)
    {
      id: 'survive-60s',
      name: '坚持不懈',
      description: '单局存活超过60秒',
      category: 'survival',
      icon: '⏱️',
      condition: { type: 'maxSurvivalTime', value: 60 },
      secret: false
    },
    {
      id: 'survive-120s',
      name: '耐久之星',
      description: '单局存活超过120秒',
      category: 'survival',
      icon: '🕐',
      condition: { type: 'maxSurvivalTime', value: 120 },
      secret: false
    },
    {
      id: 'survive-180s',
      name: '三分钟传说',
      description: '单局存活超过180秒',
      category: 'survival',
      icon: '⌛',
      condition: { type: 'maxSurvivalTime', value: 180 },
      secret: false
    },
    {
      id: 'survive-300s',
      name: '永生之蛇',
      description: '单局存活超过300秒',
      category: 'survival',
      icon: '🐉',
      condition: { type: 'maxSurvivalTime', value: 300 },
      secret: false
    },

    // 特殊成就称号 (special)
    {
      id: 'mode-classic',
      name: '经典传承',
      description: '在经典模式下获得最高分',
      category: 'special',
      icon: '🎮',
      condition: { type: 'modeBestScore', mode: 'classic', value: 100 },
      secret: false
    },
    {
      id: 'mode-timed',
      name: '限时精英',
      description: '在限时模式下获得最高分',
      category: 'special',
      icon: '⏰',
      condition: { type: 'modeBestScore', mode: 'timed', value: 100 },
      secret: false
    },
    {
      id: 'mode-blitz',
      name: '冲刺之王',
      description: '在冲刺模式下获得最高分',
      category: 'special',
      icon: '🚀',
      condition: { type: 'modeBestScore', mode: 'blitz', value: 100 },
      secret: false
    },
    {
      id: 'mode-endless',
      name: '无尽探索',
      description: '在无尽模式下获得最高分',
      category: 'special',
      icon: '♾️',
      condition: { type: 'modeBestScore', mode: 'endless', value: 100 },
      secret: false
    },
    {
      id: 'mode-roguelike',
      name: '肉鸽勇者',
      description: '在肉鸽模式下获得最高分',
      category: 'special',
      icon: '🎰',
      condition: { type: 'modeBestScore', mode: 'roguelike', value: 100 },
      secret: false
    },

    // 隐藏荣誉称号 (secret)
    {
      id: 'perfect-game',
      name: '完美主义',
      description: '单局得分超过5000分且无伤通关',
      category: 'secret',
      icon: '💫',
      condition: { type: 'perfectGame', value: 1 },
      secret: true
    },
    {
      id: 'speed-demon',
      name: '速度恶魔',
      description: '在30秒内获得500分',
      category: 'secret',
      icon: '💨',
      condition: { type: 'speedScore', time: 30, score: 500 },
      secret: true
    },
    {
      id: 'comeback-king',
      name: '绝地反击',
      description: '血量低于20%时反杀获得1000分',
      category: 'secret',
      icon: '🔄',
      condition: { type: 'comebackScore', value: 1000 },
      secret: true
    },
    {
      id: 'all-modes',
      name: '全能选手',
      description: '在所有模式中都获得过最高分',
      category: 'secret',
      icon: '🎭',
      condition: { type: 'allModesPlayed', value: 1 },
      secret: true
    }
  ];

  const STORAGE_KEY = 'snake-titles-data';
  const EQUIPPED_TITLE_KEY = 'snake-equipped-title';

  // Load titles data from storage
  function loadTitlesData(storage) {
    return storage.readJson(STORAGE_KEY, {
      unlockedTitles: [],
      recentlyUnlocked: null
    });
  }

  // Save titles data to storage
  function saveTitlesData(storage, data) {
    storage.writeJson(STORAGE_KEY, data);
  }

  // Check if a title is unlocked
  function isTitleUnlocked(storage, titleId) {
    const data = loadTitlesData(storage);
    return data.unlockedTitles.includes(titleId);
  }

  // Unlock a title
  function unlockTitle(storage, titleId) {
    const data = loadTitlesData(storage);
    if (!data.unlockedTitles.includes(titleId)) {
      data.unlockedTitles.push(titleId);
      data.recentlyUnlocked = {
        titleId: titleId,
        timestamp: Date.now()
      };
      saveTitlesData(storage, data);
      return true;
    }
    return false;
  }

  // Get all titles with unlock status
  function getAllTitles(storage) {
    const data = loadTitlesData(storage);
    return TITLES.map(title => ({
      ...title,
      unlocked: data.unlockedTitles.includes(title.id)
    }));
  }

  // Get titles by category
  function getTitlesByCategory(storage, category) {
    const data = loadTitlesData(storage);
    return TITLES.filter(title => title.category === category)
      .map(title => ({
        ...title,
        unlocked: data.unlockedTitles.includes(title.id)
      }));
  }

  // Get unlocked titles
  function getUnlockedTitles(storage) {
    const data = loadTitlesData(storage);
    return TITLES.filter(title => data.unlockedTitles.includes(title.id))
      .map(title => ({
        ...title,
        unlocked: true
      }));
  }

  // Get recently unlocked title
  function getRecentlyUnlocked(storage) {
    const data = loadTitlesData(storage);
    if (!data.recentlyUnlocked) return null;
    
    const title = TITLES.find(t => t.id === data.recentlyUnlocked.titleId);
    if (!title) return null;

    // Clear if older than 24 hours
    const dayMs = 24 * 60 * 60 * 1000;
    if (Date.now() - data.recentlyUnlocked.timestamp > dayMs) {
      data.recentlyUnlocked = null;
      saveTitlesData(storage, data);
      return null;
    }

    return {
      ...title,
      unlocked: true
    };
  }

  // Clear recently unlocked notification
  function clearRecentlyUnlocked(storage) {
    const data = loadTitlesData(storage);
    data.recentlyUnlocked = null;
    saveTitlesData(storage, data);
  }

  // Check and unlock titles based on stats
  function checkAndUnlockTitles(storage, stats) {
    const data = loadTitlesData(storage);
    const newlyUnlocked = [];

    for (const title of TITLES) {
      // Skip if already unlocked
      if (data.unlockedTitles.includes(title.id)) continue;

      let unlocked = false;

      switch (title.condition.type) {
        case 'totalGames':
          unlocked = stats.totalGames >= title.condition.value;
          break;

        case 'bestScore':
          unlocked = stats.bestScore >= title.condition.value;
          break;

        case 'highestCombo':
          unlocked = stats.highestCombo >= title.condition.value;
          break;

        case 'maxSurvivalTime':
          unlocked = stats.maxSurvivalTime >= title.condition.value;
          break;

        case 'modeBestScore':
          const modeStats = stats.modeStats?.[title.condition.mode];
          unlocked = modeStats && modeStats.bestScore >= title.condition.value;
          break;

        case 'perfectGame':
          // perfectGame requires high score without taking damage
          unlocked = stats.perfectGames >= title.condition.value;
          break;

        case 'speedScore':
          // speedScore requires earning certain score within time
          unlocked = stats.speedScores?.some(s => 
            s.score >= title.condition.score && s.time <= title.condition.time
          );
          break;

        case 'comebackScore':
          unlocked = stats.comebackScores?.some(s => s >= title.condition.value);
          break;

        case 'allModesPlayed':
          const modes = ['classic', 'timed', 'blitz', 'endless', 'roguelike'];
          unlocked = modes.every(m => 
            stats.modeStats?.[m]?.bestScore > 0
          );
          break;
      }

      if (unlocked) {
        data.unlockedTitles.push(title.id);
        newlyUnlocked.push(title);
      }
    }

    if (newlyUnlocked.length > 0) {
      data.recentlyUnlocked = {
        titleId: newlyUnlocked[0].id,
        timestamp: Date.now()
      };
      saveTitlesData(storage, data);
    }

    return newlyUnlocked;
  }

  // Get equipped title
  function getEquippedTitle(storage) {
    const equippedId = storage.readText(EQUIPPED_TITLE_KEY, '');
    if (!equippedId) return null;
    
    const title = TITLES.find(t => t.id === equippedId);
    if (!title) return null;

    const data = loadTitlesData(storage);
    if (!data.unlockedTitles.includes(equippedId)) return null;

    return {
      ...title,
      unlocked: true
    };
  }

  // Equip a title
  function equipTitle(storage, titleId) {
    const data = loadTitlesData(storage);
    if (!data.unlockedTitles.includes(titleId)) {
      return { success: false, message: '该称号尚未解锁' };
    }

    const title = TITLES.find(t => t.id === titleId);
    if (!title) {
      return { success: false, message: '称号不存在' };
    }

    storage.writeText(EQUIPPED_TITLE_KEY, titleId);
    return { success: true, message: '称号装备成功', title };
  }

  // Unequip current title
  function unequipTitle(storage) {
    storage.writeText(EQUIPPED_TITLE_KEY, '');
  }

  // Get categories
  function getCategories() {
    return Object.entries(CATEGORIES).map(([id, info]) => ({
      id,
      ...info
    }));
  }

  // Get title by ID
  function getTitleById(titleId) {
    return TITLES.find(t => t.id === titleId) || null;
  }

  // Get progress towards unlocking a title
  function getTitleProgress(storage, titleId) {
    const title = TITLES.find(t => t.id === titleId);
    if (!title) return null;

    const data = loadTitlesData(storage);
    if (data.unlockedTitles.includes(titleId)) {
      return { unlocked: true, current: title.condition.value, target: title.condition.value, percentage: 100 };
    }

    let current = 0;
    const target = title.condition.value;

    // This would need actual stats passed in, simplified here
    return { unlocked: false, current: 0, target, percentage: 0 };
  }

  // Create titles module
  function createTitlesModule({ storage }) {
    return {
      getAllTitles: () => getAllTitles(storage),
      getTitlesByCategory: (category) => getTitlesByCategory(storage, category),
      getUnlockedTitles: () => getUnlockedTitles(storage),
      getRecentlyUnlocked: () => getRecentlyUnlocked(storage),
      clearRecentlyUnlocked: () => clearRecentlyUnlocked(storage),
      checkAndUnlockTitles: (stats) => checkAndUnlockTitles(storage, stats),
      isTitleUnlocked: (titleId) => isTitleUnlocked(storage, titleId),
      unlockTitle: (titleId) => unlockTitle(storage, titleId),
      getEquippedTitle: () => getEquippedTitle(storage),
      equipTitle: (titleId) => equipTitle(storage, titleId),
      unequipTitle: () => unequipTitle(storage),
      getCategories: () => getCategories(),
      getTitleById: (titleId) => getTitleById(titleId),
      getTitleProgress: (titleId) => getTitleProgress(storage, titleId),
      TITLES,
      CATEGORIES
    };
  }

  return { createTitlesModule };
})();
