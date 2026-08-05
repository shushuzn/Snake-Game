/**
 * 模块注册表系统
 * 
 * 功能:
 * - 自动发现模块
 * - 按需加载 (懒加载)
 * - 消除手动注册
 * 
 * 使用方式:
 * 
 * // 定义模块 (每个模块文件)
 * if (typeof MODULE_API !== 'undefined') {
 *   MODULE_API.register('myModule', {
 *     deps: [],  // 依赖的其他模块
 *     lazy: true, // 是否懒加载
 *     init: () => { ... }
 *   });
 * }
 * 
 * // 加载模块
 * await ModuleRegistry.load('myModule');
 * 
 * // 获取模块
 * const mod = ModuleRegistry.get('myModule');
 */

const ModuleRegistry = (function() {
  const modules = new Map();
  const loaded = new Set();
  
  // 核心模块 (首屏必需, 同步加载)
  const CORE_MODULES = [
    'storage',
    'modes', 
    'mode_rules',
    'play_state',
    'round_state',
    'input',
    'render',
    'settlement',
    'events',
    'records'
  ];

  // 懒加载模块 (按需加载)
  const LAZY_MODULES = [
    // 成就系统
    'achievement_detail',
    'achievement_preview', 
    'achievement_search',
    'achievement_showcase',
    'achievement_stats',
    'achievement_toast',
    // 好友系统
    'friends',
    'friends_challenge',
    'friends_leaderboard',
    // 回流系统
    'return_center',
    'return_missions',
    'return_reminder',
    'return_reminder',
    'enhanced_return_rewards',
    // 赛季系统
    'season',
    'season_rewards_preview',
    // 每日系统
    'daily_challenge_mode',
    'daily_rewards',
    'daily_tasks',
    // 奖励系统
    'reward_system',
    'reward_preview',
    // 其他功能
    'workshop',
    'workshop_runtime',
    'challenge',
    'account',
    'settings',
    'item_spawn',
    'loop_timers',
    'leaderboard',
    'recap',
    'endgame_flow',
    'reset_prepare',
    'reset_flow',
    'guide',
    'skill_tree',
    'titles',
    'profile',
    'shop',
    'statistics',
    'notifications',
    'toast',
    'audio_manager',
    'particle_system',
    'skin_system',
    'battle_pass',
    'tournament',
    'clan',
    'mail',
    'tutorial',
    'achievement_system',
    'mission_system',
    'rank_system',
    'chat',
    'emoji',
    'share',
    'report',
    'feedback'
  ];

  /**
   * 注册模块
   */
  function register(name, definition) {
    modules.set(name, {
      name,
      deps: definition.deps || [],
      lazy: definition.lazy !== false,
      init: definition.init || (() => {}),
      loaded: false
    });
  }

  /**
   * 获取模块
   */
  function get(name) {
    return modules.get(name);
  }

  /**
   * 加载单个模块 (懒加载)
   */
  async function loadModule(name) {
    if (loaded.has(name)) {
      return modules.get(name);
    }

    const mod = modules.get(name);
    if (!mod) {
      console.warn(`[ModuleRegistry] Module not found: ${name}`);
      return null;
    }

    // 加载依赖
    for (const dep of mod.deps) {
      if (!loaded.has(dep)) {
        await loadModule(dep);
      }
    }

    // 动态加载脚本
    if (!loaded.has(name)) {
      const script = document.createElement('script');
      script.src = `src/modules/${name}.js`;
      // 经典脚本：不使用 type="module"，确保 file:// 直接打开也能加载
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      loaded.add(name);
      mod.loaded = true;
      mod.init();
    }

    return mod;
  }

  /**
   * 批量加载模块
   */
  async function load(moduleNames) {
    const promises = moduleNames.map(name => loadModule(name));
    await Promise.all(promises);
  }

  /**
   * 预加载模块 (空闲时)
   */
  function preload(name) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadModule(name));
    } else {
      setTimeout(() => loadModule(name), 100);
    }
  }

  /**
   * 获取已加载模块列表
   */
  function getLoaded() {
    return Array.from(loaded);
  }

  /**
   * 检查模块是否已加载
   */
  function isLoaded(name) {
    return loaded.has(name);
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

  return {
    register,
    get,
    load,
    loadModule,
    preload,
    getLoaded,
    isLoaded,
    getCoreModules,
    getLazyModules
  };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModuleRegistry;
}
