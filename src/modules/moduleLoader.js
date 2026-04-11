/**
 * 模块加载器 - 智能预加载系统
 * 
 * 功能:
 * - 核心模块同步加载
 * - 懒加载模块按需加载
 * - 空闲时预加载可能需要的模块
 * 
 * 使用方式:
 * 
 * // 1. 加载单个模块 (按需)
 * await ModuleLoader.load('achievement_showcase');
 * 
 * // 2. 批量加载模块
 * await ModuleLoader.load(['achievement_detail', 'achievement_toast']);
 * 
 * // 3. 预加载模块 (空闲时)
 * ModuleLoader.preload('reward_preview');
 * 
 * // 4. 检查模块是否已加载
 * if (ModuleLoader.isLoaded('achievement_showcase')) { ... }
 */

const ModuleLoader = (function() {
  const LOADED = new Set();
  const LOADING = new Map();
  
  // 核心模块 (同步加载，首屏必需)
  const CORE_MODULES = [
    'storage',
    'events',
    'play_state',
    'round_state',
    'input',
    'render',
    'modes',
    'mode_rules',
    'settlement',
    'statistics',
    'settings',
    'records'
  ];

  // 懒加载模块 (按需加载)
  const LAZY_MODULES = [
    // 成就系统 - 6个
    'achievement_detail',
    'achievement_preview',
    'achievement_search',
    'achievement_showcase',
    'achievement_stats',
    'achievement_toast',
    // 好友系统 - 3个
    'friends',
    'friends_challenge',
    'friends_leaderboard',
    // 回流系统 - 5个
    'return_center',
    'return_missions',
    'return_reminder',
    'enhanced_return_rewards',
    // 赛季系统 - 2个
    'season',
    'season_rewards_preview',
    // 每日系统 - 3个
    'daily_challenge_mode',
    'daily_rewards',
    'daily_tasks',
    // 奖励系统 - 2个
    'reward_system',
    'reward_preview',
    // 其他功能 - 30+个
    'account',
    'ai_player',
    'battle_pass',
    'challenge',
    'churn_analytics',
    'churn_warning',
    'clan',
    'email',
    'emoji',
    'endgame_flow',
    'enhanced_newbie_guide',
    'feedback',
    'first_milestone',
    'guide',
    'item_spawn',
    'leaderboard',
    'level_unlock',
    'loop_timers',
    'mail',
    'mission_system',
    'notifications',
    'particle_system',
    'profile',
    'purchase_feedback',
    'rank_system',
    'recap',
    'report',
    'reset_flow',
    'reset_prepare',
    'season_challenges',
    'share',
    'skill_tree',
    'skin_system',
    'titles',
    'toast',
    'tournament',
    'tutorial',
    'workshop',
    'workshop_runtime'
  ];

  // 预加载候选模块 (空闲时预加载)
  const PRELOAD_CANDIDATES = [
    'achievement_showcase',  // 成就按钮常见
    'achievement_toast',    // 成就通知常见
    'reward_preview',       // 奖励预览常见
    'season',               // 赛季系统
    'daily_rewards',        // 每日奖励
    'leaderboard',          // 排行榜按钮
    'shop'                  // 商店按钮
  ];

  /**
   * 加载单个模块
   * @param {string} name - 模块名 (不含 .js)
   * @returns {Promise} - 加载完成
   */
  function loadModule(name) {
    // 已加载
    if (LOADED.has(name)) {
      return Promise.resolve();
    }

    // 正在加载
    if (LOADING.has(name)) {
      return LOADING.get(name);
    }

    // 核心模块不允许懒加载
    if (CORE_MODULES.includes(name)) {
      console.warn(`[ModuleLoader] Core module cannot be lazy loaded: ${name}`);
      return Promise.reject(new Error(`Core module: ${name}`));
    }

    // 创建加载 Promise
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `src/modules/${name}.js`;
      script.onload = () => {
        LOADED.add(name);
        LOADING.delete(name);
        console.debug(`[ModuleLoader] Loaded: ${name}`);
        resolve();
      };
      script.onerror = (e) => {
        LOADING.delete(name);
        console.error(`[ModuleLoader] Failed to load: ${name}`);
        reject(new Error(`Failed to load module: ${name}`));
      };
      document.head.appendChild(script);
    });

    LOADING.set(name, promise);
    return promise;
  }

  /**
   * 批量加载模块
   * @param {string[]} names - 模块名数组
   */
  async function load(names) {
    await Promise.all(names.map(name => loadModule(name)));
  }

  /**
   * 预加载模块 (空闲时)
   * @param {string} name - 模块名
   */
  function preload(name) {
    if (LOADED.has(name) || LOADING.has(name)) {
      return;
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadModule(name), { timeout: 2000 });
    } else {
      setTimeout(() => loadModule(name), 100);
    }
  }

  /**
   * 预加载候选模块 (空闲时批量)
   */
  function preloadCandidates() {
    const candidates = PRELOAD_CANDIDATES.filter(m => !LOADED.has(m) && !LOADING.has(m));
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        candidates.forEach((name, i) => {
          setTimeout(() => preload(name), i * 100);
        });
      }, { timeout: 5000 });
    } else {
      candidates.forEach((name, i) => {
        setTimeout(() => preload(name), i * 100);
      });
    }
  }

  /**
   * 检查模块是否已加载
   * @param {string} name - 模块名
   */
  function isLoaded(name) {
    return LOADED.has(name);
  }

  /**
   * 获取已加载模块列表
   */
  function getLoaded() {
    return Array.from(LOADED);
  }

  /**
   * 获取核心模块列表
   */
  function getCoreModules() {
    return CORE_MODULES;
  }

  /**
   * 获取懒加载模块列表
   */
  function getLazyModules() {
    return LAZY_MODULES;
  }

  /**
   * 获取预加载候选模块列表
   */
  function getPreloadCandidates() {
    return PRELOAD_CANDIDATES;
  }

  // 初始化 - 立即预加载候选模块
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(preloadCandidates, 1000);
    });
  } else {
    setTimeout(preloadCandidates, 1000);
  }

  return {
    load: load,
    loadModule: loadModule,
    preload: preload,
    preloadCandidates: preloadCandidates,
    isLoaded: isLoaded,
    getLoaded: getLoaded,
    getCoreModules: getCoreModules,
    getLazyModules: getLazyModules,
    getPreloadCandidates: getPreloadCandidates
  };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModuleLoader;
}
