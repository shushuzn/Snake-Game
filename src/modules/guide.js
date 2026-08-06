/**
 * 新手引导重构 - 分阶段任务式引导系统 v1.5.0
 *
 * 阶段1：基础操作 - 移动方向控制、食物吃取、长度概念
 * 阶段2：道具认知 - 减速道具、加速道具、穿墙道具的使用和效果
 * 阶段3：模式策略 - 介绍各游戏模式（经典/无尽/对战/每日挑战）
 *
 * 特性：
 * - 任务式教学：每个阶段有具体任务目标
 * - 奖励机制：完成引导任务后获得奖励
 * - 进度存储：localStorage key: 'snake-guide-v1'
 * - 可跳过引导：老玩家可关闭
 * - 引导箭头高亮可点击区域
 * - 进度指示器显示当前阶段
 */

window.SnakeGuide = (() => {
  // 引导阶段枚举
  const GUIDE_PHASES = {
    PHASE1_BASIC: 1,   // 基础操作
    PHASE2_ITEMS: 2,    // 道具认知
    PHASE3_MODES: 3,    // 模式策略
    COMPLETED: 4        // 全部完成
  };

  // 任务类型
  const TASK_TYPES = {
    EAT_FOOD: 'eat_food',         // 吃食物
    GROW_LENGTH: 'grow_length',    // 达到一定长度
    AVOID_DEATH: 'avoid_death',   // 避免死亡
    USE_ITEM: 'use_item',         // 使用道具
    PLAY_MODE: 'play_mode',       // 游玩特定模式
    REACH_SCORE: 'reach_score'    // 达到特定分数
  };

  // 阶段1任务配置：基础操作
  const PHASE1_TASKS = [
    {
      id: 'phase1_task1',
      type: TASK_TYPES.EAT_FOOD,
      target: 5,
      description: '吃掉5个食物',
      hint: '使用方向键或WASD控制蛇移动，吃掉地图上的食物',
      reward: { type: 'score_bonus', value: 100 }
    },
    {
      id: 'phase1_task2',
      type: TASK_TYPES.GROW_LENGTH,
      target: 6,
      description: '让蛇身长度达到6',
      hint: '每吃一个食物，蛇身就会增长一节',
      reward: { type: 'item', value: 'shield', count: 1 }
    },
    {
      id: 'phase1_task3',
      type: TASK_TYPES.AVOID_DEATH,
      target: 1,
      description: '成功存活1局（不撞墙/不自咬）',
      hint: '小心不要撞到墙壁或自己的身体',
      reward: { type: 'score_bonus', value: 200 }
    }
  ];

  // 阶段2任务配置：道具认知
  const PHASE2_TASKS = [
    {
      id: 'phase2_task1',
      type: TASK_TYPES.USE_ITEM,
      itemType: 'freeze',
      target: 1,
      description: '吃到冰冻果并生效1次',
      hint: '❄️ 冰冻果可以暂时减慢蛇的速度，方便走位',
      reward: { type: 'item', value: 'shield', count: 1 }
    },
    {
      id: 'phase2_task2',
      type: TASK_TYPES.USE_ITEM,
      itemType: 'boost',
      target: 1,
      description: '吃到加速果并生效1次',
      hint: '🚀 加速果可以提升移动速度，风险与机遇并存',
      reward: { type: 'score_bonus', value: 150 }
    },
    {
      id: 'phase2_task3',
      type: TASK_TYPES.USE_ITEM,
      itemType: 'phase',
      target: 1,
      description: '吃到穿墙果并穿墙1次',
      hint: '🌟 穿墙果可以短暂穿越障碍物和墙壁',
      reward: { type: 'item', value: 'shield', count: 2 }
    }
  ];

  // 阶段3任务配置：模式策略
  const PHASE3_TASKS = [
    {
      id: 'phase3_task1',
      type: TASK_TYPES.PLAY_MODE,
      mode: 'classic',
      target: 1,
      description: '完成1局经典模式',
      hint: '🎯 经典模式：无限时间，尽可能获得最高分',
      reward: { type: 'score_bonus', value: 200 }
    },
    {
      id: 'phase3_task2',
      type: TASK_TYPES.PLAY_MODE,
      mode: 'timed',
      target: 1,
      description: '完成1局限时模式',
      hint: '⏱️ 计时模式：在限定时间内冲刺最高分',
      reward: { type: 'score_bonus', value: 200 }
    },
    {
      id: 'phase3_task3',
      type: TASK_TYPES.PLAY_MODE,
      mode: 'endless',
      target: 1,
      description: '完成1局无尽模式',
      hint: '🌊 无尽模式：分数提升自动升级，挑战更高关卡',
      reward: { type: 'item', value: 'shield', count: 2 }
    }
  ];

  // 阶段信息配置
  const PHASE_CONFIG = {
    [GUIDE_PHASES.PHASE1_BASIC]: {
      name: '基础操作',
      icon: '🎮',
      tasks: PHASE1_TASKS,
      intro: '学习游戏基本操作：移动、吃食物、避免死亡'
    },
    [GUIDE_PHASES.PHASE2_ITEMS]: {
      name: '道具认知',
      icon: '🛡️',
      tasks: PHASE2_TASKS,
      intro: '认识各种道具的效果和使用时机'
    },
    [GUIDE_PHASES.PHASE3_MODES]: {
      name: '模式策略',
      icon: '🎯',
      tasks: PHASE3_TASKS,
      intro: '了解不同游戏模式的特点和策略'
    },
    [GUIDE_PHASES.COMPLETED]: {
      name: '已完成',
      icon: '🏆',
      tasks: [],
      intro: '恭喜你完成了所有新手引导！'
    }
  };

  // 箭头高亮目标配置
  const HIGHLIGHT_TARGETS = {
    restart: { selector: '#restart', text: '点击开始新游戏', direction: 'down' },
    pause: { selector: '#pause', text: '暂停游戏', direction: 'down' },
    mode: { selector: '#mode', text: '选择游戏模式', direction: 'up' },
    difficulty: { selector: '#difficulty', text: '选择难度', direction: 'up' },
    help: { selector: '#help', text: '查看帮助', direction: 'left' },
    tutorial: { selector: '#tutorial', text: '查看引导', direction: 'left' }
  };

  /**
   * 创建引导模块实例
   * @param {Object} options - 配置选项
   * @param {Object} options.storage - 存储模块实例
   * @param {string} options.key - localStorage键名
   * @returns {Object} 引导模块API
   */
  function createGuideModule({ storage, key }) {
    // 默认状态
    const DEFAULT_STATE = {
      currentPhase: GUIDE_PHASES.PHASE1_BASIC,
      completedPhases: [],
      skipped: false,
      tasks: {},
      totalRewards: { scoreBonus: 0, items: {} },
      showArrows: true,
      lastUpdated: Date.now()
    };

    let guideState = { ...DEFAULT_STATE };

    // 初始化任务进度
    function initTasks() {
      const tasks = {};
      Object.values(PHASE_CONFIG).forEach((phase) => {
        phase.tasks.forEach((task) => {
          tasks[task.id] = {
            progress: 0,
            completed: false,
            claimed: false
          };
        });
      });
      return tasks;
    }

    // 从localStorage加载状态
    function load() {
      try {
        const raw = storage.readJson(key, null);
        if (raw && typeof raw === 'object') {
          guideState = {
            currentPhase: Number(raw.currentPhase) || GUIDE_PHASES.PHASE1_BASIC,
            completedPhases: Array.isArray(raw.completedPhases) ? raw.completedPhases : [],
            skipped: Boolean(raw.skipped),
            tasks: raw.tasks || initTasks(),
            totalRewards: raw.totalRewards || { scoreBonus: 0, items: {} },
            showArrows: raw.showArrows !== undefined ? Boolean(raw.showArrows) : true,
            lastUpdated: Number(raw.lastUpdated) || Date.now()
          };
        } else {
          guideState.tasks = initTasks();
        }
      } catch {
        guideState.tasks = initTasks();
      }
    }

    // 保存状态到localStorage
    function save() {
      guideState.lastUpdated = Date.now();
      storage.writeJson(key, guideState);
    }

    // 获取当前阶段
    function getCurrentPhase() {
      return guideState.currentPhase;
    }

    // 获取阶段配置
    function getPhaseConfig(phase) {
      return PHASE_CONFIG[phase] || null;
    }

    // 获取当前阶段配置
    function getCurrentPhaseConfig() {
      return PHASE_CONFIG[guideState.currentPhase] || null;
    }

    // 获取当前阶段任务列表
    function getCurrentPhaseTasks() {
      const config = getCurrentPhaseConfig();
      if (!config) return [];
      return config.tasks.map((task) => ({
        ...task,
        progress: guideState.tasks[task.id]?.progress || 0,
        completed: guideState.tasks[task.id]?.completed || false,
        claimed: guideState.tasks[task.id]?.claimed || false
      }));
    }

    // 更新任务进度
    function updateTaskProgress(taskId, progress, completed) {
      if (!guideState.tasks[taskId]) return;
      guideState.tasks[taskId].progress = Math.max(guideState.tasks[taskId].progress, progress);
      if (completed && !guideState.tasks[taskId].completed) {
        guideState.tasks[taskId].completed = true;
        checkPhaseCompletion();
      }
      save();
    }

    // 增加任务进度
    function incrementTaskProgress(taskType, taskValue) {
      const currentTasks = getCurrentPhaseTasks();
      for (const task of currentTasks) {
        if (task.type === taskType && task.target === taskValue && !task.completed) {
          const newProgress = (guideState.tasks[task.id]?.progress || 0) + 1;
          updateTaskProgress(task.id, newProgress, newProgress >= task.target);
          return { taskId: task.id, progress: newProgress, target: task.target };
        }
      }
      return null;
    }

    // 检查阶段是否完成
    function checkPhaseCompletion() {
      const currentTasks = getCurrentPhaseTasks();
      const allCompleted = currentTasks.length > 0 && currentTasks.every((t) => t.completed);
      if (allCompleted && !guideState.completedPhases.includes(guideState.currentPhase)) {
        completePhase(guideState.currentPhase);
      }
    }

    // 完成当前阶段
    function completePhase(phase) {
      if (!guideState.completedPhases.includes(phase)) {
        guideState.completedPhases.push(phase);
      }
      // 自动进入下一阶段
      if (phase < GUIDE_PHASES.COMPLETED) {
        guideState.currentPhase = phase + 1;
      }
      save();
    }

    // 领取任务奖励
    function claimTaskReward(taskId) {
      const taskState = guideState.tasks[taskId];
      if (!taskState || !taskState.completed || taskState.claimed) {
        return null;
      }
      // 找到任务配置
      let taskConfig = null;
      Object.values(PHASE_CONFIG).forEach((phase) => {
        const found = phase.tasks.find((t) => t.id === taskId);
        if (found) taskConfig = found;
      });
      if (!taskConfig) return null;

      taskState.claimed = true;
      // 累加奖励
      if (taskConfig.reward.type === 'score_bonus') {
        guideState.totalRewards.scoreBonus += taskConfig.reward.value;
      } else if (taskConfig.reward.type === 'item') {
        if (!guideState.totalRewards.items[taskConfig.reward.value]) {
          guideState.totalRewards.items[taskConfig.reward.value] = 0;
        }
        guideState.totalRewards.items[taskConfig.reward.value] += taskConfig.reward.count;
      }
      save();
      return taskConfig.reward;
    }

    // 获取总奖励
    function getTotalRewards() {
      return { ...guideState.totalRewards };
    }

    // 跳过引导
    function skipGuide() {
      guideState.skipped = true;
      guideState.currentPhase = GUIDE_PHASES.COMPLETED;
      guideState.completedPhases = [
        GUIDE_PHASES.PHASE1_BASIC,
        GUIDE_PHASES.PHASE2_ITEMS,
        GUIDE_PHASES.PHASE3_MODES
      ];
      save();
    }

    // 检查是否跳过
    function isSkipped() {
      return guideState.skipped;
    }

    // 检查引导是否完成
    function isCompleted() {
      return guideState.currentPhase === GUIDE_PHASES.COMPLETED;
    }

    // 获取完成阶段数
    function getCompletedPhaseCount() {
      return guideState.completedPhases.length;
    }

    // 获取总阶段数
    function getTotalPhaseCount() {
      return Object.keys(PHASE_CONFIG).length - 1; // 减去COMPLETED
    }

    // 获取进度百分比
    function getProgressPercent() {
      const totalTasks = Object.values(PHASE_CONFIG)
        .slice(0, -1) // 排除COMPLETED
        .reduce((sum, phase) => sum + phase.tasks.length, 0);
      if (totalTasks === 0) return 100;
      const completedTasks = Object.values(guideState.tasks).filter((t) => t.completed).length;
      return Math.round((completedTasks / totalTasks) * 100);
    }

    // 重置引导进度
    function reset() {
      guideState = {
        ...DEFAULT_STATE,
        tasks: initTasks()
      };
      save();
    }

    // 获取箭头高亮目标
    function getHighlightTarget(targetId) {
      return HIGHLIGHT_TARGETS[targetId] || null;
    }

    // 获取所有高亮目标
    function getAllHighlightTargets() {
      return { ...HIGHLIGHT_TARGETS };
    }

    // 设置是否显示箭头
    function setShowArrows(show) {
      guideState.showArrows = show;
      save();
    }

    // 是否显示箭头
    function shouldShowArrows() {
      return guideState.showArrows;
    }

    // 生成引导UI HTML
    function generateGuideUI() {
      const phase = guideState.currentPhase;
      const config = getCurrentPhaseConfig();
      if (!config) return '';

      const tasks = getCurrentPhaseTasks();
      const progress = getProgressPercent();

      let tasksHtml = tasks
        .map((task) => {
          const statusClass = task.completed ? 'completed' : task.progress > 0 ? 'in-progress' : '';
          const checkMark = task.completed ? '✅' : '⬜';
          return `
            <div class="guide-task ${statusClass}" data-task-id="${task.id}">
              <span class="task-check">${checkMark}</span>
              <span class="task-desc">${task.description}</span>
              <span class="task-progress">${task.progress}/${task.target}</span>
            </div>
          `;
        })
        .join('');

      return `
        <div class="guide-panel">
          <div class="guide-header">
            <span class="guide-icon">${config.icon}</span>
            <span class="guide-title">${config.name}</span>
            <span class="guide-progress">${progress}%</span>
          </div>
          <div class="guide-progress-bar">
            <div class="guide-progress-fill" style="width: ${progress}%"></div>
          </div>
          <p class="guide-intro">${config.intro}</p>
          <div class="guide-tasks">
            ${tasksHtml}
          </div>
          <div class="guide-actions">
            <button class="guide-skip-btn" id="guideSkipBtn">跳过引导</button>
          </div>
        </div>
      `;
    }

    // 初始化
    load();

    // 返回公开API
    return {
      // 常量
      GUIDE_PHASES,
      TASK_TYPES,
      PHASE_CONFIG,

      // 状态查询
      getCurrentPhase,
      getCurrentPhaseConfig,
      getCurrentPhaseTasks,
      isSkipped,
      isCompleted,
      getCompletedPhaseCount,
      getTotalPhaseCount,
      getProgressPercent,
      getTotalRewards,
      shouldShowArrows,

      // 任务操作
      updateTaskProgress,
      incrementTaskProgress,
      claimTaskReward,

      // 阶段操作
      completePhase,
      skipGuide,

      // UI辅助
      getHighlightTarget,
      getAllHighlightTargets,
      setShowArrows,
      generateGuideUI,

      // 管理
      reset
    };
  }

  return {
    createGuideModule,
    GUIDE_PHASES,
    TASK_TYPES,
    PHASE_CONFIG
  };
})();

const SnakeGuide = window.SnakeGuide;
export { SnakeGuide };
