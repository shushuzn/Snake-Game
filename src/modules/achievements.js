/**
 * Achievements Module - Snake Game v1.4.0
 * 
 * 成就系统模块，管理所有游戏成就的解锁、追踪和展示
 * 
 * 成就分类:
 * - 基础: 分数、连击、限时模式
 * - 扩展: 高分、连击大师、游戏场次
 * - 日常: 签到、任务
 * - AI对战: 击败AI、连胜
 * - 多人对战: 对战胜利
 * - 收集: 皮肤收集
 * - 挑战: 每日挑战
 * - 社交: 好友、挑战
 * - 极限: 无尽模式、特殊挑战
 */

window.SnakeAchievements = (() => {
  // 成就定义
  const ACHIEVEMENT_DEFINITIONS = {
    // 基础成就 (v1.0.0)
    score200: {
      id: 'score200',
      name: '高分达人',
      description: '单局达到 200 分',
      category: 'basic',
      icon: '🏆',
      points: 10
    },
    combo5: {
      id: 'combo5',
      name: '连击高手',
      description: '连击达到 x5',
      category: 'basic',
      icon: '⚡',
      points: 10
    },
    timedClear: {
      id: 'timedClear',
      name: '限时挑战者',
      description: '限时模式达到 120 分',
      category: 'basic',
      icon: '⏱️',
      points: 15
    },
    // 扩展成就 (v1.1.0)
    score500: {
      id: 'score500',
      name: '高分大师',
      description: '单局达到 500 分',
      category: 'extended',
      icon: '🏆',
      points: 20
    },
    score1000: {
      id: 'score1000',
      name: '超级高分',
      description: '单局达到 1000 分',
      category: 'extended',
      icon: '👑',
      points: 50
    },
    combo10: {
      id: 'combo10',
      name: '连击大师',
      description: '连击达到 x10',
      category: 'extended',
      icon: '⚡⚡',
      points: 25
    },
    games10: {
      id: 'games10',
      name: '资深玩家',
      description: '累计游玩 10 局',
      category: 'extended',
      icon: '🎮',
      points: 10
    },
    games50: {
      id: 'games50',
      name: '老玩家',
      description: '累计游玩 50 局',
      category: 'extended',
      icon: '🎮🎮',
      points: 30
    },
    // 日常成就 (v1.2.0)
    dailyStreak7: {
      id: 'dailyStreak7',
      name: '签到达人',
      description: '连续签到 7 天',
      category: 'daily',
      icon: '📅',
      points: 20
    },
    dailyStreak30: {
      id: 'dailyStreak30',
      name: '签到大师',
      description: '连续签到 30 天',
      category: 'daily',
      icon: '📆',
      points: 100
    },
    firstTask: {
      id: 'firstTask',
      name: '任务新手',
      description: '完成首个每日任务',
      category: 'daily',
      icon: '📝',
      points: 10
    },
    allTasks: {
      id: 'allTasks',
      name: '任务大师',
      description: '单日完成所有每日任务',
      category: 'daily',
      icon: '✅',
      points: 25
    },
    // AI对战成就 (v1.4.0)
    aiWinEasy: {
      id: 'aiWinEasy',
      name: 'AI初学者',
      description: '击败简单难度AI',
      category: 'ai_battle',
      icon: '🤖',
      points: 10
    },
    aiWinNormal: {
      id: 'aiWinNormal',
      name: 'AI挑战者',
      description: '击败普通难度AI',
      category: 'ai_battle',
      icon: '🤖🤖',
      points: 20
    },
    aiWinHard: {
      id: 'aiWinHard',
      name: 'AI征服者',
      description: '击败困难难度AI',
      category: 'ai_battle',
      icon: '🤖🤖🤖',
      points: 40
    },
    aiWinHell: {
      id: 'aiWinHell',
      name: 'AI终结者',
      description: '击败地狱难度AI',
      category: 'ai_battle',
      icon: '🔥',
      points: 100
    },
    aiWinStreak3: {
      id: 'aiWinStreak3',
      name: '连胜新星',
      description: 'AI对战连胜 3 场',
      category: 'ai_battle',
      icon: '🔥',
      points: 30
    },
    aiWinStreak5: {
      id: 'aiWinStreak5',
      name: '连胜王者',
      description: 'AI对战连胜 5 场',
      category: 'ai_battle',
      icon: '👑',
      points: 60
    },
    // 多人对战成就 (v1.4.0)
    multiplayerWin: {
      id: 'multiplayerWin',
      name: '多人首战',
      description: '赢得首场多人对战',
      category: 'multiplayer',
      icon: '👥',
      points: 15
    },
    multiplayerWin3: {
      id: 'multiplayerWin3',
      name: '多人高手',
      description: '累计赢得 3 场多人对战',
      category: 'multiplayer',
      icon: '👥👥',
      points: 35
    },
    multiplayerWin10: {
      id: 'multiplayerWin10',
      name: '多人王者',
      description: '累计赢得 10 场多人对战',
      category: 'multiplayer',
      icon: '🏆',
      points: 80
    },
    // 收集类成就 (v1.4.0)
    collector5: {
      id: 'collector5',
      name: '收藏家',
      description: '收集 5 个皮肤',
      category: 'collection',
      icon: '🎨',
      points: 20
    },
    collector10: {
      id: 'collector10',
      name: '大收藏家',
      description: '收集 10 个皮肤',
      category: 'collection',
      icon: '🎨🎨',
      points: 50
    },
    collectorAll: {
      id: 'collectorAll',
      name: '完美收藏家',
      description: '收集所有皮肤',
      category: 'collection',
      icon: '💎',
      points: 150
    },
    // 挑战类成就 (v1.4.0)
    dailyChallengeWin: {
      id: 'dailyChallengeWin',
      name: '挑战者',
      description: '完成每日限时挑战',
      category: 'challenge',
      icon: '🎯',
      points: 25
    },
    dailyChallengeStreak3: {
      id: 'dailyChallengeStreak3',
      name: '挑战坚持者',
      description: '连续 3 天完成每日挑战',
      category: 'challenge',
      icon: '📈',
      points: 50
    },
    dailyChallengeStreak7: {
      id: 'dailyChallengeStreak7',
      name: '挑战大师',
      description: '连续 7 天完成每日挑战',
      category: 'challenge',
      icon: '📊',
      points: 100
    },
    // 社交类成就 (v1.4.0)
    firstFriend: {
      id: 'firstFriend',
      name: '社交新手',
      description: '添加第一个好友',
      category: 'social',
      icon: '🤝',
      points: 10
    },
    challengeWin: {
      id: 'challengeWin',
      name: '挑战赢家',
      description: '赢得好友挑战',
      category: 'social',
      icon: '🏅',
      points: 20
    },
    challengeWin3: {
      id: 'challengeWin3',
      name: '挑战专家',
      description: '累计赢得 3 次好友挑战',
      category: 'social',
      icon: '🥉',
      points: 40
    },
    challengeWin10: {
      id: 'challengeWin10',
      name: '挑战王者',
      description: '累计赢得 10 次好友挑战',
      category: 'social',
      icon: '🥇',
      points: 100
    },
    // 极限挑战成就 (v1.4.0)
    endlessLevel10: {
      id: 'endlessLevel10',
      name: '无尽探索者',
      description: '无尽模式达到第 10 关',
      category: 'extreme',
      icon: '🔷',
      points: 30
    },
    endlessLevel20: {
      id: 'endlessLevel20',
      name: '无尽征服者',
      description: '无尽模式达到第 20 关',
      category: 'extreme',
      icon: '🔶',
      points: 60
    },
    endlessLevel50: {
      id: 'endlessLevel50',
      name: '无尽传说',
      description: '无尽模式达到第 50 关',
      category: 'extreme',
      icon: '🌟',
      points: 150
    },
    noDeathWin: {
      id: 'noDeathWin',
      name: '完美通关',
      description: '无尽模式无伤通关',
      category: 'extreme',
      icon: '💎',
      points: 100
    },
    speedDemon: {
      id: 'speedDemon',
      name: '速度恶魔',
      description: '在 60 秒内达到 300 分',
      category: 'extreme',
      icon: '⚡',
      points: 50
    },
    perfectionist: {
      id: 'perfectionist',
      name: '完美主义者',
      description: '单局无失误达到 500 分',
      category: 'extreme',
      icon: '✨',
      points: 80
    }
  };

  // 成就分类
  const CATEGORIES = {
    basic: { name: '基础', icon: '🎯', color: '#4CAF50' },
    extended: { name: '进阶', icon: '⭐', color: '#2196F3' },
    daily: { name: '日常', icon: '📅', color: '#FF9800' },
    ai_battle: { name: 'AI对战', icon: '🤖', color: '#9C27B0' },
    multiplayer: { name: '多人对战', icon: '👥', color: '#E91E63' },
    collection: { name: '收集', icon: '🎨', color: '#00BCD4' },
    challenge: { name: '挑战', icon: '🏆', color: '#FF5722' },
    social: { name: '社交', icon: '🤝', color: '#795548' },
    extreme: { name: '极限', icon: '🔥', color: '#F44336' }
  };

  // 称号系统
  const TITLES = [
    { id: 'novice', name: '新手', minPoints: 0, icon: '🌱' },
    { id: 'apprentice', name: '学徒', minPoints: 100, icon: '🌿' },
    { id: 'adept', name: '熟手', minPoints: 300, icon: '🍃' },
    { id: 'expert', name: '专家', minPoints: 600, icon: '🌲' },
    { id: 'master', name: '大师', minPoints: 1000, icon: '⭐' },
    { id: 'legend', name: '传说', minPoints: 1500, icon: '👑' },
    { id: 'mythic', name: '神话', minPoints: 2000, icon: '🌟' }
  ];

  function createAchievementsModule({ storage, storageKey, onUnlock }) {
    let unlockedAchievements = {};
    let achievementStats = {
      aiWinStreak: 0,
      aiBestStreak: 0,
      multiplayerWins: 0,
      challengeStreak: 0,
      challengeBestStreak: 0,
      friendChallengeWins: 0
    };

    // 加载成就数据
    function load() {
      const data = storage.readJson(storageKey, {});
      unlockedAchievements = data.unlocked || {};
      achievementStats = { ...achievementStats, ...(data.stats || {}) };
    }

    // 保存成就数据
    function save() {
      storage.writeJson(storageKey, {
        unlocked: unlockedAchievements,
        stats: achievementStats
      });
    }

    // 检查成就是否已解锁
    function isUnlocked(achievementId) {
      return Boolean(unlockedAchievements[achievementId]);
    }

    // 解锁成就
    function unlock(achievementId) {
      if (isUnlocked(achievementId)) return false;
      
      const def = ACHIEVEMENT_DEFINITIONS[achievementId];
      if (!def) return false;

      unlockedAchievements[achievementId] = {
        unlockedAt: Date.now(),
        ...def
      };
      
      save();
      
      if (onUnlock) {
        onUnlock({
          id: achievementId,
          name: def.name,
          description: def.description,
          icon: def.icon,
          points: def.points
        });
      }
      
      return true;
    }

    // 批量解锁成就
    function unlockMany(achievementIds) {
      const newlyUnlocked = [];
      for (const id of achievementIds) {
        if (unlock(id)) {
          newlyUnlocked.push(id);
        }
      }
      return newlyUnlocked;
    }

    // 获取所有成就定义
    function getAllDefinitions() {
      return { ...ACHIEVEMENT_DEFINITIONS };
    }

    // 获取已解锁成就
    function getUnlocked() {
      return { ...unlockedAchievements };
    }

    // 获取分类统计
    function getCategoryStats() {
      const stats = {};
      for (const [catKey, catDef] of Object.entries(CATEGORIES)) {
        const achievementsInCat = Object.values(ACHIEVEMENT_DEFINITIONS)
          .filter(a => a.category === catKey);
        const unlockedInCat = achievementsInCat
          .filter(a => isUnlocked(a.id));
        
        stats[catKey] = {
          name: catDef.name,
          icon: catDef.icon,
          color: catDef.color,
          total: achievementsInCat.length,
          unlocked: unlockedInCat.length,
          progress: achievementsInCat.length > 0 
            ? Math.round((unlockedInCat.length / achievementsInCat.length) * 100)
            : 0
        };
      }
      return stats;
    }

    // 获取总积分
    function getTotalPoints() {
      return Object.values(unlockedAchievements)
        .reduce((sum, a) => sum + (a.points || 0), 0);
    }

    // 获取当前称号
    function getCurrentTitle() {
      const points = getTotalPoints();
      for (let i = TITLES.length - 1; i >= 0; i--) {
        if (points >= TITLES[i].minPoints) {
          return TITLES[i];
        }
      }
      return TITLES[0];
    }

    // 获取下一个称号
    function getNextTitle() {
      const points = getTotalPoints();
      for (const title of TITLES) {
        if (points < title.minPoints) {
          return title;
        }
      }
      return null;
    }

    // 获取称号进度
    function getTitleProgress() {
      const current = getCurrentTitle();
      const next = getNextTitle();
      const points = getTotalPoints();
      
      if (!next) {
        return { current, next: null, progress: 100 };
      }
      
      const progress = Math.min(100, Math.round(
        ((points - current.minPoints) / (next.minPoints - current.minPoints)) * 100
      ));
      
      return { current, next, progress, pointsNeeded: next.minPoints - points };
    }

    // 更新统计数据
    function updateStats(key, value) {
      if (achievementStats[key] !== undefined) {
        achievementStats[key] = value;
        save();
      }
    }

    function incrementStat(key, delta = 1) {
      if (achievementStats[key] !== undefined) {
        achievementStats[key] += delta;
        save();
      }
    }

    function getStats() {
      return { ...achievementStats };
    }

    // 检查AI对战成就
    function checkAIWinAchievements(difficulty) {
      const toUnlock = [];
      
      // 难度成就
      if (difficulty === 'easy') toUnlock.push('aiWinEasy');
      if (difficulty === 'normal') toUnlock.push('aiWinNormal');
      if (difficulty === 'hard') toUnlock.push('aiWinHard');
      if (difficulty === 'hell') toUnlock.push('aiWinHell');
      
      // 连胜统计
      achievementStats.aiWinStreak++;
      if (achievementStats.aiWinStreak > achievementStats.aiBestStreak) {
        achievementStats.aiBestStreak = achievementStats.aiWinStreak;
      }
      
      // 连胜成就
      if (achievementStats.aiWinStreak >= 3) toUnlock.push('aiWinStreak3');
      if (achievementStats.aiWinStreak >= 5) toUnlock.push('aiWinStreak5');
      
      save();
      return unlockMany(toUnlock);
    }

    // 检查AI对战失败（重置连胜）
    function onAILose() {
      achievementStats.aiWinStreak = 0;
      save();
    }

    // 检查多人对战成就
    function checkMultiplayerWinAchievements() {
      achievementStats.multiplayerWins++;
      save();
      
      const toUnlock = [];
      if (achievementStats.multiplayerWins >= 1) toUnlock.push('multiplayerWin');
      if (achievementStats.multiplayerWins >= 3) toUnlock.push('multiplayerWin3');
      if (achievementStats.multiplayerWins >= 10) toUnlock.push('multiplayerWin10');
      
      return unlockMany(toUnlock);
    }

    // 检查收集成就
    function checkCollectionAchievements(ownedSkinsCount, totalSkinsCount) {
      const toUnlock = [];
      if (ownedSkinsCount >= 5) toUnlock.push('collector5');
      if (ownedSkinsCount >= 10) toUnlock.push('collector10');
      if (ownedSkinsCount >= totalSkinsCount) toUnlock.push('collectorAll');
      
      return unlockMany(toUnlock);
    }

    // 检查每日挑战成就
    function checkDailyChallengeAchievements(completed) {
      if (!completed) {
        achievementStats.challengeStreak = 0;
        save();
        return [];
      }
      
      const toUnlock = ['dailyChallengeWin'];
      achievementStats.challengeStreak++;
      
      if (achievementStats.challengeStreak > achievementStats.challengeBestStreak) {
        achievementStats.challengeBestStreak = achievementStats.challengeStreak;
      }
      
      if (achievementStats.challengeStreak >= 3) toUnlock.push('dailyChallengeStreak3');
      if (achievementStats.challengeStreak >= 7) toUnlock.push('dailyChallengeStreak7');
      
      save();
      return unlockMany(toUnlock);
    }

    // 检查社交成就
    function checkSocialAchievements(friendsCount, friendChallengeWins) {
      const toUnlock = [];
      
      if (friendsCount >= 1) toUnlock.push('firstFriend');
      
      if (friendChallengeWins !== undefined) {
        achievementStats.friendChallengeWins = friendChallengeWins;
        save();
      }
      
      if (achievementStats.friendChallengeWins >= 1) toUnlock.push('challengeWin');
      if (achievementStats.friendChallengeWins >= 3) toUnlock.push('challengeWin3');
      if (achievementStats.friendChallengeWins >= 10) toUnlock.push('challengeWin10');
      
      return unlockMany(toUnlock);
    }

    // 重置所有成就
    function reset() {
      unlockedAchievements = {};
      achievementStats = {
        aiWinStreak: 0,
        aiBestStreak: 0,
        multiplayerWins: 0,
        challengeStreak: 0,
        challengeBestStreak: 0,
        friendChallengeWins: 0
      };
      save();
    }

    // 导出成就数据
    function exportData() {
      return {
        unlocked: unlockedAchievements,
        stats: achievementStats,
        totalPoints: getTotalPoints(),
        currentTitle: getCurrentTitle()
      };
    }

    // 导入成就数据
    function importData(data) {
      if (data.unlocked) unlockedAchievements = data.unlocked;
      if (data.stats) achievementStats = { ...achievementStats, ...data.stats };
      save();
    }

    // 初始化
    load();

    return {
      // 核心功能
      unlock,
      unlockMany,
      isUnlocked,
      
      // 查询
      getAllDefinitions,
      getUnlocked,
      getCategoryStats,
      getTotalPoints,
      getCurrentTitle,
      getNextTitle,
      getTitleProgress,
      
      // 统计
      getStats,
      updateStats,
      incrementStat,
      
      // 成就检查
      checkAIWinAchievements,
      onAILose,
      checkMultiplayerWinAchievements,
      checkCollectionAchievements,
      checkDailyChallengeAchievements,
      checkSocialAchievements,
      
      // 数据管理
      load,
      save,
      reset,
      exportData,
      importData,
      
      // 常量
      ACHIEVEMENT_DEFINITIONS,
      CATEGORIES,
      TITLES
    };
  }

  return { createAchievementsModule, ACHIEVEMENT_DEFINITIONS, CATEGORIES, TITLES };
})();