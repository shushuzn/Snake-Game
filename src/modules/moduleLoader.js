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
  
  // 使用追踪数据
  const USAGE_STATS = {
    loads: [],      // {module, timestamp, duration, success}
    coreLoads: [],  // 核心模块加载记录
    lazyLoads: [],  // 懒加载模块记录
    errors: []      // 加载错误
  };
  
  // 核心模块 (同步加载，首屏必需)
  // 分析依据: game.js 中直接引用 window.SnakeXXX
  const CORE_MODULES = [
    'storage',           // window.SnakeStorage - 必需
    'events',           // window.SnakeEvents - 必需
    'play_state',       // window.SnakePlayState - 必需
    'round_state',      // window.SnakeRoundState - 必需
    'input',            // window.SnakeInput - 必需
    'render',           // window.SnakeRender - 必需
    'modes',            // window.SnakeModes - 必需
    'mode_rules',       // window.SnakeModeRules - 必需
    'settlement',       // window.SnakeSettlement - 必需
    'statistics',       // window.SnakeStatistics - 必需
    'settings',         // window.SnakeSettings - 必需
    'records',          // window.SnakeRecords - 必需
    'challenge',        // window.SnakeChallenge - 必需
    'season',           // window.SnakeSeason - 必需
    'shop',             // window.SnakeShop - 必需
    'account',          // window.SnakeAccount - 必需
    'achievement_showcase', // 直接引用
    'achievement_search',   // 直接引用
    'achievement_detail',   // 直接引用
    'achievement_toast',    // 直接引用
    'achievement_stats',     // 直接引用
    'friends',          // window.SnakeFriends - 直接引用
    'friends_leaderboard',  // 直接引用
    'friends_challenge',    // 直接引用
    'daily_rewards',    // window.SnakeDailyRewards - 直接引用
    'daily_tasks',      // window.SnakeDailyTasks - 直接引用
    'return_center',    // window.SnakeReturnCenter - 直接引用
    'return_missions',  // window.SnakeReturnMissions - 直接引用
    'return_reminder',  // window.SnakeReturnReminder - 直接引用
    'reward_system',    // window.SnakeRewardSystem - 直接引用
    'level_unlock',     // 直接引用
    'first_milestone',  // 直接引用
    'purchase_feedback', // 直接引用
    'guide',            // 直接引用
    'reset_prepare',    // 直接引用
    'reset_flow',       // 直接引用
    'endgame_flow',     // 直接引用
    'notifications',    // 直接引用
    'leaderboard',      // window.SnakeLeaderboard - 直接引用
    'recap',            // 直接引用
    'spectate',         // 直接引用
    'ai_battle',        // 直接引用
    'multiplayer',      // 直接引用
    'season_challenges', // 直接引用
    'daily_challenge_mode' // 直接引用
  ];

  // 懒加载模块 (按需加载)
  // 这些模块未在 game.js 中直接引用，可能是:
  // 1. 被其他模块间接调用
  // 2. UI 事件触发后才使用
  // 3. 将来可能删除的死代码
  const LAZY_MODULES = [
    'achievement_preview',
    'ai_player',
    'ai_battle',
    'battle_pass',
    'churn_analytics',
    'churn_warning',
    'clan',
    'email',
    'emoji',
    'enhanced_newbie_guide',
    'enhanced_return_rewards',
    'feedback',
    'in_game_hints',
    'in_game_notifications',
    'item_spawn',
    'loop_timers',
    'mail',
    'mission_system',
    'mode_trial',
    'multiplayer',
    'particle_system',
    'personalized_achievements',
    'profile',
    'quick_start',
    'rank_system',
    'replay',
    'report',
    'returning_guide',
    'reward_preview',
    'season_rewards_preview',
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
    const startTime = performance.now();
    const isCore = CORE_MODULES.includes(name);
    
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `src/modules/${name}.js`;
      script.onload = () => {
        const duration = performance.now() - startTime;
        LOADED.add(name);
        LOADING.delete(name);
        
        // 追踪
        const record = {
          module: name,
          timestamp: Date.now(),
          duration: duration,
          success: true,
          isCore: isCore
        };
        USAGE_STATS.loads.push(record);
        if (isCore) {
          USAGE_STATS.coreLoads.push(record);
        } else {
          USAGE_STATS.lazyLoads.push(record);
        }
        
        console.debug(`[ModuleLoader] Loaded: ${name} (${duration.toFixed(1)}ms)`);
        resolve();
      };
      script.onerror = (e) => {
        const duration = performance.now() - startTime;
        LOADING.delete(name);
        
        // 追踪错误
        USAGE_STATS.errors.push({
          module: name,
          timestamp: Date.now(),
          duration: duration,
          success: false
        });
        
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

    // 核心模块由 manifest 同步加载，不允许懒加载
    if (CORE_MODULES.includes(name)) {
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

  /**
   * 获取使用统计
   */
  function getUsageStats() {
    return {
      total: USAGE_STATS.loads.length,
      coreCount: USAGE_STATS.coreLoads.length,
      lazyCount: USAGE_STATS.lazyLoads.length,
      errorCount: USAGE_STATS.errors.length,
      coreLoads: USAGE_STATS.coreLoads,
      lazyLoads: USAGE_STATS.lazyLoads,
      errors: USAGE_STATS.errors,
      avgDuration: calculateAvgDuration(),
      moduleFrequency: getModuleFrequency()
    };
  }

  /**
   * 计算平均加载时间
   */
  function calculateAvgDuration() {
    if (USAGE_STATS.loads.length === 0) return 0;
    const total = USAGE_STATS.loads.reduce((sum, r) => sum + r.duration, 0);
    return total / USAGE_STATS.loads.length;
  }

  /**
   * 获取模块加载频率
   */
  function getModuleFrequency() {
    const freq = {};
    USAGE_STATS.loads.forEach(r => {
      freq[r.module] = (freq[r.module] || 0) + 1;
    });
    return freq;
  }

  /**
   * 标记预加载的模块为已加载 (用于 index.html 同步加载的模块)
   */
  function markPreloaded(names) {
    names.forEach(name => LOADED.add(name));
  }

  /**
   * 重置统计数据 (用于调试)
   */
  function resetStats() {
    USAGE_STATS.loads = [];
    USAGE_STATS.coreLoads = [];
    USAGE_STATS.lazyLoads = [];
    USAGE_STATS.errors = [];
  }

  /**
   * 打印统计信息到控制台
   */
  function printStats() {
    const stats = getUsageStats();
    
    console.log('');
    console.log('%c╔══════════════════════════════════════════╗', 'color: #4CAF50');
    console.log('%c║       ModuleLoader Usage Stats            ║', 'color: #4CAF50');
    console.log('%c╠══════════════════════════════════════════╣', 'color: #4CAF50');
    console.log(`%c║  Total loads:    ${String(stats.total).padEnd(17)}  ║`, 'color: #fff');
    console.log(`%c║  Core loads:     ${String(stats.coreCount).padEnd(17)}  ║`, 'color: #fff');
    console.log(`%c║  Lazy loads:     ${String(stats.lazyCount).padEnd(17)}  ║`, 'color: #fff');
    console.log(`%c║  Errors:         ${String(stats.errorCount).padEnd(17)}  ║`, 'color: #ff5722');
    console.log(`%c║  Avg load time:  ${stats.avgDuration.toFixed(2)}ms`.padEnd(40) + '  ║', 'color: #fff');
    console.log('%c╠══════════════════════════════════════════╣', 'color: #4CAF50');
    console.log('%c║          Load Frequency (Top 10)         ║', 'color: #4CAF50');
    console.log('%c╠══════════════════════════════════════════╣', 'color: #4CAF50');
    
    const sorted = Object.entries(stats.moduleFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    if (sorted.length === 0) {
      console.log('%c║       No modules loaded yet              ║', 'color: #666');
    } else {
      sorted.forEach(([mod, count], i) => {
        const bar = '█'.repeat(Math.min(count, 15));
        const bg = i % 2 === 0 ? 'color: #fff' : 'color: #e0e0e0';
        console.log(`%c║  ${mod.padEnd(18)} ${String(count).padEnd(6)} ${bar}`.padEnd(42) + '  ║', bg);
      });
    }
    
    console.log('%c╚══════════════════════════════════════════╝', 'color: #4CAF50');
    console.log('');
    console.log('%cTip: Run ModuleLoader.getUsageStats() for raw data', 'color: #888');
  }

  /**
   * 按清单顺序注入模块（经典脚本，确保 file:// 直接打开也能加载）。
   * 全部加载（或失败）完成后标记就绪并派发 snake:modules-ready 事件，
   * 供 game.js 在模块全局变量可用后再启动。
   *
   * @param {string[]} manifest - 模块名数组（不含 .js）
   * @param {object} [opts]
   * @param {string} [opts.base='src/modules/']
   * @returns {Promise<void>}
   */
  async function bootstrap(manifest, opts = {}) {
    const base = opts.base || 'src/modules/';
    for (const name of manifest) {
      try {
        await injectScript(base + name + '.js');
        LOADED.add(name);
      } catch (e) {
        // 单个模块失败不应阻断整个游戏启动
        console.error(`[ModuleLoader] Failed to load module: ${name}`, e);
      }
    }
    window.__SNAKE_MODULES_READY = true;
    window.dispatchEvent(new Event('snake:modules-ready'));
  }

  /**
   * 注入单个经典脚本并等待其执行完成。
   */
  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      // 注意：不使用 type="module"，否则在 file:// 直接打开时会因 CORS 失败
      script.onload = () => resolve(src);
      script.onerror = () => reject(new Error('load failed: ' + src));
      document.head.appendChild(script);
    });
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
    bootstrap: bootstrap,
    preload: preload,
    preloadCandidates: preloadCandidates,
    isLoaded: isLoaded,
    getLoaded: getLoaded,
    getCoreModules: getCoreModules,
    getLazyModules: getLazyModules,
    getPreloadCandidates: getPreloadCandidates,
    getUsageStats: getUsageStats,
    markPreloaded: markPreloaded,
    resetStats: resetStats,
    printStats: printStats
  };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModuleLoader;
}
