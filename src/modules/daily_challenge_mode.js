window.SnakeDailyChallengeMode = (() => {
  // 特殊挑战规则
  const CHALLENGE_RULES = [
    {
      id: 'reverse-control',
      name: '反向控制',
      description: '所有控制方向相反！',
      modifier: {
        reverseControls: true
      },
      difficulty: 'hard',
      reward: 50
    },
    {
      id: 'speed-demon',
      name: '极速模式',
      description: '速度提升50%，反应时间更短！',
      modifier: {
        speedMultiplier: 1.5
      },
      difficulty: 'hard',
      reward: 40
    },
    {
      id: 'no-shield',
      name: '硬核挑战',
      description: '护盾果不会出现，一击必杀！',
      modifier: {
        noShield: true
      },
      difficulty: 'hell',
      reward: 60
    },
    {
      id: 'double-food',
      name: '双倍食物',
      description: '食物价值翻倍，但刷新速度更快！',
      modifier: {
        foodValue: 2,
        spawnRate: 0.7
      },
      difficulty: 'normal',
      reward: 30
    },
    {
      id: 'invisible-tail',
      name: '隐形蛇尾',
      description: '蛇尾隐形，只能看到头部！',
      modifier: {
        invisibleTail: true
      },
      difficulty: 'hard',
      reward: 45
    },
    {
      id: 'shrink-map',
      name: '缩圈',
      description: '游戏区域逐渐缩小！',
      modifier: {
        shrinkingMap: true,
        shrinkInterval: 10000
      },
      difficulty: 'hell',
      reward: 70
    },
    {
      id: 'teleport',
      name: '传送门',
      description: '地图中出现传送门，随机传送！',
      modifier: {
        teleporters: true,
        teleporterCount: 2
      },
      difficulty: 'hard',
      reward: 50
    },
    {
      id: 'mirror-mode',
      name: '镜像模式',
      description: '画面左右镜像！',
      modifier: {
        mirror: true
      },
      difficulty: 'hard',
      reward: 40
    }
  ];

  const dailyChallengeKey = 'snake-daily-challenge-mode-v1';
  const dailyChallengeHistoryKey = 'snake-daily-challenge-history-v1';

  function createDailyChallengeMode(storage) {
    let currentChallenge = null;
    let challengeStartTime = null;
    let challengeEndTime = null;
    let todayCompleted = false;

    // 生成每日挑战
    function generateDailyChallenge() {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      // 使用日期作为随机种子
      const seed = dateStr.split('-').join('');
      const rng = seededRandom(seed);

      // 随机选择2-3个规则组合
      const ruleCount = 2 + Math.floor(rng() * 2);
      const selectedRules = [];
      const availableRules = [...CHALLENGE_RULES];

      for (let i = 0; i < ruleCount && availableRules.length > 0; i++) {
        const index = Math.floor(rng() * availableRules.length);
        selectedRules.push(availableRules.splice(index, 1)[0]);
      }

      // 计算总奖励
      const totalReward = selectedRules.reduce((sum, rule) => sum + rule.reward, 0);

      // 确定难度
      const hasHell = selectedRules.some(r => r.difficulty === 'hell');
      const hasHard = selectedRules.some(r => r.difficulty === 'hard');
      const difficulty = hasHell ? 'hell' : (hasHard ? 'hard' : 'normal');

      return {
        date: dateStr,
        rules: selectedRules,
        difficulty: difficulty,
        reward: totalReward,
        timeLimit: 120, // 2分钟时间限制
        maxScore: 0
      };
    }

    // 种子随机数生成器
    function seededRandom(seed) {
      let value = seed;
      return function() {
        value = (value * 9301 + 49297) % 233280;
        return value / 233280;
      };
    }

    // 加载或生成今日挑战
    function loadDailyChallenge() {
      const saved = storage.readJson(dailyChallengeKey, null);
      const today = new Date().toISOString().split('T')[0];

      if (saved && saved.date === today) {
        currentChallenge = saved;
      } else {
        currentChallenge = generateDailyChallenge();
        saveDailyChallenge();
      }

      // 检查今日是否已完成
      const history = getChallengeHistory();
      todayCompleted = history.some(h => h.date === today && h.completed);

      return currentChallenge;
    }

    function saveDailyChallenge() {
      if (currentChallenge) {
        storage.writeJson(dailyChallengeKey, currentChallenge);
      }
    }

    // 开始挑战
    function startChallenge() {
      if (!currentChallenge) {
        loadDailyChallenge();
      }

      if (todayCompleted) {
        return { success: false, message: '今日挑战已完成，请明日再来！' };
      }

      challengeStartTime = Date.now();
      challengeEndTime = challengeStartTime + (currentChallenge.timeLimit * 1000);

      return {
        success: true,
        challenge: currentChallenge,
        endTime: challengeEndTime
      };
    }

    // 完成挑战
    function completeChallenge(score, survived) {
      if (!currentChallenge || !challengeStartTime) {
        return { success: false, message: '挑战未开始' };
      }

      const now = Date.now();
      const completed = survived && now <= challengeEndTime;
      const bonusReward = completed ? Math.floor(score / 100) : 0;
      const totalReward = completed ? currentChallenge.reward + bonusReward : 0;

      const record = {
        date: currentChallenge.date,
        score: score,
        completed: completed,
        survived: survived,
        reward: totalReward,
        rules: currentChallenge.rules.map(r => r.id),
        timestamp: now
      };

      // 保存到历史
      const history = getChallengeHistory();
      history.unshift(record);
      if (history.length > 30) history.pop();
      storage.writeJson(dailyChallengeHistoryKey, history);

      todayCompleted = completed;

      // 更新最高分
      if (score > currentChallenge.maxScore) {
        currentChallenge.maxScore = score;
        saveDailyChallenge();
      }

      return {
        success: true,
        completed: completed,
        reward: totalReward,
        score: score
      };
    }

    // 获取挑战历史
    function getChallengeHistory() {
      return storage.readJson(dailyChallengeHistoryKey, []);
    }

    // 获取今日挑战信息
    function getTodayChallenge() {
      if (!currentChallenge) {
        loadDailyChallenge();
      }
      return {
        ...currentChallenge,
        completed: todayCompleted
      };
    }

    // 获取剩余时间
    function getRemainingTime() {
      if (!challengeEndTime) return 0;
      return Math.max(0, challengeEndTime - Date.now());
    }

    // 应用挑战修饰符到游戏
    function applyModifiers(gameState) {
      if (!currentChallenge) return gameState;

      let modified = { ...gameState };

      for (const rule of currentChallenge.rules) {
        const mod = rule.modifier;

        if (mod.reverseControls) {
          modified.reverseControls = true;
        }

        if (mod.speedMultiplier) {
          modified.speedMultiplier = mod.speedMultiplier;
        }

        if (mod.noShield) {
          modified.noShield = true;
        }

        if (mod.foodValue) {
          modified.foodValue = mod.foodValue;
        }

        if (mod.spawnRate) {
          modified.spawnRate = mod.spawnRate;
        }

        if (mod.invisibleTail) {
          modified.invisibleTail = true;
        }

        if (mod.shrinkingMap) {
          modified.shrinkingMap = true;
          modified.shrinkInterval = mod.shrinkInterval;
        }

        if (mod.teleporters) {
          modified.teleporters = true;
          modified.teleporterCount = mod.teleporterCount;
        }

        if (mod.mirror) {
          modified.mirror = true;
        }
      }

      return modified;
    }

    // 检查是否完成挑战条件
    function checkChallengeCondition(gameState) {
      if (!currentChallenge) return { met: false };

      // 基础条件：存活到时间结束
      const timeRemaining = getRemainingTime();
      if (timeRemaining <= 0 && gameState.alive) {
        return { met: true, reason: 'time_survived' };
      }

      return { met: false };
    }

    // 获取排行榜
    function getLeaderboard() {
      const history = getChallengeHistory();
      const today = new Date().toISOString().split('T')[0];

      // 今日排名
      const todayScores = history
        .filter(h => h.date === today)
        .sort((a, b) => b.score - a.score);

      // 历史最佳
      const allTimeBest = history
        .reduce((best, h) => h.score > best.score ? h : best, { score: 0 });

      return {
        today: todayScores,
        allTimeBest: allTimeBest,
        totalCompleted: history.filter(h => h.completed).length
      };
    }

    return {
      loadDailyChallenge,
      startChallenge,
      completeChallenge,
      getChallengeHistory,
      getTodayChallenge,
      getRemainingTime,
      applyModifiers,
      checkChallengeCondition,
      getLeaderboard,
      CHALLENGE_RULES
    };
  }

  return { createDailyChallengeMode };
})();
