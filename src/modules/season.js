window.SnakeSeason = (() => {
  // Season task types
  const SEASON_TASK_TYPES = {
    playGames: {
      name: '赛季游戏',
      description: '本赛季游戏 {target} 局',
      generateTarget: () => Math.floor(Math.random() * 5) * 2 + 8, // 8, 10, 12, 14, 16
      rewardExp: 50
    },
    reachScore: {
      name: '赛季高分',
      description: '单局达到 {target} 分',
      generateTarget: () => Math.floor(Math.random() * 5) * 100 + 200, // 200, 300, 400, 500, 600
      rewardExp: 60
    },
    achieveCombo: {
      name: '赛季连击',
      description: '达到 {target} 连击',
      generateTarget: () => Math.floor(Math.random() * 4) * 2 + 5, // 5, 7, 9, 11
      rewardExp: 55
    },
    eatFood: {
      name: '赛季进食',
      description: '总共吃 {target} 个食物',
      generateTarget: () => Math.floor(Math.random() * 30) * 10 + 50, // 50, 60, 70, 80, 90, 100...
      rewardExp: 40
    },
    playMode: {
      name: '模式体验',
      description: '体验 {target} 模式',
      generateTarget: () => {
        const modes = ['街机', '限时', '闪电', '无尽', '肉山', 'AI对战'];
        return modes[Math.floor(Math.random() * modes.length)];
      },
      rewardExp: 35
    }
  };

  function pad2(v) {
    return String(v).padStart(2, '0');
  }

  function getSeasonId(date = new Date()) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
  }

  function getSeasonLabel(seasonId) {
    const [y, m] = String(seasonId || '').split('-');
    if (!y || !m) return '--';
    return `${y} 年 ${m} 月赛季`;
  }

  function getSeasonRemaining(date = new Date()) {
    const next = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
    const diffMs = Math.max(0, next.getTime() - date.getTime());
    const totalHours = Math.floor(diffMs / 3600000);
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return `${days} 天 ${hours} 小时`;
  }

  function getSeasonProgress(date = new Date()) {
    const currentMonth = date.getMonth(); // 0-11
    const currentDay = date.getDate();
    const daysInMonth = new Date(date.getFullYear(), currentMonth + 1, 0).getDate();

    // Calculate progress: (days passed) / (total days in month)
    const daysPassed = currentDay - 1;
    const progressPercent = Math.min(100, Math.max(0, (daysPassed / daysInMonth) * 100));

    return {
      month: currentMonth + 1,
      totalMonths: 12,
      daysPassed: daysPassed + 1,
      daysInMonth: daysInMonth,
      percent: progressPercent,
      text: `第 ${currentMonth + 1}/12 月 · 本月 ${daysPassed + 1}/${daysInMonth} 天 (${Math.round(progressPercent)}%)`
    };
  }

  function normalizeHistory(history) {
    const list = Array.isArray(history) ? history : [];
    return list
      .map(item => ({
        seasonId: String(item?.seasonId || ''),
        score: Number(item?.score || 0),
        mode: String(item?.mode || 'classic'),
        ts: Number(item?.ts || 0)
      }))
      .filter(item => item.seasonId && item.score > 0)
      .sort((a, b) => (b.seasonId.localeCompare(a.seasonId)))
      .slice(0, 6);
  }

  function generateSeasonTasks(seasonId) {
    const taskTypes = Object.keys(SEASON_TASK_TYPES);
    const tasks = [];
    const usedTypes = new Set();

    // Select 3 random task types
    while (tasks.length < 3 && usedTypes.size < taskTypes.length) {
      const type = taskTypes[Math.floor(Math.random() * taskTypes.length)];
      if (usedTypes.has(type)) continue;
      usedTypes.add(type);

      const taskDef = SEASON_TASK_TYPES[type];
      const target = taskDef.generateTarget();

      tasks.push({
        id: `${seasonId}-${type}-${Date.now()}`,
        type,
        name: taskDef.name,
        description: taskDef.description.replace('{target}', target),
        target,
        progress: 0,
        completed: false,
        rewardExp: taskDef.rewardExp
      });
    }

    return tasks;
  }

  function createSeasonModule({ storage, key, elements, onPersist }) {
    let state = {
      currentSeasonId: '',
      currentBest: { score: 0, mode: 'classic', ts: 0 },
      history: [],
      tasks: [],
      stats: {
        totalGames: 0,
        totalFoods: 0,
        maxCombo: 0,
        modesPlayed: new Set()
      }
    };

    function archiveCurrentSeason() {
      if (!state.currentSeasonId || state.currentBest.score <= 0) return;
      state.history = normalizeHistory([
        {
          seasonId: state.currentSeasonId,
          score: state.currentBest.score,
          mode: state.currentBest.mode,
          ts: state.currentBest.ts
        },
        ...state.history
      ]);
    }

    function ensureSeason(now = new Date()) {
      const seasonId = getSeasonId(now);
      if (!state.currentSeasonId) {
        state.currentSeasonId = seasonId;
        state.tasks = generateSeasonTasks(seasonId);
        return;
      }
      if (state.currentSeasonId === seasonId) return;
      archiveCurrentSeason();
      state.currentSeasonId = seasonId;
      state.currentBest = { score: 0, mode: 'classic', ts: 0 };
      state.tasks = generateSeasonTasks(seasonId);
      state.stats = { totalGames: 0, totalFoods: 0, maxCombo: 0, modesPlayed: new Set() };
    }

    function save() {
      // Convert Set to Array for storage
      const toSave = {
        ...state,
        stats: {
          ...state.stats,
          modesPlayed: Array.from(state.stats.modesPlayed || new Set())
        }
      };
      storage.writeJson(key, toSave);
      onPersist();
    }

    function load() {
      const parsed = storage.readJson(key, {});
      const modesPlayed = Array.isArray(parsed.stats?.modesPlayed)
        ? new Set(parsed.stats.modesPlayed)
        : new Set();

      state = {
        currentSeasonId: String(parsed.currentSeasonId || ''),
        currentBest: {
          score: Number(parsed.currentBest?.score || 0),
          mode: String(parsed.currentBest?.mode || 'classic'),
          ts: Number(parsed.currentBest?.ts || 0)
        },
        history: normalizeHistory(parsed.history),
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        stats: {
          totalGames: Number(parsed.stats?.totalGames || 0),
          totalFoods: Number(parsed.stats?.totalFoods || 0),
          maxCombo: Number(parsed.stats?.maxCombo || 0),
          modesPlayed
        }
      };
      ensureSeason(new Date());
      save();
      render();
    }

    function updateTaskProgress(taskType, value, currentStats) {
      let updated = false;
      state.tasks.forEach(task => {
        if (task.completed || task.type !== taskType) return;

        let progress = 0;
        switch (taskType) {
          case 'playGames':
            progress = currentStats.totalGames;
            break;
          case 'reachScore':
            // Check if this is a new best score
            if (currentStats.score >= task.target) {
              progress = currentStats.score;
            }
            break;
          case 'achieveCombo':
            progress = Math.max(0, currentStats.maxCombo);
            break;
          case 'eatFood':
            progress = currentStats.totalFoods;
            break;
          case 'playMode':
            // Just mark as completed when any mode is played
            if (currentStats.modesPlayed?.has(task.target)) {
              task.progress = 1;
              task.completed = true;
              updated = true;
            }
            return;
        }

        if (progress > 0) {
          task.progress = Math.min(progress, task.target);
          if (task.progress >= task.target) {
            task.completed = true;
          }
          updated = true;
        }
      });
      return updated;
    }

    function recordRound(score, mode, combo, foodsEaten) {
      ensureSeason(new Date());

      // Update best score
      if (score > state.currentBest.score) {
        state.currentBest = { score, mode, ts: Date.now() };
      }

      // Update stats
      state.stats.totalGames++;
      state.stats.totalFoods += foodsEaten || 0;
      if (combo > state.stats.maxCombo) {
        state.stats.maxCombo = combo;
      }
      state.stats.modesPlayed.add(mode);

      // Update tasks
      const currentStats = {
        score,
        mode,
        combo,
        foodsEaten,
        totalGames: state.stats.totalGames,
        totalFoods: state.stats.totalFoods,
        maxCombo: state.stats.maxCombo,
        modesPlayed: state.stats.modesPlayed
      };

      updateTaskProgress('playGames', state.stats.totalGames, currentStats);
      updateTaskProgress('reachScore', score, currentStats);
      updateTaskProgress('achieveCombo', combo, currentStats);
      updateTaskProgress('eatFood', state.stats.totalFoods, currentStats);
      updateTaskProgress('playMode', mode, currentStats);

      save();
      render();
    }

    function render(now = new Date()) {
      elements.seasonIdEl.textContent = getSeasonLabel(state.currentSeasonId);
      elements.seasonRemainingEl.textContent = getSeasonRemaining(now);
      if (state.currentBest.score > 0) {
        elements.seasonBestEl.textContent = `${state.currentBest.score} 分（${state.currentBest.mode}）`;
      } else {
        elements.seasonBestEl.textContent = '--';
      }

      // Render season progress
      const progress = getSeasonProgress(now);
      if (elements.seasonProgressTextEl) {
        elements.seasonProgressTextEl.textContent = progress.text;
      }
      if (elements.seasonProgressFillEl) {
        elements.seasonProgressFillEl.style.width = `${progress.percent}%`;
      }

      // Render season tasks
      if (elements.seasonTasksEl) {
        if (state.tasks.length === 0) {
          elements.seasonTasksEl.innerHTML = '<li>暂无赛季任务</li>';
        } else {
          elements.seasonTasksEl.innerHTML = state.tasks.map(task => {
            const percent = task.target > 0 ? Math.min(100, Math.round((task.progress / task.target) * 100)) : 0;
            const status = task.completed ? '✓' : `${task.progress}/${task.target}`;
            return `<li class="${task.completed ? 'completed' : ''}">${task.name}：${task.description} [${status}] (+${task.rewardExp} EXP)</li>`;
          }).join('');
        }
      }

      if (!state.history.length) {
        elements.seasonHistoryListEl.innerHTML = '<li>暂无历史赛季记录</li>';
        return;
      }
      elements.seasonHistoryListEl.innerHTML = state.history
        .map(item => `<li>${getSeasonLabel(item.seasonId)}：${item.score} 分（${item.mode}）</li>`)
        .join('');
    }

    function clear() {
      state = {
        currentSeasonId: getSeasonId(new Date()),
        currentBest: { score: 0, mode: 'classic', ts: 0 },
        history: [],
        tasks: generateSeasonTasks(getSeasonId(new Date())),
        stats: { totalGames: 0, totalFoods: 0, maxCombo: 0, modesPlayed: new Set() }
      };
      save();
      render();
    }

    function refreshRemainingOnly() {
      elements.seasonRemainingEl.textContent = getSeasonRemaining(new Date());
    }

    function getCurrentBestScore() {
      return Number(state.currentBest.score || 0);
    }

    function getCurrentSeasonId() {
      return state.currentSeasonId;
    }

    function getTasks() {
      return state.tasks.map(t => ({ ...t }));
    }

    function getCompletedTasksCount() {
      return state.tasks.filter(t => t.completed).length;
    }

    return { load, recordRound, clear, refreshRemainingOnly, getCurrentBestScore, getCurrentSeasonId, getTasks, getCompletedTasksCount };
  }

  return { createSeasonModule };
})();
