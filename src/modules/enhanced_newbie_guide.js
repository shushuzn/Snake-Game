/**
 * 增强新手引导系统 v1.8.0
 * 降低新手流失率，提升首次体验
 */
(function() {
  'use strict';

  // 新手引导阶段
  const GUIDE_STAGES = {
    WELCOME: 'welcome',
    BASIC: 'basic',
    ITEMS: 'items',
    MODES: 'modes',
    FIRST_GAME: 'first_game',
    COMPLETE: 'complete'
  };

  // 新手任务配置
  const NEWBIE_TASKS = [
    {
      id: 'first_food',
      stage: GUIDE_STAGES.BASIC,
      description: '吃掉第一个食物',
      target: 1,
      reward: { coins: 10, experience: 5 }
    },
    {
      id: 'first_growth',
      stage: GUIDE_STAGES.BASIC,
      description: '让蛇身长度达到3',
      target: 3,
      reward: { coins: 15, experience: 10 }
    },
    {
      id: 'first_survive',
      stage: GUIDE_STAGES.BASIC,
      description: '成功存活一局',
      target: 1,
      reward: { coins: 20, experience: 15 }
    },
    {
      id: 'use_shield',
      stage: GUIDE_STAGES.ITEMS,
      description: '使用一次护盾果',
      target: 1,
      reward: { coins: 25, experience: 15 }
    },
    {
      id: 'use_speed',
      stage: GUIDE_STAGES.ITEMS,
      description: '使用一次加速果',
      target: 1,
      reward: { coins: 25, experience: 15 }
    },
    {
      id: 'try_timed_mode',
      stage: GUIDE_STAGES.MODES,
      description: '尝试限时模式',
      target: 1,
      reward: { coins: 30, experience: 20 }
    },
    {
      id: 'first_high_score',
      stage: GUIDE_STAGES.FIRST_GAME,
      description: '获得100分以上',
      target: 100,
      reward: { coins: 50, experience: 30 }
    }
  ];

  function createEnhancedNewbieGuideModule({ storage }) {
    if (!storage) return null;

    // 获取当前阶段
    function getCurrentStage() {
      return storage.get('newbieGuideStage') || GUIDE_STAGES.WELCOME;
    }

    // 设置阶段
    function setStage(stage) {
      storage.set('newbieGuideStage', stage);
    }

    // 获取任务进度
    function getTaskProgress(taskId) {
      const progress = storage.get('newbieTaskProgress') || {};
      return progress[taskId] || 0;
    }

    // 更新任务进度
    function updateTaskProgress(taskId, value) {
      const progress = storage.get('newbieTaskProgress') || {};
      progress[taskId] = value;
      storage.set('newbieTaskProgress', progress);
    }

    // 检查任务是否完成
    function isTaskCompleted(taskId) {
      const task = NEWBIE_TASKS.find(t => t.id === taskId);
      if (!task) return false;

      const current = getTaskProgress(taskId);
      return current >= task.target;
    }

    // 获取当前阶段任务
    function getCurrentTasks() {
      const stage = getCurrentStage();
      return NEWBIE_TASKS.filter(t => t.stage === stage && !isTaskCompleted(t.id));
    }

    // 获取任务奖励
    function getTaskReward(taskId) {
      const task = NEWBIE_TASKS.find(t => t.id === taskId);
      return task?.reward || null;
    }

    // 完成新手引导
    function completeNewbieGuide() {
      setStage(GUIDE_STAGES.COMPLETE);

      // 标记已完成
      storage.set('newbieGuideCompleted', true);

      // 发放最终奖励
      const coins = storage.get('coins') || 0;
      const experience = storage.get('experience') || 0;

      storage.set('coins', coins + 100);
      storage.set('experience', experience + 50);

      return {
        success: true,
        message: '恭喜完成新手引导！获得100金币+50经验',
        finalReward: { coins: 100, experience: 50 }
      };
    }

    // 获取引导提示
    function getGuideHint(taskId) {
      const hints = {
        first_food: '使用方向键或WASD控制蛇移动，吃掉地图上的食物',
        first_growth: '每吃一个食物蛇身就会增长一节',
        first_survive: '小心不要撞到墙壁或自己的身体',
        use_shield: '护盾果可以抵挡一次碰撞伤害',
        use_speed: '加速果可以快速移动，躲避危险',
        try_timed_mode: '限时模式60秒内尽可能获得最高分',
        first_high_score: '专注于吃食物，避免碰撞'
      };
      return hints[taskId] || '';
    }

    // 获取阶段进度
    function getStageProgress() {
      const stage = getCurrentStage();
      const stageOrder = Object.values(GUIDE_STAGES);
      const currentIndex = stageOrder.indexOf(stage);

      return {
        currentStage: stage,
        stageIndex: currentIndex,
        totalStages: stageOrder.length - 1, // 减去 COMPLETE
        progress: Math.round((currentIndex / (stageOrder.length - 1)) * 100)
      };
    }

    // 检查是否是新手
    function isNewbie() {
      const completed = storage.get('newbieGuideCompleted');
      const gamesPlayed = storage.get('gamesPlayed') || 0;

      return !completed && gamesPlayed < 5;
    }

    // 跳过引导
    function skipGuide() {
      storage.set('newbieGuideSkipped', true);
      storage.set('newbieGuideCompleted', true);
      return { success: true };
    }

    return {
      getCurrentStage,
      setStage,
      getTaskProgress,
      updateTaskProgress,
      isTaskCompleted,
      getCurrentTasks,
      getTaskReward,
      completeNewbieGuide,
      getGuideHint,
      getStageProgress,
      isNewbie,
      skipGuide,
      GUIDE_STAGES,
      NEWBIE_TASKS
    };
  }

  // 暴露到全局
  window.SnakeEnhancedNewbieGuide = {
    createEnhancedNewbieGuideModule
  };
})();

const SnakeEnhancedNewbieGuide = window.SnakeEnhancedNewbieGuide;
export { SnakeEnhancedNewbieGuide };
