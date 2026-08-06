// ============================================================
// Snake Game — ESM 入口
// 由 Vite 打包。静态 import 全部模块（依赖顺序由 import 图保证），
// 然后启动游戏。取代旧的 ModuleLoader 动态脚本注入机制。
// 本文件的模块 import 区由 scripts/generate-modules.mjs 自动生成。
// ============================================================

import './modules/account.js';
import './modules/achievement_detail.js';
import './modules/achievement_preview.js';
import './modules/achievement_search.js';
import './modules/achievement_showcase.js';
import './modules/achievement_stats.js';
import './modules/achievement_toast.js';
import './modules/achievements_manager.js';
import './modules/ai_engine_selector.js';
import './modules/ai_player.js';
import './modules/ai_worker_bridge.js';
import './modules/best_manager.js';
import './modules/challenge.js';
import './modules/churn_analytics.js';
import './modules/churn_warning.js';
import './modules/codex_manager.js';
import './modules/daily_challenge_mode.js';
import './modules/daily_rewards.js';
import './modules/daily_tasks.js';
import './modules/effect_timer.js';
import './modules/endgame_flow.js';
import './modules/enhanced_newbie_guide.js';
import './modules/enhanced_return_rewards.js';
import './modules/events.js';
import './modules/first_milestone.js';
import './modules/friends.js';
import './modules/friends_challenge.js';
import './modules/friends_leaderboard.js';
import './modules/guide.js';
import './modules/in_game_hints.js';
import './modules/in_game_notifications.js';
import './modules/input.js';
import './modules/item_spawn.js';
import './modules/leaderboard.js';
import './modules/level_unlock.js';
import './modules/lifetime_stats.js';
import './modules/loop_timers.js';
import './modules/mode_rules.js';
import './modules/mode_trial.js';
import './modules/modes.js';
import './modules/multiplayer.js';
import './modules/personalized_achievements.js';
import './modules/play_state.js';
import './modules/profile.js';
import './modules/purchase_feedback.js';
import './modules/quick_start.js';
import './modules/recall.js';
import './modules/recap.js';
import './modules/records.js';
import './modules/render.js';
import './modules/replay.js';
import './modules/reset_flow.js';
import './modules/reset_prepare.js';
import './modules/return_center.js';
import './modules/return_missions.js';
import './modules/return_reminder.js';
import './modules/returning_guide.js';
import './modules/reward_preview.js';
import './modules/reward_system.js';
import './modules/rogue_manager.js';
import './modules/round_state.js';
import './modules/round_stats_manager.js';
import './modules/season.js';
import './modules/season_rewards_preview.js';
import './modules/settings.js';
import './modules/settlement.js';
import './modules/shop.js';
import './modules/skill_tree.js';
import './modules/sound.js';
import './modules/spectate.js';
import './modules/statistics.js';
import './modules/storage.js';
import './modules/titles.js';
import './modules/workshop.js';
import './modules/workshop_runtime.js';
// ---- 游戏主逻辑 ----
import { bootSnakeGame } from '../game.js';

// 兼容标志：旧 ModuleLoader 机制在模块就绪后设置，测试依赖此语义
window.__SNAKE_MODULES_READY = true;
window.SNAKE_LAZY_MODULES = []; // 新机制无懒加载，全部静态 import 立即可用

// 兼容事件：旧机制在模块就绪后派发 snake:modules-ready（perf 测试等依赖）
window.dispatchEvent(new Event('snake:modules-ready'));

// 模块全部就绪后启动（静态 import 保证顺序，无需等待事件）
bootSnakeGame();
