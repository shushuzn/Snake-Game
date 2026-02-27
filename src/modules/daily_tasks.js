/**
 * Daily Tasks System
 * 每日任务系统
 *
 * Features:
 * - 3 random tasks per day
 * - Task types: eat food, reach score, achieve combo, survive time, play mode
 * - Rewards: experience, rogue perks
 * - Auto refresh at midnight
 */

window.SnakeDailyTasks = (() => {
  const STORAGE_KEY = 'snake-daily-tasks';

  // Task types and their generators
  const TASK_TYPES = {
    eatFood: {
      name: '食物收集',
      description: '吃 {target} 个食物',
      generateTarget: () => Math.floor(Math.random() * 10) + 5, // 5-14
      rewardExp: 20,
      rewardPerks: 0
    },
    reachScore: {
      name: '分数挑战',
      description: '单局达到 {target} 分',
      generateTarget: () => Math.floor(Math.random() * 3) * 50 + 100, // 100, 150, 200
      rewardExp: 30,
      rewardPerks: 0
    },
    achieveCombo: {
      name: '连击大师',
      description: '达到 {target} 连击',
      generateTarget: () => Math.floor(Math.random() * 5) * 2 + 3, // 3, 5, 7, 9, 11
      rewardExp: 25,
      rewardPerks: 0
    },
    surviveTime: {
      name: '生存挑战',
      description: '单局存活 {target} 秒',
      generateTarget: () => Math.floor(Math.random() * 6) * 10 + 30, // 30, 40, 50, 60, 70, 80
      rewardExp: 25,
      rewardPerks: 0
    },
    playMode: {
      name: '模式挑战',
      description: '玩一局 {target} 模式',
      generateTarget: () => {
        const modes = ['经典', '限时', '冲刺', '无尽', '肉鸽'];
        return modes[Math.floor(Math.random() * modes.length)];
      },
      rewardExp: 15,
      rewardPerks: 0
    }
  };

  function getTodaySeed() {
    const now = new Date();
    const utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    return Math.floor(utc.getTime() / (24 * 60 * 60 * 1000));
  }

  function loadData(storage) {
    const raw = storage.readJson(STORAGE_KEY, null);
    if (!raw) {
      return {
        dateSeed: null,
        tasks: [],
        completedTasks: []
      };
    }
    return raw;
  }

  function saveData(storage, data) {
    storage.writeJson(STORAGE_KEY, data);
  }

  function generateDailyTasks() {
    const taskTypes = Object.keys(TASK_TYPES);
    const selectedTypes = [];
    const tasks = [];

    // Select 3 random task types
    while (selectedTypes.length < 3) {
      const type = taskTypes[Math.floor(Math.random() * taskTypes.length)];
      if (!selectedTypes.includes(type)) {
        selectedTypes.push(type);
      }
    }

    // Generate tasks
    for (const type of selectedTypes) {
      const config = TASK_TYPES[type];
      const target = config.generateTarget();
      tasks.push({
        id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: type,
        name: config.name,
        description: config.description.replace('{target}', target),
        target: target,
        progress: 0,
        completed: false,
        rewardExp: config.rewardExp,
        rewardPerks: config.rewardPerks
      });
    }

    return tasks;
  }

  function ensureDailyTasks(storage) {
    const data = loadData(storage);
    const today = getTodaySeed();

    // Check if we need to generate new tasks
    if (data.dateSeed !== today) {
      data.dateSeed = today;
      data.tasks = generateDailyTasks();
      data.completedTasks = [];
      saveData(storage, data);
    }

    return data;
  }

  function getTasks(storage) {
    const data = ensureDailyTasks(storage);
    return data.tasks;
  }

  function getCompletedTasks(storage) {
    const data = ensureDailyTasks(storage);
    return data.completedTasks;
  }

  function updateTaskProgress(storage, taskId, progress) {
    const data = loadData(storage);
    const task = data.tasks.find(t => t.id === taskId);

    if (!task || task.completed) return null;

    task.progress = Math.min(progress, task.target);

    // Check if task is completed
    if (task.progress >= task.target && !task.completed) {
      task.completed = true;
      data.completedTasks.push(taskId);
      saveData(storage, data);

      return {
        completed: true,
        task: task,
        rewards: {
          exp: task.rewardExp,
          perks: task.rewardPerks
        }
      };
    }

    saveData(storage, data);
    return { completed: false, task: task };
  }

  function updateTaskProgressByType(storage, type, progress) {
    const data = loadData(storage);
    const task = data.tasks.find(t => t.type === type && !t.completed);

    if (!task) return null;

    return updateTaskProgress(storage, task.id, progress);
  }

  function claimTaskReward(storage, taskId) {
    const data = loadData(storage);
    const task = data.tasks.find(t => t.id === taskId);

    if (!task || !task.completed || task.rewardClaimed) {
      return { success: false, message: '任务未完成或已领取奖励' };
    }

    task.rewardClaimed = true;
    saveData(storage, data);

    return {
      success: true,
      rewards: {
        exp: task.rewardExp,
        perks: task.rewardPerks
      },
      message: `获得 ${task.rewardExp} 经验值`
    };
  }

  function getTaskProgress(storage, taskId) {
    const data = loadData(storage);
    const task = data.tasks.find(t => t.id === taskId);
    return task ? { progress: task.progress, target: task.target, completed: task.completed } : null;
  }

  function resetDailyTasks(storage) {
    const data = {
      dateSeed: getTodaySeed(),
      tasks: generateDailyTasks(),
      completedTasks: []
    };
    saveData(storage, data);
    return data.tasks;
  }

  function createDailyTasksModule({ storage }) {
    return {
      getTasks: () => getTasks(storage),
      getCompletedTasks: () => getCompletedTasks(storage),
      updateTaskProgress: (taskId, progress) => updateTaskProgress(storage, taskId, progress),
      updateTaskProgressByType: (type, progress) => updateTaskProgressByType(storage, type, progress),
      claimTaskReward: (taskId) => claimTaskReward(storage, taskId),
      getTaskProgress: (taskId) => getTaskProgress(storage, taskId),
      resetDailyTasks: () => resetDailyTasks(storage),
      getTodaySeed: () => getTodaySeed(),
      TASK_TYPES: Object.keys(TASK_TYPES)
    };
  }

  return { createDailyTasksModule };
})();