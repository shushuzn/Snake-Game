/**
 * Achievement Showcase Module (成就展示模块) - Pure UI Layer
 *
 * This module provides the display layer for achievements.
 * It does NOT maintain its own storage - it reads from the game's existing
 * achievements object and provides UI enhancements (categories, rarities, progress).
 *
 * Features:
 * - Achievement categories (score, combo, mode, pvp, collect, special)
 * - Rarity system (common, rare, epic, legendary)
 * - Progress tracking for partially completed achievements
 * - Achievement unlock notifications with animations
 * - Share functionality
 *
 * IMPORTANT: This is a PURE DISPLAY module. Achievement unlocking is handled
 * by the existing game.js unlockAchievement() function.
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

  // Display metadata for achievements (extends game.js ACHIEVEMENT_KEYS)
  // This maps achievement keys to their display properties
  const ACHIEVEMENT_META = {
    // Score achievements (分数类)
    score200: { name: '初试锋芒', description: '单局得分超过200分', category: 'score', rarity: 'common', icon: '🎯', target: 200 },
    score500: { name: '五百雄兵', description: '单局得分超过500分', category: 'score', rarity: 'common', icon: '💰', target: 500 },
    score1000: { name: '千分大师', description: '单局得分超过1000分', category: 'score', rarity: 'rare', icon: '💎', target: 1000 },
    score2000: { name: '两千突击', description: '单局得分超过2000分', category: 'score', rarity: 'epic', icon: '🏅', target: 2000 },

    // Combo achievements (连击类)
    combo5: { name: '五连斩', description: '达成5连击', category: 'combo', rarity: 'common', icon: '🔥', target: 5 },
    combo10: { name: '十面埋伏', description: '达成10连击', category: 'combo', rarity: 'rare', icon: '⚔️', target: 10 },
    combo15: { name: '十五连击', description: '达成15连击', category: 'combo', rarity: 'epic', icon: '⚡', target: 15 },

    // Mode achievements (模式类)
    timedClear: { name: '限时通关', description: '在限时模式中达到60秒', category: 'mode', rarity: 'common', icon: '⏰', target: 1 },

    // PVP achievements (对战类) - AI
    aiBeatEasy: { name: '初试锋芒', description: '击败简单AI', category: 'pvp', rarity: 'common', icon: '🤖', target: 1 },
    aiBeatNormal: { name: '以牙还牙', description: '击败普通AI', category: 'pvp', rarity: 'rare', icon: '🤖', target: 1 },
    aiBeatHard: { name: '所向披靡', description: '击败困难AI', category: 'pvp', rarity: 'epic', icon: '🤖', target: 1 },
    aiBeatHell: { name: '地狱征服者', description: '击败地狱AI', category: 'pvp', rarity: 'legendary', icon: '👹', target: 1 },

    // PVP achievements (对战类) - Multiplayer
    multiplayerWin2: { name: '双人冠军', description: '在多人对战中获得第1名', category: 'pvp', rarity: 'common', icon: '🏆', target: 1 },
    multiplayerWin3: { name: '三人冠军', description: '在3人对战中获得第1名', category: 'pvp', rarity: 'rare', icon: '🏆', target: 1 },
    multiplayerWin4: { name: '四人冠军', description: '在4人对战中获得第1名', category: 'pvp', rarity: 'epic', icon: '🏆', target: 1 },

    // PVP achievements (对战类) - Spectate
    spectate5: { name: '观战新手', description: '观战5次', category: 'pvp', rarity: 'common', icon: '👀', target: 5 },
    spectate20: { name: '观战老手', description: '观战20次', category: 'pvp', rarity: 'rare', icon: '👀', target: 20 },

    // Collect achievements (收集类) - Foods
    foods100: { name: '小胃王', description: '累计吃掉100个食物', category: 'collect', rarity: 'common', icon: '🍎', target: 100 },
    foods500: { name: '美食家', description: '累计吃掉500个食物', category: 'collect', rarity: 'rare', icon: '🍔', target: 500 },
    foods1000: { name: '大胃王', description: '累计吃掉1000个食物', category: 'collect', rarity: 'epic', icon: '🍽️', target: 1000 },

    // Collect achievements (收集类) - Codex
    codex5: { name: '图鉴收集者', description: '收集5个图鉴', category: 'collect', rarity: 'common', icon: '📖', target: 5 },
    codex10: { name: '图鉴大师', description: '收集10个图鉴', category: 'collect', rarity: 'rare', icon: '📚', target: 10 },
    allCodex: { name: '全知全能', description: '收集所有图鉴', category: 'collect', rarity: 'legendary', icon: '🌈', target: 1 },

    // Special achievements (特殊类) - Games
    games10: { name: '初出茅庐', description: '累计完成10局游戏', category: 'special', rarity: 'common', icon: '🎮', target: 10 },
    games50: { name: '小试牛刀', description: '累计完成50局游戏', category: 'special', rarity: 'rare', icon: '🎲', target: 50 },
    games100: { name: '百战老兵', description: '累计完成100局游戏', category: 'special', rarity: 'epic', icon: '🕹️', target: 100 },

    // Special achievements (特殊类) - Daily
    dailyStreak7: { name: '一周签到', description: '连续签到7天', category: 'special', rarity: 'common', icon: '📅', target: 7 },
    dailyStreak30: { name: '月度签到', description: '连续签到30天', category: 'special', rarity: 'rare', icon: '📅', target: 30 },

    // Special achievements (特殊类) - Tasks
    firstTask: { name: '任务达人', description: '完成首个每日任务', category: 'special', rarity: 'common', icon: '✅', target: 1 },
    allTasks: { name: '任务大师', description: '完成所有每日任务', category: 'special', rarity: 'rare', icon: '⭐', target: 1 },

    // Special achievements (特殊类) - Endless
    endlessLevel5: { name: '无尽探索', description: '在无尽模式达到5级', category: 'mode', rarity: 'common', icon: '♾️', target: 5 },
    endlessLevel10: { name: '无尽挑战', description: '在无尽模式达到10级', category: 'mode', rarity: 'rare', icon: '♾️', target: 10 },
    endlessLevel20: { name: '无尽王者', description: '在无尽模式达到20级', category: 'mode', rarity: 'epic', icon: '♾️', target: 20 }
  };

  // Get achievement metadata by ID
  function getAchievementMeta(achievementId) {
    return ACHIEVEMENT_META[achievementId] || null;
  }

  // Get all achievement IDs from the game's ACHIEVEMENT_KEYS
  function getAllAchievementKeys() {
    // This will be injected from game.js
    return window.ACHIEVEMENT_KEYS || [];
  }

  // Calculate progress for an achievement
  // currentStats should contain: bestScore, highestCombo, totalGames, totalFoodsEaten, etc.
  function calculateProgress(achievementId, currentStats, unlockedAchievements) {
    const meta = ACHIEVEMENT_META[achievementId];
    if (!meta) return null;

    // If already unlocked, return full progress
    if (unlockedAchievements[achievementId]) {
      return { current: meta.target, target: meta.target, percentage: 100 };
    }

    let current = 0;
    const target = meta.target;

    // Map category to stats
    switch (achievementId) {
      // Score achievements
      case 'score200':
      case 'score500':
      case 'score1000':
      case 'score2000':
        current = Math.min(currentStats.bestScore || 0, target);
        break;

      // Combo achievements
      case 'combo5':
      case 'combo10':
      case 'combo15':
        current = Math.min(currentStats.highestCombo || 0, target);
        break;

      // Mode achievements
      case 'timedClear':
        current = currentStats.bestTimedScore >= 60 ? 1 : 0;
        break;
      case 'endlessLevel5':
        current = Math.min(currentStats.endlessLevel || 0, 5);
        break;
      case 'endlessLevel10':
        current = Math.min(currentStats.endlessLevel || 0, 10);
        break;
      case 'endlessLevel20':
        current = Math.min(currentStats.endlessLevel || 0, 20);
        break;

      // Game count achievements
      case 'games10':
      case 'games50':
      case 'games100':
        current = Math.min(currentStats.totalGames || 0, target);
        break;

      // Food collect achievements
      case 'foods100':
      case 'foods500':
      case 'foods1000':
        current = Math.min(currentStats.totalFoodsEaten || 0, target);
        break;

      // Codex achievements
      case 'codex5':
      case 'codex10':
      case 'allCodex':
        current = Math.min(currentStats.codexDiscovered || 0, target);
        break;

      // Daily streak achievements
      case 'dailyStreak7':
      case 'dailyStreak30':
        current = Math.min(currentStats.dailyStreak || 0, target);
        break;

      // Task achievements
      case 'firstTask':
        current = currentStats.tasksCompleted > 0 ? 1 : 0;
        break;
      case 'allTasks':
        current = currentStats.allTasksCompleted ? 1 : 0;
        break;

      // AI battle achievements
      case 'aiBeatEasy':
      case 'aiBeatNormal':
      case 'aiBeatHard':
      case 'aiBeatHell':
        current = currentStats[`${achievementId}Unlocked`] ? 1 : 0;
        break;

      // Multiplayer achievements
      case 'multiplayerWin2':
      case 'multiplayerWin3':
      case 'multiplayerWin4':
        current = currentStats[`${achievementId}Unlocked`] ? 1 : 0;
        break;

      // Spectate achievements
      case 'spectate5':
      case 'spectate20':
        current = Math.min(currentStats.spectateCount || 0, target);
        break;

      default:
        current = 0;
    }

    const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

    return {
      current,
      target,
      percentage,
      unlocked: current >= target
    };
  }

  // Get all achievements with display data and progress
  // @param {Object} unlockedAchievements - The game's achievements object (key -> boolean)
  // @param {Object} currentStats - Current game stats for progress calculation
  function getAllAchievements(unlockedAchievements, currentStats) {
    const keys = getAllAchievementKeys();
    return keys.map(key => {
      const meta = ACHIEVEMENT_META[key];
      if (!meta) {
        // If no metadata, create a basic entry
        return {
          id: key,
          name: key,
          description: key,
          category: 'special',
          rarity: 'common',
          icon: '🏆',
          target: 1,
          progress: unlockedAchievements[key] ? 1 : 0,
          percentage: unlockedAchievements[key] ? 100 : 0,
          unlocked: Boolean(unlockedAchievements[key])
        };
      }

      const progress = calculateProgress(key, currentStats, unlockedAchievements);
      return {
        id: key,
        name: meta.name,
        description: meta.description,
        category: meta.category,
        rarity: meta.rarity,
        icon: meta.icon,
        target: meta.target,
        progress: progress?.current || 0,
        percentage: progress?.percentage || 0,
        unlocked: Boolean(unlockedAchievements[key])
      };
    });
  }

  // Get achievements filtered by category
  function getAchievementsByCategory(category, unlockedAchievements, currentStats) {
    return getAllAchievements(unlockedAchievements, currentStats)
      .filter(a => a.category === category);
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

  // Generate share text
  function generateShareText(unlockedAchievements, currentStats) {
    const allAchievements = getAllAchievements(unlockedAchievements, currentStats);
    const unlockedCount = allAchievements.filter(a => a.unlocked).length;
    const totalCount = allAchievements.length;

    let text = `🐍 贪吃蛇成就进度\n`;
    text += `━━━━━━━━━━━━━━━━\n`;
    text += `已解锁: ${unlockedCount}/${totalCount}\n\n`;

    // Group by category
    for (const [catId, catInfo] of Object.entries(CATEGORIES)) {
      const catAchievements = allAchievements.filter(a => a.category === catId);
      const catUnlocked = catAchievements.filter(a => a.unlocked).length;
      if (catUnlocked > 0 || catAchievements.length > 0) {
        text += `${catInfo.icon} ${catInfo.name}: ${catUnlocked}/${catAchievements.length}\n`;
      }
    }

    text += `\n✨ 我的最高分: ${currentStats.bestScore || 0}\n`;
    text += `⚡ 最高连击: ${currentStats.highestCombo || 0}\n`;
    text += `🎮 总场次: ${currentStats.totalGames || 0}`;

    return text;
  }

  // Create achievement showcase module (pure display layer)
  function createAchievementShowcaseModule() {
    return {
      // Get all achievements with display data
      getAllAchievements: (unlockedAchievements, currentStats) =>
        getAllAchievements(unlockedAchievements, currentStats),

      // Get achievements by category
      getAchievementsByCategory: (category, unlockedAchievements, currentStats) =>
        getAchievementsByCategory(category, unlockedAchievements, currentStats),

      // Get metadata for a specific achievement
      getAchievementMeta: (achievementId) => getAchievementMeta(achievementId),

      // Calculate progress for an achievement
      calculateProgress: (achievementId, currentStats, unlockedAchievements) =>
        calculateProgress(achievementId, currentStats, unlockedAchievements),

      // Generate share text
      generateShareText: (unlockedAchievements, currentStats) =>
        generateShareText(unlockedAchievements, currentStats),

      // Get categories
      getCategories: () => getCategories(),

      // Get rarities
      getRarities: () => getRarities(),

      // Get total achievement count
      getTotalCount: () => getAllAchievementKeys().length
    };
  }

  return { createAchievementShowcaseModule };
})();

const SnakeAchievementShowcase = window.SnakeAchievementShowcase;
export { SnakeAchievementShowcase };
