// ============================================================
// 游戏纯常量与配置（无闭包依赖，可安全独立）
// 从 game.js bootSnakeGame 闭包中抽取：常量 / 存储键 / 验证函数
// ============================================================

export const GAME_VERSION = '1.55.0';
export const GRID_SIZE = 20;

export const TIMED_MODE_DURATION = 60;
export const BLITZ_MODE_DURATION = 45;

// ---- 存储键 ----
export const SETTINGS_KEY = 'snake-settings-v2';
export const SETTINGS_SCHEMA_VERSION = 3;
export const STATS_KEY = 'snake-stats-v1';
export const AUDIO_KEY = 'snake-audio-v1';
export const VOLUME_KEY = 'snake-volume-v1';
export const BEST_BY_MODE_KEY = 'snake-best-by-mode-v1';
export const ACHIEVEMENTS_KEY = 'snake-achievements-v1';
export const LAST_RESULT_KEY = 'snake-last-result-v1';
export const HISTORY_KEY = 'snake-history-v1';
export const CODEX_KEY = 'snake-codex-v1';
export const ENDLESS_BEST_LEVEL_KEY = 'snake-endless-best-level-v1';
export const ACCOUNT_STORE_KEY = 'snake-accounts-v1';
export const CURRENT_ACCOUNT_KEY = 'snake-current-account-v1';
export const ROGUE_META_KEY = 'snake-roguelike-meta-v1';
export const ONBOARDING_KEY = 'snake-onboarding-v1';
export const CUSTOM_ROCKS_KEY = 'snake-custom-rocks-v1';
export const LEADERBOARD_KEY = 'snake-leaderboard-v1';
export const SEASON_META_KEY = 'snake-season-meta-v1';
export const RECAP_KEY = 'snake-recap-v1';
export const GUIDE_KEY = 'snake-guide-v1';
export const ACTIVE_TAB_KEY = 'snake-active-tab-v1';
export const DEFAULT_TAB_NAME = 'game';

// ---- 合法值 ----
export const VALID_MODES = ['classic', 'timed', 'blitz', 'endless', 'roguelike', 'ai-battle', 'multiplayer', 'spectate', 'daily-challenge'];
export const VALID_DIFFICULTIES = ['140', '110', '80'];
export const VALID_DLC_PACKS = ['none', 'frenzy', 'guardian', 'chrono'];

export const DLC_META = {
  none: {
    hudText: '关闭',
    summary: '未启用扩展规则',
    risk: '无额外风险',
    reward: '基础平衡体验'
  },
  frenzy: {
    hudText: '狂热（奖励果+10，刷新更频繁）',
    summary: '道具刷新更快，节奏更激进',
    risk: '护盾上限降为 1，容错显著下降',
    reward: '更高分数上限与爆发收益'
  },
  guardian: {
    hudText: '守护（开局护盾+1）',
    summary: '开局提供额外护盾，稳定推进',
    risk: '前中期收益更稳但爆发较弱',
    reward: '容错提升，任务/连胜更稳'
  },
  chrono: {
    hudText: '时序（限时开局+8秒）',
    summary: '限时类模式时间收益更突出',
    risk: '更依赖节奏把控，拖节奏会亏时机',
    reward: '计时模式可获得更长输出窗口'
  }
};

// ---- 验证函数 ----
export function isValidModeValue(value) {
  return VALID_MODES.includes(String(value));
}

export function isValidDifficultyValue(value) {
  return VALID_DIFFICULTIES.includes(String(value));
}

export function isValidDlcPackValue(value) {
  return VALID_DLC_PACKS.includes(String(value));
}

export function isValidSwipeThresholdValue(value) {
  return ['12', '18', '24', '32'].includes(String(value));
}
