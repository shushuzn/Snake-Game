/**
 * Achievement Showcase Module (成就展示模块)
 *
 * Features:
 * - Achievement categories (score, combo, mode, pvp, collect, special)
 * - Rarity system (common, rare, epic, legendary)
 * - Progress tracking for partially completed achievements
 * - Achievement unlock notifications with animations
 * - Share functionality
 */

window.SnakeAchievementShowcase = (() => {
  // Rarity definitions
  const RARITIES = {
    common: { name: '普通', color: '#9e9e9e', icon: '⚪', glow: 'rgba(158,158,158,0.3)' },
    rare: { name: '稀有', color: '#2196f3', icon: '💎', glow: 'rgba(33,150,243,0.4)' },
    epic: { name: '史诗', color: '#9c27b0', icon: '💜', glow: 'rgba(156,39,176,0.4)' },
    legendary: { name: '传说', color: '#ff9800', icon: '👑', glow: 'rgba(255,152,0,0.5)' }
  };

  // Achievement categories
  const CATEGORIES = {
    score: { name: '分数类', icon: '📊', description: '达到指定分数' },
    combo: { name: '连击类', icon: '⚡', description: '达成连击要求' },
    mode: { name: '模式类', icon: '🎮', description: '完成特定模式挑战' },
    pvp: { name: '对战类', icon: '🎯', description: 'PVP对战成就' },
    collect: { name: '收集类', icon: '🎁', description: '收集物品成就' },
    special: { name: '特殊类', icon: '🌟', description: '特殊条件成就' }
  };

  // Achievement definitions with full metadata
  const ACHIEVEMENTS = [
    // Score achievements (分数类)
    {
      id: 'score200',
      name: '初试锋芒',
      description: '单局得分超过200分',
      category: 'score',
      rarity: 'common',
      icon: '🎯',
      condition: { type: 'score', value: 200 },
      targetValue: 200
    },
    {
      id: 'score500',
      name: '五百雄兵',
      description: '单局得分超过500分',
      category: 'score',
      rarity: 'common',
      icon: '💰',
      condition: { type: 'score', value: 500 },
      targetValue: 500
    },
    {
      id: 'score1000',
      name: '千分大师',
      description: '单局得分超过1000分',
      category: 'score',
      rarity: 'rare',
      icon: '💎',
      condition: { type: 'score', value: 1000 },
      targetValue: 1000
    },
    {
      id: 'score2000',
      name: '两千突击',
      description: '单局得分超过2000分',
      category: 'score',
      rarity: 'epic',
      icon: '🏅',
      condition: { type: 'score', value: 2000 },
      targetValue: 2000
    },

    // Combo achievements (连击类)
    {
      id: 'combo5',
      name: '五连斩',
      description: '达成5连击',
      category: 'combo',
      rarity: 'common',
      icon: '🔥',
      condition: { type: 'combo', value: 5 },
      targetValue: 5
    },
    {
      id: 'combo10',
      name: '十面埋伏',
      description: '达成10连击',
      category: 'combo',
      rarity: 'rare',
      icon: '⚔️',
      condition: { type: 'combo', value: 10 },
      targetValue: 10
    },
    {
      id: 'combo15',
      name: '十五连击',
      description: '达成15连击',
      category: 'combo',
      rarity: 'epic',
      icon: '🌪️',
      condition: { type: 'combo', value: 15 },
      targetValue: 15
    },

    // Mode achievements (模式类)
    {
      id: 'timedClear',
      name: '限时达人',
      description: '在限时模式中获得100分',
      category: 'mode',
      rarity: 'common',
      icon: '⏰',
      condition: { type: 'modeScore', mode: 'timed', value: 100 },
      targetValue: 100
    },
    {
      id: 'endlessLevel5',
      name: '无尽探索',
      description: '在无尽模式中达到5级',
      category: 'mode',
      rarity: 'rare',
      icon: '♾️',
      condition: { type: 'endlessLevel', value: 5 },
      targetValue: 5
    },
    {
      id: 'endlessLevel10',
      name: '无尽勇者',
      description: '在无尽模式中达到10级',
      category: 'mode',
      rarity: 'epic',
      icon: '🚀',
      condition: { type: 'endlessLevel', value: 10 },
      targetValue: 10
    },
    {
      id: 'endlessLevel20',
      name: '无尽传奇',
      description: '在无尽模式中达到20级',
      category: 'mode',
      rarity: 'legendary',
      icon: '🐉',
      condition: { type: 'endlessLevel', value: 20 },
      targetValue: 20
    },

    // PvP achievements (对战类)
    {
      id: 'aiBeatEasy',
      name: '初战告捷',
      description: '在AI对战中击败简单难度',
      category: 'pvp',
      rarity: 'common',
      icon: '🤖',
      condition: { type: 'aiBeat', difficulty: 'easy' },
      targetValue: 1
    },
    {
      id: 'aiBeatNormal',
      name: '棋逢对手',
      description: '在AI对战中击败普通难度',
      category: 'pvp',
      rarity: 'rare',
      icon: '🎯',
      condition: { type: 'aiBeat', difficulty: 'normal' },
      targetValue: 1
    },
    {
      id: 'aiBeatHard',
      name: '绝地反击',
      description: '在AI对战中击败困难难度',
      category: 'pvp',
      rarity: 'epic',
      icon: '💥',
      condition: { type: 'aiBeat', difficulty: 'hard' },
      targetValue: 1
    },
    {
      id: 'aiBeatHell',
      name: '地狱征服者',
      description: '在AI对战中击败地狱难度',
      category: 'pvp',
      rarity: 'legendary',
      icon: '👹',
      condition: { type: 'aiBeat', difficulty: 'hell' },
      targetValue: 1
    },
    {
      id: 'multiplayerWin2',
      name: '双人对决',
      description: '在多人对战中获得2连胜',
      category: 'pvp',
      rarity: 'common',
      icon: '👥',
      condition: { type: 'multiplayerWins', count: 2 },
      targetValue: 2
    },
    {
      id: 'multiplayerWin3',
      name: '三人连胜',
      description: '在多人对战中获得3连胜',
      category: 'pvp',
      rarity: 'rare',
      icon: '🎭',
      condition: { type: 'multiplayerWins', count: 3 },
      targetValue: 3
    },
    {
      id: 'multiplayerWin4',
      name: '四人霸主',
      description: '在多人对战中获得4连胜',
      category: 'pvp',
      rarity: 'epic',
      icon: '🏆',
      condition: { type: 'multiplayerWins', count: 4 },
      targetValue: 4
    },
    {
      id: 'spectate5',
      name: '观战新手',
      description: '观战AI对战5次',
      category: 'pvp',
      rarity: 'common',
      icon: '👁️',
      condition: { type: 'spectate', count: 5 },
      targetValue: 5
    },
    {
      id: 'spectate20',
      name: '观战达人',
      description: '观战AI对战20次',
      category: 'pvp',
      rarity: 'rare',
      icon: '🎬',
      condition: { type: 'spectate', count: 20 },
      targetValue: 20
    },

    // Collect achievements (收集类)
    {
      id: 'foods100',
      name: '初尝美味',
      description: '累计吃掉100个食物',
      category: 'collect',
      rarity: 'common',
      icon: '🍎',
      condition: { type: 'foodsCollected', value: 100 },
      targetValue: 100
    },
    {
      id: 'foods500',
      name: '美食家',
      description: '累计吃掉500个食物',
      category: 'collect',
      rarity: 'rare',
      icon: '🍔',
      condition: { type: 'foodsCollected', value: 500 },
      targetValue: 500
    },
    {
      id: 'foods1000',
      name: '大胃王',
      description: '累计吃掉1000个食物',
      category: 'collect',
      rarity: 'epic',
      icon: '🍽️',
      condition: { type: 'foodsCollected', value: 1000 },
      targetValue: 1000
    },
    {
      id: 'codex5',
      name: '图鉴收集者',
      description: '收集5个图鉴',
      category: 'collect',
      rarity: 'common',
      icon: '📖',
      condition: { type: 'codexCollected', value: 5 },
      targetValue: 5
    },
    {
      id: 'codex10',
      name: '图鉴大师',
      description: '收集10个图鉴',
      category: 'collect',
      rarity: 'rare',
      icon: '📚',
      condition: { type: 'codexCollected', value: 10 },
      targetValue: 10
    },
    {
      id: 'allCodex',
      name: '全知全能',
      description: '收集所有图鉴',
      category: 'collect',
      rarity: 'legendary',
      icon: '🌈',
      condition: { type: 'allCodex' },
      targetValue: 1
    },

    // Special achievements (特殊类)
    {
      id: 'games10',
      name: '初出茅庐',
      description: '累计完成10局游戏',
      category: 'special',
      rarity: 'common',
      icon: '🎮',
      condition: { type: 'totalGames', value: 10 },
      targetValue: 10
    },
    {
      id: 'games50',
      name: '小试牛刀',
      description: '累计完成50局游戏',
      category: 'special',
      rarity: 'rare',
      icon: '🎲',
      condition: { type: 'totalGames', value: 50 },
      targetValue: 50
    },
    {
      id: 'games100',
      name: '百战老兵',
      description: '累计完成100局游戏',
      category: 'special',
      rarity: 'epic',
      icon: '🕹️',
      condition: { type: 'totalGames', value: 100 },
      targetValue: 100
    },
    {
      id: 'dailyStreak7',
      name: '一周签到',
      description: '连续签到7天',
      category: 'special',
      rarity: 'common',
      icon: '📅',
      condition: { type: 'dailyStreak', value: 7 },
      targetValue: 7
    },
    {
      id: 'dailyStreak30',
      name: '月度签到',
      description: '连续签到30天',
      category: 'special',
      rarity: 'rare',
      icon: '🗓️',
      condition: { type: 'dailyStreak', value: 30 },
      targetValue: 30
    },
    {
      id: 'firstTask',
      name: '任务新人',
      description: '完成第一个每日任务',
      category: 'special',
      rarity: 'common',
      icon: '✅',
      condition: { type: 'tasksCompleted', value: 1 },
      targetValue: 1
    },
    {
      id: 'allTasks',
      name: '任务达人',
      description: '一次性完成所有每日任务',
      category: 'special',
      rarity: 'rare',
      icon: '🏅',
      condition: { type: 'allTasksCompleted' },
      targetValue: 1
    }
  ];

  const STORAGE_KEY = 'snake-achievements-showcase-data';
  const UNLOCKED_KEY = 'snake-achievements-unlocked';

  // Load achievements data from storage
  function loadAchievementsData(storage) {
    return storage.readJson(STORAGE_KEY, {
      unlockedAchievements: {},
      recentlyUnlocked: null,
      stats: {}
    });
  }

  // Save achievements data to storage
  function saveAchievementsData(storage, data) {
    storage.writeJson(STORAGE_KEY, data);
  }

  // Check if an achievement is unlocked
  function isAchievementUnlocked(storage, achievementId) {
    const data = loadAchievementsData(storage);
    return Boolean(data.unlockedAchievements[achievementId]);
  }

  // Get current progress for an achievement
  function getAchievementProgress(storage, achievementId, currentStats) {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return null;

    const data = loadAchievementsData(storage);
    if (data.unlockedAchievements[achievementId]) {
      return {
        unlocked: true,
        current: achievement.targetValue,
        target: achievement.targetValue,
        percentage: 100
      };
    }

    let current = 0;
    const target = achievement.targetValue;
    const condition = achievement.condition;

    switch (condition.type) {
      case 'score':
        current = Math.min(currentStats.bestScore || 0, target);
        break;
      case 'combo':
        current = Math.min(currentStats.highestCombo || 0, target);
        break;
      case 'modeScore':
        current = Math.min(currentStats.modeBestScores?.[condition.mode] || 0, target);
        break;
      case 'endlessLevel':
        current = Math.min(currentStats.endlessLevel || 0, target);
        break;
      case 'aiBeat':
        current = data.stats.aiWins?.[condition.difficulty] || 0;
        current = Math.min(current, target);
        break;
      case 'multiplayerWins':
        current = Math.min(currentStats.streakWins || 0, target);
        break;
      case 'spectate':
        current = Math.min(data.stats.spectateCount || 0, target);
        break;
      case 'foodsCollected':
        current = Math.min(currentStats.totalFoodsEaten || 0, target);
        break;
      case 'codexCollected':
        current = Math.min(currentStats.codexDiscovered || 0, target);
        break;
      case 'allCodex':
        current = currentStats.codexDiscovered >= 10 ? 1 : 0;
        break;
      case 'totalGames':
        current = Math.min(currentStats.totalGames || 0, target);
        break;
      case 'dailyStreak':
        current = Math.min(currentStats.dailyStreak || 0, target);
        break;
      case 'tasksCompleted':
        current = Math.min(currentStats.tasksCompleted || 0, target);
        break;
      case 'allTasksCompleted':
        current = currentStats.allTasksCompleted ? 1 : 0;
        break;
    }

    const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

    return {
      unlocked: current >= target,
      current,
      target,
      percentage
    };
  }

  // Unlock an achievement
  function unlockAchievement(storage, achievementId) {
    const data = loadAchievementsData(storage);
    if (!data.unlockedAchievements[achievementId]) {
      data.unlockedAchievements[achievementId] = {
        unlockedAt: Date.now()
      };
      data.recentlyUnlocked = {
        achievementId,
        timestamp: Date.now()
      };
      saveAchievementsData(storage, data);
      return true;
    }
    return false;
  }

  // Get all achievements with unlock status and progress
  function getAllAchievements(storage, currentStats) {
    const data = loadAchievementsData(storage);
    return ACHIEVEMENTS.map(achievement => {
      const progress = getAchievementProgress(storage, achievement.id, currentStats);
      return {
        ...achievement,
        unlocked: progress?.unlocked || false,
        progress: progress?.current || 0,
        target: progress?.target || achievement.targetValue,
        percentage: progress?.percentage || 0
      };
    });
  }

  // Get achievements by category
  function getAchievementsByCategory(storage, category, currentStats) {
    return ACHIEVEMENTS.filter(a => a.category === category)
      .map(achievement => {
        const progress = getAchievementProgress(storage, achievement.id, currentStats);
        return {
          ...achievement,
          unlocked: progress?.unlocked || false,
          progress: progress?.current || 0,
          target: progress?.target || achievement.targetValue,
          percentage: progress?.percentage || 0
        };
      });
  }

  // Get unlocked achievements
  function getUnlockedAchievements(storage) {
    const data = loadAchievementsData(storage);
    return ACHIEVEMENTS.filter(a => data.unlockedAchievements[a.id])
      .map(a => ({ ...a, unlocked: true }));
  }

  // Get recently unlocked achievement
  function getRecentlyUnlocked(storage) {
    const data = loadAchievementsData(storage);
    if (!data.recentlyUnlocked) return null;

    const achievement = ACHIEVEMENTS.find(a => a.id === data.recentlyUnlocked.achievementId);
    if (!achievement) return null;

    // Clear if older than 24 hours
    const dayMs = 24 * 60 * 60 * 1000;
    if (Date.now() - data.recentlyUnlocked.timestamp > dayMs) {
      data.recentlyUnlocked = null;
      saveAchievementsData(storage, data);
      return null;
    }

    return {
      ...achievement,
      unlocked: true
    };
  }

  // Clear recently unlocked notification
  function clearRecentlyUnlocked(storage) {
    const data = loadAchievementsData(storage);
    data.recentlyUnlocked = null;
    saveAchievementsData(storage, data);
  }

  // Update stats for progress tracking
  function updateStats(storage, stats) {
    const data = loadAchievementsData(storage);
    data.stats = { ...data.stats, ...stats };
    saveAchievementsData(storage, data);
  }

  // Check and unlock achievements based on current stats
  function checkAndUnlockAchievements(storage, currentStats) {
    const data = loadAchievementsData(storage);
    const newlyUnlocked = [];

    for (const achievement of ACHIEVEMENTS) {
      if (data.unlockedAchievements[achievement.id]) continue;

      const progress = getAchievementProgress(storage, achievement.id, currentStats);
      if (progress && progress.unlocked) {
        data.unlockedAchievements[achievement.id] = {
          unlockedAt: Date.now()
        };
        newlyUnlocked.push(achievement);
      }
    }

    if (newlyUnlocked.length > 0) {
      data.recentlyUnlocked = {
        achievementId: newlyUnlocked[0].id,
        timestamp: Date.now()
      };
      saveAchievementsData(storage, data);
    }

    return newlyUnlocked;
  }

  // Generate share text for achievements
  function generateShareText(storage, currentStats) {
    const data = loadAchievementsData(storage);
    const unlockedCount = Object.keys(data.unlockedAchievements).length;
    const totalCount = ACHIEVEMENTS.length;

    let text = `🐍 贪吃蛇成就进度\n`;
    text += `━━━━━━━━━━━━━━━━\n`;
    text += `已解锁: ${unlockedCount}/${totalCount}\n\n`;

    // Group by category
    const categories = Object.keys(CATEGORIES);
    for (const catId of categories) {
      const catAchievements = ACHIEVEMENTS.filter(a => a.category === catId);
      const catUnlocked = catAchievements.filter(a => data.unlockedAchievements[a.id]).length;
      if (catUnlocked > 0) {
        text += `${CATEGORIES[catId].icon} ${CATEGORIES[catId].name}: ${catUnlocked}/${catAchievements.length}\n`;
      }
    }

    text += `\n✨ 我的最高分: ${currentStats.bestScore || 0}\n`;
    text += `⚡ 最高连击: ${currentStats.highestCombo || 0}\n`;
    text += `🎮 总场次: ${currentStats.totalGames || 0}`;

    return text;
  }

  // Get achievement by ID
  function getAchievementById(achievementId) {
    return ACHIEVEMENTS.find(a => a.id === achievementId) || null;
  }

  // Get categories
  function getCategories() {
    return Object.entries(CATEGORIES).map(([id, info]) => ({
      id,
      ...info
    }));
  }

  // Get rarities
  function getRarities() {
    return RARITIES;
  }

  // Get total count
  function getTotalCount() {
    return ACHIEVEMENTS.length;
  }

  // Get unlocked count
  function getUnlockedCount(storage) {
    const data = loadAchievementsData(storage);
    return Object.keys(data.unlockedAchievements).length;
  }

  // Create achievement showcase module
  function createAchievementShowcaseModule({ storage }) {
    return {
      getAllAchievements: (stats) => getAllAchievements(storage, stats),
      getAchievementsByCategory: (category, stats) => getAchievementsByCategory(storage, category, stats),
      getUnlockedAchievements: () => getUnlockedAchievements(storage),
      getRecentlyUnlocked: () => getRecentlyUnlocked(storage),
      clearRecentlyUnlocked: () => clearRecentlyUnlocked(storage),
      checkAndUnlockAchievements: (stats) => checkAndUnlockAchievements(storage, stats),
      isAchievementUnlocked: (id) => isAchievementUnlocked(storage, id),
      unlockAchievement: (id) => unlockAchievement(storage, id),
      updateStats: (stats) => updateStats(storage, stats),
      generateShareText: (stats) => generateShareText(storage, stats),
      getAchievementById: (id) => getAchievementById(id),
      getCategories: () => getCategories(),
      getRarities: () => getRarities(),
      getTotalCount: () => getTotalCount(),
      getUnlockedCount: () => getUnlockedCount(storage),
      ACHIEVEMENTS,
      CATEGORIES,
      RARITIES
    };
  }

  return { createAchievementShowcaseModule };
})();
