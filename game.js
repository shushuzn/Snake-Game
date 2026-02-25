const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const modeBestEl = document.getElementById('modeBest');
const lengthEl = document.getElementById('length');
const timeEl = document.getElementById('time');
const levelEl = document.getElementById('level');
const bestLevelEl = document.getElementById('bestLevel');
const roguePerksEl = document.getElementById('roguePerks');
const rogueMutatorEl = document.getElementById('rogueMutator');
const comboEl = document.getElementById('combo');
const shieldEl = document.getElementById('shield');
const missionEl = document.getElementById('mission');
const playsEl = document.getElementById('plays');
const foodsEl = document.getElementById('foods');
const streakEl = document.getElementById('streak');
const achievementsEl = document.getElementById('achievements');
const challengeEl = document.getElementById('challenge');
const challengeDetailEl = document.getElementById('challengeDetail');
const challengeNextEl = document.getElementById('challengeNext');
const challengeNextDateEl = document.getElementById('challengeNextDate');
const challengeRefreshEl = document.getElementById('challengeRefresh');
const challengeDateEl = document.getElementById('challengeDate');
const lastResultEl = document.getElementById('lastResult');
const multiplierEl = document.getElementById('multiplier');
const stateEl = document.getElementById('state');
const dlcStatusEl = document.getElementById('dlcStatus');
const overlay = document.getElementById('overlay');
const restartBtn = document.getElementById('restart');
const pauseBtn = document.getElementById('pause');
const clearDataBtn = document.getElementById('clearData');
const muteBtn = document.getElementById('mute');
const shareBtn = document.getElementById('share');
const helpBtn = document.getElementById('help');
const tutorialBtn = document.getElementById('tutorial');
const helpPanel = document.getElementById('helpPanel');
const closeHelpBtn = document.getElementById('closeHelp');
const accountNameEl = document.getElementById('accountName');
const accountInput = document.getElementById('accountInput');
const loginAccountBtn = document.getElementById('loginAccount');
const logoutAccountBtn = document.getElementById('logoutAccount');
const exportSaveBtn = document.getElementById('exportSave');
const importSaveInput = document.getElementById('importSave');
const workshopCodeInput = document.getElementById('workshopCode');
const genWorkshopBtn = document.getElementById('genWorkshop');
const copyWorkshopBtn = document.getElementById('copyWorkshop');
const applyWorkshopBtn = document.getElementById('applyWorkshop');
const workshopPresetSelect = document.getElementById('workshopPreset');
const applyWorkshopPresetBtn = document.getElementById('applyWorkshopPreset');
const rockEditorInput = document.getElementById('rockEditor');
const applyRocksBtn = document.getElementById('applyRocks');
const exportRocksBtn = document.getElementById('exportRocks');
const clearRocksBtn = document.getElementById('clearRocks');
const historyListEl = document.getElementById('historyList');
const codexListEl = document.getElementById('codexList');
const codexProgressEl = document.getElementById('codexProgress');
const versionEventsListEl = document.getElementById('versionEventsList');
const settlementListEl = document.getElementById('settlementList');
const difficultySelect = document.getElementById('difficulty');
const skinSelect = document.getElementById('skin');
const dlcPackSelect = document.getElementById('dlcPack');
const modeSelect = document.getElementById('mode');
const wrapModeInput = document.getElementById('wrapMode');
const obstacleModeInput = document.getElementById('obstacleMode');
const hardcoreModeInput = document.getElementById('hardcoreMode');
const contrastModeInput = document.getElementById('contrastMode');
const miniHudModeInput = document.getElementById('miniHudMode');
const autoPauseModeInput = document.getElementById('autoPauseMode');
const mobilePad = document.querySelector('.mobile-pad');
const versionTag = document.getElementById('versionTag');

const GAME_VERSION = '0.55.0';
const gridSize = 20;
const tileCount = canvas.width / gridSize;
const timedModeDuration = 60;
const blitzModeDuration = 45;
const missionOptions = SnakeModes.missionOptions;
const settingsKey = 'snake-settings-v2';
const settingsSchemaVersion = 2;
const statsKey = 'snake-stats-v1';
const audioKey = 'snake-audio-v1';
const bestByModeKey = 'snake-best-by-mode-v1';
const achievementsKey = 'snake-achievements-v1';
const lastResultKey = 'snake-last-result-v1';
const historyKey = 'snake-history-v1';
const codexKey = 'snake-codex-v1';
const endlessBestLevelKey = 'snake-endless-best-level-v1';
const accountStoreKey = 'snake-accounts-v1';
const currentAccountKey = 'snake-current-account-v1';
const rogueMetaKey = 'snake-roguelike-meta-v1';
const onboardingKey = 'snake-onboarding-v1';
const customRocksKey = 'snake-custom-rocks-v1';

const versionEvents = [
  { version: '0.55.0', notes: ['新增设置迁移流程与 schema 版本标记，兼容历史本地配置', '路线图 P0 补齐配置字段演进策略并落地首版实现'] },
  { version: '0.54.0', notes: ['结算面板新增得分来源拆分（基础果/奖励果/王冠/连击等）', '路线图更新为阶段进度视图并标注当前聚焦项'] },
  { version: '0.53.0', notes: ['新增最近一局结算明细面板，便于复盘限时与冲刺对局', '展示开局加时/时间果/王冠加时等关键时间来源'] },
  { version: '0.52.0', notes: ['HUD 新增 DLC 状态展示，当前规则一眼可见', '不同 DLC 的核心收益会同步显示在状态栏'] },
  { version: '0.51.0', notes: ['新增 DLC：时序扩展，强化限时类模式的时间收益', '工坊预设 timed-rush 默认改为时序扩展，短局节奏更稳定'] },
  { version: '0.50.0', notes: ['新增 DLC 扩展包：狂热/守护，可切换额外规则', '创意工坊与本地设置同步支持 DLC 选项'] },
  { version: '0.49.0', notes: ['修复跨天切换时强制模式在对局中立即生效的问题', '重置时先应用挑战锁定再初始化倒计时，避免限时错位'] },
  { version: '0.48.0', notes: ['新增每日挑战“冲刺日”：可临时锁定为冲刺模式', '模式锁定期间保存设置将保留玩家原始模式偏好'] },
  { version: '0.47.0', notes: ['新增“冲刺 45 秒”模式，节奏更快更适合短局', '冲刺模式共享限时玩法并支持时间果/王冠加时奖励'] },
  { version: '0.46.0', notes: ['修复挑战锁定期间保存设置导致障碍偏好被覆盖的问题', '保存配置时会优先写入玩家偏好而非临时锁定值'] },
  { version: '0.45.0', notes: ['净空挑战锁定障碍时会记住玩家原始开关偏好', '挑战结束后自动恢复障碍开关状态，避免设置被意外改写'] },
  { version: '0.44.0', notes: ['每日挑战会同步锁定冲突开关，规则与 HUD 表现一致', '净空挑战下障碍开关自动禁用并显示原因提示'] },
  { version: '0.43.0', notes: ['挑战倒计时改为差异更新，减少不必要的 DOM 刷新', '挑战刷新定时器统一封装，重置与跨天切换更稳定'] },
  { version: '0.42.0', notes: ['HUD 新增明日日期展示，预告信息更完整', '挑战日期文案升级为日期+星期，便于快速识别日历'] },
  { version: '0.41.0', notes: ['跨天后每日挑战自动刷新，无需手动重开', 'HUD 新增挑战日期显示，便于核对本地日历'] },
  { version: '0.40.0', notes: ['每日挑战改用本地日期计算，避免跨时区显示错位', 'HUD 新增挑战刷新倒计时，明确信息切换时间点'] },
  { version: '0.39.0', notes: ['新增“明日挑战”HUD预告，方便提前规划玩法', '补全每日挑战选择逻辑并清理重复赋值代码'] },
  { version: '0.38.0', notes: ['新增障碍编辑器：支持坐标导入/导出/清空', '可保存自定义障碍布局并在新局自动应用'] },
  { version: '0.37.0', notes: ['新增每日挑战效果文案展示，规则变化更直观', '新增“新手引导”按钮与首次启动提示，降低上手门槛'] },
  { version: '0.36.0', notes: ['继续拆分 game.js：输入、渲染、模式配置已模块化', '新增 input.js / render.js / modes.js，主文件职责更聚焦'] },
  { version: '0.35.0', notes: ['新增快捷键：R 快速重开、M 静音、H 帮助开关', '输入框聚焦时自动忽略快捷键，避免误触影响文本输入'] },
  { version: '0.34.0', notes: ['创意工坊拆分为独立文件模块，主逻辑更清晰', '为后续继续拆分渲染/输入模块打基础'] },
  { version: '0.33.2', notes: ['创意工坊逻辑模块化，统一预设与分享码应用入口', '便于后续扩展更多工坊功能而不影响主循环'] },
  { version: '0.33.1', notes: ['创意工坊新增预设模板，可一键应用规则组合', '支持限时冲分/肉鸽硬核/无尽练习三种预设'] },
  { version: '0.33.0', notes: ['新增创意工坊：可生成/复制/应用规则代码', '支持快速分享模式、难度、皮肤与开关配置'] },
  { version: '0.32.2', notes: ['新增失焦自动暂停开关，支持不中断后台运行偏好', '设置随本地账号快照一起保存'] },
  { version: '0.32.1', notes: ['新增精简HUD开关，移动端信息展示更聚焦', '显示偏好写入设置并随账号切换恢复'] },
  { version: '0.32.0', notes: ['重写前端布局：信息面板、控制区和记录区重新分层', '统一新视觉风格并保留原有玩法与存档兼容'] },
  { version: '0.31.2', notes: ['新增高对比显示开关，提升界面可读性', '设置会写入本地并跟随账号存档切换'] },
  { version: '0.31.1', notes: ['优化页面显示：统计栏改为网格，移动端布局更紧凑', '修复小屏下控件拥挤与信息可读性问题'] },
  { version: '0.31.0', notes: ['新增连击果：提供连击护航状态并奖励额外分数', '连击在短时间内不会因断档立即重置'] },
  { version: '0.30.0', notes: ['新增版本大事件面板，可查看历史更新重点', '帮助回顾玩法演进，便于老玩家快速上手'] },
  { version: '0.29.0', notes: ['新增帮助面板，集中说明模式、道具和成长建议'] },
  { version: '0.28.0', notes: ['加入肉鸽模式，随机词条与肉鸽点成长'] },
  { version: '0.27.0', notes: ['加入本地账号存档导出/导入（JSON）'] },
  { version: '0.26.0', notes: ['加入本地账号系统，支持玩家切换存档'] },
  { version: '0.25.0', notes: ['无尽模式新增最高关记录与里程碑奖励'] },
  { version: '0.24.0', notes: ['新增无尽关卡模式，分数提升自动升级'] },
  { version: '0.23.0', notes: ['新增磁力果，可吸附附近道具'] },
  { version: '0.22.0', notes: ['新增王冠果，触发随机奖励效果'] },
  { version: '0.21.0', notes: ['加入皮肤装扮系统（经典/霓虹/日落/像素）'] }
];


const codexCatalog = [
  { id: 'food', label: '基础果', hint: '常规食物，稳定加分。' },
  { id: 'bonus', label: '奖励果', hint: '短时出现，高额分数。' },
  { id: 'shield', label: '护盾果', hint: '提供护盾，容错更高。' },
  { id: 'boost', label: '倍率果', hint: '短时间分数 x2。' },
  { id: 'time', label: '时间果', hint: '限时模式可延长倒计时。' },
  { id: 'freeze', label: '冰冻果', hint: '暂时减速，便于走位。' },
  { id: 'phase', label: '相位果', hint: '短时间穿越障碍石。' },
  { id: 'crown', label: '王冠果', hint: '触发随机奖励：加分/护盾/增益时间。' },
  { id: 'magnet', label: '磁力果', hint: '短时间吸附附近道具。' },
  { id: 'combo', label: '连击果', hint: '提供连击护航，短时不断连。' }
];


const skinThemes = {
  classic: { board: '#0f1322', head: '#7dffa5', body: '#22c55e', phaseHead: '#d8b4fe', grid: 'rgba(255,255,255,0.07)' },
  neon: { board: '#130f2b', head: '#c084fc', body: '#a855f7', phaseHead: '#67e8f9', grid: 'rgba(255,255,255,0.1)' },
  sunset: { board: '#2a1220', head: '#fb923c', body: '#f97316', phaseHead: '#fdba74', grid: 'rgba(255,255,255,0.08)' },
  pixel: { board: '#0d1b1e', head: '#2dd4bf', body: '#14b8a6', phaseHead: '#93c5fd', grid: 'rgba(255,255,255,0.06)' }
};

let snake;
let direction;
let pendingDirection;
let food;
let bonusFood = null;
let bonusExpireAt = 0;
let shieldFood = null;
let shieldExpireAt = 0;
let boostFood = null;
let boostExpireAt = 0;
let timeFood = null;
let timeExpireAt = 0;
let freezeFood = null;
let freezeExpireAt = 0;
let phaseFood = null;
let phaseExpireAt = 0;
let crownFood = null;
let crownExpireAt = 0;
let magnetFood = null;
let magnetExpireAt = 0;
let comboFood = null;
let comboExpireAt = 0;
let rocks = [];
let score;
let bestScore = Number(localStorage.getItem('snake-best') || '0');
let bestByMode = { classic: 0, timed: 0, blitz: 0, endless: 0, roguelike: 0 };
let running = false;
let paused = false;
let loopTimer;
let baseSpeed = Number(difficultySelect.value);
let speed = baseSpeed;
let mode = modeSelect.value;
let remainingTime = timedModeDuration;
let level = 1;
let levelTargetScore = 100;
let endlessBestLevel = 0;
let lastTickMs = 0;
let combo = 1;
let lastEatMs = 0;
let shields = 0;
let missionTarget = 120;
let missionAchieved = false;
let foodsEaten = 0;
let totalPlays = 0;
let streakWins = 0;
let playCountedThisRound = false;
let countdownTimer = null;
let challengeRefreshTimer = null;
let muted = false;
let achievements = { score200: false, combo5: false, timedClear: false };
let roundMaxCombo = 1;
let scoreMultiplier = 1;
let multiplierExpireAt = 0;
let freezeUntil = 0;
let phaseUntil = 0;
let magnetUntil = 0;
let comboGuardUntil = 0;
let currentChallenge = SnakeModes.dailyChallengeOptions[0];
let currentChallengeSeed = 0;
let lastChallengeCountdownText = '';
let obstacleModePreference = obstacleModeInput.checked;
let modePreference = modeSelect.value;


let lastResult = { score: 0, mode: 'classic', ts: 0 };
let history = [];
let discoveredCodex = {};
let currentSkin = 'classic';
let dlcPack = 'none';
let startBonusSecondsThisRound = 0;
let fruitTimeBonusSeconds = 0;
let crownTimeBonusSeconds = 0;
let scoreFromFood = 0;
let scoreFromBonus = 0;
let scoreFromTimeFruit = 0;
let scoreFromCrown = 0;
let scoreFromComboFruit = 0;
let scoreFromComboChain = 0;
let scoreFromMilestone = 0;
let activeAccount = '';
let accountStore = {};
let roguePerks = 0;
let rogueMutatorLabel = '--';
let rogueSpeedDelta = 0;
let rogueScoreBonus = 0;
let rogueComboWindowBonus = 0;
let rogueStartShield = 0;
let customRocks = [];

bestEl.textContent = String(bestScore);
versionTag.textContent = `v${GAME_VERSION}`;
versionTag.title = `Snake build ${GAME_VERSION}`;
bestLevelEl.textContent = '0';
roguePerksEl.textContent = '0';
rogueMutatorEl.textContent = '--';
refreshDlcHud();


function applyChallengeControlLocks() {
  const lockRocks = Boolean(currentChallenge.noRocks);
  if (lockRocks) {
    if (!obstacleModeInput.disabled) obstacleModePreference = obstacleModeInput.checked;
    obstacleModeInput.checked = false;
    obstacleModeInput.disabled = true;
    obstacleModeInput.title = '今日挑战：净空模式（障碍规则已锁定为关闭）';
  } else {
    obstacleModeInput.disabled = false;
    obstacleModeInput.title = '';
    obstacleModeInput.checked = obstacleModePreference;
  }

  const forceMode = currentChallenge.forceMode;
  if (forceMode) {
    if (!modeSelect.disabled) modePreference = modeSelect.value;
    modeSelect.disabled = true;
    if (running) {
      modeSelect.title = `今日挑战：下一局将锁定为${SnakeModes.getModeLabel(forceMode)}`;
      return;
    }
    modeSelect.value = forceMode;
    mode = forceMode;
    modeSelect.title = `今日挑战：模式锁定为${SnakeModes.getModeLabel(forceMode)}`;
    return;
  }

  if (modeSelect.disabled && !running) {
    modeSelect.value = modePreference;
    mode = modePreference;
  }
  modeSelect.disabled = false;
  modeSelect.title = '';
}

function updateChallengeCountdownOnly() {
  const text = SnakeModes.getChallengeRefreshCountdown();
  if (text === lastChallengeCountdownText) return;
  lastChallengeCountdownText = text;
  challengeRefreshEl.textContent = text;
}

function refreshChallengeHud() {
  challengeEl.textContent = currentChallenge.label;
  challengeDetailEl.textContent = SnakeModes.describeChallenge(currentChallenge);
  const nextChallenge = SnakeModes.pickDailyChallengeByOffset(1);
  challengeNextEl.textContent = nextChallenge.label;
  challengeNextEl.title = SnakeModes.describeChallenge(nextChallenge);
  challengeNextDateEl.textContent = SnakeModes.formatRelativeLocalDateLabel(1);
  challengeDateEl.textContent = SnakeModes.formatLocalDateLabel();
  applyChallengeControlLocks();
  lastChallengeCountdownText = '';
  updateChallengeCountdownOnly();
}

function selectDailyChallenge() {
  currentChallenge = SnakeModes.pickDailyChallenge();
  currentChallengeSeed = SnakeModes.getLocalDateSeed();
  refreshChallengeHud();
}

function refreshChallengeByDateIfNeeded() {
  const latestSeed = SnakeModes.getLocalDateSeed();
  if (latestSeed === currentChallengeSeed) {
    updateChallengeCountdownOnly();
    return;
  }
  selectDailyChallenge();
}

function startChallengeRefreshTicker() {
  clearInterval(challengeRefreshTimer);
  refreshChallengeByDateIfNeeded();
  challengeRefreshTimer = setInterval(refreshChallengeByDateIfNeeded, 1000);
}

function getDlcStatusText() {
  if (dlcPack === 'frenzy') return '狂热（奖励果+10，刷新更频繁）';
  if (dlcPack === 'guardian') return '守护（开局护盾+1）';
  if (dlcPack === 'chrono') return '时序（限时开局+8秒）';
  return '关闭';
}

function refreshDlcHud() {
  dlcStatusEl.textContent = getDlcStatusText();
}

function addScore(points, source = '') {
  const delta = Number(points || 0);
  if (!delta) return;
  score += delta;
  if (source === 'food') scoreFromFood += delta;
  else if (source === 'bonus') scoreFromBonus += delta;
  else if (source === 'timeFruit') scoreFromTimeFruit += delta;
  else if (source === 'crown') scoreFromCrown += delta;
  else if (source === 'comboFruit') scoreFromComboFruit += delta;
  else if (source === 'comboChain') scoreFromComboChain += delta;
  else if (source === 'milestone') scoreFromMilestone += delta;
}

function refreshSettlementPanel(extra = {}) {
  const modeLabel = SnakeModes.getModeLabel(mode);
  const lines = [
    `模式：${modeLabel}`,
    `DLC：${getDlcStatusText()}`,
    `得分：${score}`,
    `得分拆分：基础果 ${scoreFromFood} / 奖励果 ${scoreFromBonus} / 时间果 ${scoreFromTimeFruit} / 王冠 ${scoreFromCrown} / 连击果 ${scoreFromComboFruit} / 连击奖励 ${scoreFromComboChain} / 里程碑 ${scoreFromMilestone}`
  ];

  if (isTimerMode()) {
    lines.push(`开局加时：+${startBonusSecondsThisRound}s`);
    lines.push(`时间果加时：+${fruitTimeBonusSeconds}s`);
    lines.push(`王冠加时：+${crownTimeBonusSeconds}s`);
    if (typeof extra.remainingTime === 'number') lines.push(`结束剩余：${Math.max(0, Math.ceil(extra.remainingTime))}s`);
  }

  settlementListEl.innerHTML = lines.map((line) => `<li>${line}</li>`).join('');
}

function getBonusStep() {
  const base = currentChallenge.bonusStep || 50;
  const dlcDelta = dlcPack === 'frenzy' ? -20 : 0;
  return Math.max(20, base + dlcDelta);
}

function getStorageKeysForProfile() {
  return [
    'snake-best', settingsKey, statsKey, audioKey, bestByModeKey,
    achievementsKey, lastResultKey, historyKey, codexKey, endlessBestLevelKey, rogueMetaKey, customRocksKey
  ];
}

function captureProfileSnapshot() {
  const snapshot = {};
  for (const key of getStorageKeysForProfile()) {
    const value = localStorage.getItem(key);
    if (value !== null) snapshot[key] = value;
  }
  return snapshot;
}

function applyProfileSnapshot(snapshot) {
  const keys = getStorageKeysForProfile();
  for (const key of keys) localStorage.removeItem(key);
  for (const [key, value] of Object.entries(snapshot || {})) {
    if (keys.includes(key) && typeof value === 'string') localStorage.setItem(key, value);
  }
}

function refreshAccountUI() {
  accountNameEl.textContent = activeAccount || '游客';
}

function saveAccountStore() {
  localStorage.setItem(accountStoreKey, JSON.stringify(accountStore));
}

function loadAccountStore() {
  try {
    accountStore = JSON.parse(localStorage.getItem(accountStoreKey) || '{}') || {};
  } catch {
    accountStore = {};
  }
}

function saveActiveAccountSnapshot() {
  if (!activeAccount) return;
  accountStore[activeAccount] = captureProfileSnapshot();
  saveAccountStore();
}

function reloadAllFromStorage() {
  loadLifetimeStats();
  loadHistory();
  loadCodex();
  loadEndlessBestLevel();
  loadRogueMeta();
  loadLastResult();
  loadAchievements();
  loadAudioSetting();
  loadBestByMode();
  loadSettings();
  loadCustomRocks();
  currentSkin = skinSelect.value;
  dlcPack = dlcPackSelect.value;
  mode = modeSelect.value;
  updateLevelText();
  baseSpeed = Number(difficultySelect.value);
  applyContrastMode();
  applyMiniHudMode();
  refreshModeBestText();
  resetGame(true);
}

function loginAccount(name) {
  const username = name.trim();
  if (!username) return;
  saveActiveAccountSnapshot();
  activeAccount = username;
  localStorage.setItem(currentAccountKey, activeAccount);
  applyProfileSnapshot(accountStore[activeAccount] || {});
  refreshAccountUI();
  reloadAllFromStorage();
}

function logoutAccount() {
  saveActiveAccountSnapshot();
  activeAccount = '';
  localStorage.removeItem(currentAccountKey);
  applyProfileSnapshot({});
  refreshAccountUI();
  reloadAllFromStorage();
}

function exportSaveData() {
  saveActiveAccountSnapshot();
  const payload = {
    version: GAME_VERSION,
    exportedAt: new Date().toISOString(),
    currentAccount: activeAccount,
    accounts: accountStore,
    guest: captureProfileSnapshot()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `snake-save-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function importSaveData(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object') throw new Error('bad format');
    accountStore = (parsed.accounts && typeof parsed.accounts === 'object') ? parsed.accounts : {};
    saveAccountStore();
    activeAccount = typeof parsed.currentAccount === 'string' ? parsed.currentAccount.trim() : '';
    if (activeAccount) localStorage.setItem(currentAccountKey, activeAccount);
    else localStorage.removeItem(currentAccountKey);
    if (activeAccount && accountStore[activeAccount]) applyProfileSnapshot(accountStore[activeAccount]);
    else applyProfileSnapshot((parsed.guest && typeof parsed.guest === 'object') ? parsed.guest : {});
    refreshAccountUI();
    reloadAllFromStorage();
    showOverlay('<p><strong>✅ 导入成功</strong></p><p>存档已恢复</p>');
    setTimeout(() => { if (running && !paused) hideOverlay(); }, 800);
  } catch {
    showOverlay('<p><strong>导入失败</strong></p><p>存档文件无效</p>');
    setTimeout(() => { if (running && !paused) hideOverlay(); }, 900);
  } finally {
    importSaveInput.value = '';
  }
}

const Workshop = window.SnakeWorkshop.createWorkshopModule({
  version: GAME_VERSION,
  inputEl: workshopCodeInput,
  isValidMode: (value) => value === 'classic' || value === 'timed' || value === 'blitz' || value === 'endless' || value === 'roguelike',
  isValidDifficulty: (value) => ['140', '110', '80'].includes(String(value)),
  isValidSkin: (value) => Object.hasOwn(skinThemes, value),
  isValidDlcPack: (value) => value === 'none' || value === 'frenzy' || value === 'guardian' || value === 'chrono',
  applyVisualModes: () => {
    applyContrastMode();
    applyMiniHudMode();
  },
  saveSettings,
  syncRuntime: ({ skin, mode, difficulty }) => {
    currentSkin = skin;
    mode = mode;
    baseSpeed = Number(difficulty);
    updateLevelText();
    refreshModeBestText();
  },
  resetAndRefresh: () => resetGame(true)
});

function getModeSettingValue() {
  if (modeSelect.disabled) return modePreference;
  return modeSelect.value;
}

function getObstacleModeSettingValue() {
  if (obstacleModeInput.disabled) return obstacleModePreference;
  return obstacleModeInput.checked;
}

function getWorkshopStateSnapshot() {
  return {
    mode: getModeSettingValue(),
    difficulty: difficultySelect.value,
    skin: skinSelect.value,
    dlcPack: dlcPackSelect.value,
    wrapMode: wrapModeInput.checked,
    obstacleMode: getObstacleModeSettingValue(),
    hardcoreMode: hardcoreModeInput.checked,
    contrastMode: contrastModeInput.checked,
    miniHudMode: miniHudModeInput.checked,
    autoPauseMode: autoPauseModeInput.checked
  };
}

function applyWorkshopControls(next) {
  if (next.mode !== undefined) modeSelect.value = next.mode;
  modePreference = modeSelect.value;
  if (next.difficulty !== undefined) difficultySelect.value = next.difficulty;
  if (next.skin !== undefined) skinSelect.value = next.skin;
  if (next.dlcPack !== undefined) dlcPackSelect.value = next.dlcPack;
  wrapModeInput.checked = Boolean(next.wrapMode);
  obstacleModeInput.checked = next.obstacleMode !== false;
  obstacleModePreference = obstacleModeInput.checked;
  hardcoreModeInput.checked = Boolean(next.hardcoreMode);
  contrastModeInput.checked = Boolean(next.contrastMode);
  miniHudModeInput.checked = Boolean(next.miniHudMode);
  autoPauseModeInput.checked = next.autoPauseMode !== false;
}

function applyContrastMode() {
  document.body.classList.toggle('high-contrast', Boolean(contrastModeInput?.checked));
}

function applyMiniHudMode() {
  document.body.classList.toggle('compact-hud', Boolean(miniHudModeInput?.checked));
}

function normalizeSettingsPayload(raw = {}) {
  const normalized = { ...(raw || {}) };
  if (!('schemaVersion' in normalized)) normalized.schemaVersion = 1;
  if (normalized.schemaVersion < 2) {
    if (!('dlcPack' in normalized)) normalized.dlcPack = 'none';
    normalized.schemaVersion = 2;
  }
  if (!['none', 'frenzy', 'guardian', 'chrono'].includes(String(normalized.dlcPack))) {
    normalized.dlcPack = 'none';
  }
  return normalized;
}

function maybePersistSettingsMigration(normalized, raw) {
  if (!normalized || !raw || normalized.schemaVersion === raw.schemaVersion) return;
  localStorage.setItem(settingsKey, JSON.stringify(normalized));
}

function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(settingsKey) || '{}');
    const parsed = normalizeSettingsPayload(raw);
    maybePersistSettingsMigration(parsed, raw);
    if (parsed.mode === 'classic' || parsed.mode === 'timed' || parsed.mode === 'blitz' || parsed.mode === 'endless' || parsed.mode === 'roguelike') modeSelect.value = parsed.mode;
    modePreference = modeSelect.value;
    if (['140', '110', '80'].includes(String(parsed.difficulty))) difficultySelect.value = String(parsed.difficulty);
    if (Object.hasOwn(skinThemes, parsed.skin)) skinSelect.value = parsed.skin;
    dlcPackSelect.value = parsed.dlcPack;
    wrapModeInput.checked = Boolean(parsed.wrapMode);
    obstacleModeInput.checked = parsed.obstacleMode !== false;
    obstacleModePreference = obstacleModeInput.checked;
    hardcoreModeInput.checked = Boolean(parsed.hardcoreMode);
    contrastModeInput.checked = Boolean(parsed.contrastMode);
    miniHudModeInput.checked = Boolean(parsed.miniHudMode);
    autoPauseModeInput.checked = parsed.autoPauseMode !== false;
  } catch {
    // ignore malformed settings
  }
  applyContrastMode();
  applyMiniHudMode();
}

function saveSettings() {
  localStorage.setItem(settingsKey, JSON.stringify({
    schemaVersion: settingsSchemaVersion,
    mode: getModeSettingValue(),
    difficulty: difficultySelect.value,
    skin: skinSelect.value,
    dlcPack: dlcPackSelect.value,
    wrapMode: wrapModeInput.checked,
    obstacleMode: getObstacleModeSettingValue(),
    hardcoreMode: hardcoreModeInput.checked,
    contrastMode: contrastModeInput.checked,
    miniHudMode: miniHudModeInput.checked,
    autoPauseMode: autoPauseModeInput.checked
  }));
  saveActiveAccountSnapshot();
}








function defaultCodexState() {
  return Object.fromEntries(codexCatalog.map(item => [item.id, false]));
}

function refreshCodex() {
  const discoveredCount = codexCatalog.filter(item => discoveredCodex[item.id]).length;
  codexProgressEl.textContent = `${discoveredCount}/${codexCatalog.length}`;
  codexListEl.innerHTML = codexCatalog.map(item => {
    if (!discoveredCodex[item.id]) return `<li>❓ 未发现道具</li>`;
    return `<li>✅ <strong>${item.label}</strong>：${item.hint}</li>`;
  }).join('');
}

function saveCodex() {
  localStorage.setItem(codexKey, JSON.stringify(discoveredCodex));
}

function loadCodex() {
  const base = defaultCodexState();
  try {
    const parsed = JSON.parse(localStorage.getItem(codexKey) || '{}');
    discoveredCodex = { ...base, ...parsed };
  } catch {
    discoveredCodex = base;
  }
  refreshCodex();
}

function discoverCodex(id, label) {
  if (discoveredCodex[id]) return;
  discoveredCodex[id] = true;
  saveCodex();
  refreshCodex();
  if (running && !paused) {
    showOverlay(`<p><strong>📘 图鉴解锁</strong></p><p>${label}</p>`);
    setTimeout(() => {
      if (running && !paused) hideOverlay();
    }, 750);
  }
}

function renderVersionEvents() {
  const recent = versionEvents.slice(0, 8);
  versionEventsListEl.innerHTML = recent.map(item => {
    const head = item.version === GAME_VERSION ? `v${item.version}（当前）` : `v${item.version}`;
    const body = item.notes.map(note => `• ${note}`).join('；');
    return `<li><strong>${head}</strong>：${body}</li>`;
  }).join('');
}

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(historyKey) || '[]');
    history = Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    history = [];
  }
  renderHistory();
}

function saveHistory() {
  localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 5)));
  saveActiveAccountSnapshot();
}

function addHistoryEntry(score, modeName) {
  history.unshift({ score, mode: modeName, ts: Date.now() });
  history = history.slice(0, 5);
  saveHistory();
  renderHistory();
}

function renderHistory() {
  if (!history.length) {
    historyListEl.innerHTML = '<li>暂无记录</li>';
    return;
  }
  historyListEl.innerHTML = history
    .map(item => {
      const modeLabel = SnakeModes.getModeLabel(item.mode).replace('模式', '');
      const d = new Date(item.ts || Date.now());
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `<li>${modeLabel}：${item.score} 分 <small>(${hh}:${mm})</small></li>`;
    })
    .join('');
}

function loadLastResult() {
  try {
    const parsed = JSON.parse(localStorage.getItem(lastResultKey) || '{}');
    lastResult.score = Number(parsed.score || 0);
    lastResult.mode = (parsed.mode === 'timed' || parsed.mode === 'blitz' || parsed.mode === 'endless' || parsed.mode === 'roguelike') ? parsed.mode : 'classic';
    lastResult.ts = Number(parsed.ts || 0);
  } catch {
    lastResult = { score: 0, mode: 'classic', ts: 0 };
  }
  refreshLastResultText();
}

function saveLastResult() {
  localStorage.setItem(lastResultKey, JSON.stringify(lastResult));
  saveActiveAccountSnapshot();
}

function refreshLastResultText() {
  if (!lastResult.ts) {
    lastResultEl.textContent = '--';
    return;
  }
  const modeLabel = SnakeModes.getModeLabel(lastResult.mode).replace('模式', '');
  lastResultEl.textContent = `${modeLabel} ${lastResult.score}分`;
}

function loadAchievements() {
  try {
    const parsed = JSON.parse(localStorage.getItem(achievementsKey) || '{}');
    achievements.score200 = Boolean(parsed.score200);
    achievements.combo5 = Boolean(parsed.combo5);
    achievements.timedClear = Boolean(parsed.timedClear);
  } catch {
    achievements = { score200: false, combo5: false, timedClear: false };
  }
  refreshAchievementsText();
}

function saveAchievements() {
  localStorage.setItem(achievementsKey, JSON.stringify(achievements));
  saveActiveAccountSnapshot();
}

function refreshAchievementsText() {
  const count = Number(achievements.score200) + Number(achievements.combo5) + Number(achievements.timedClear);
  achievementsEl.textContent = `${count}/3`;
}

function unlockAchievement(key, label) {
  if (achievements[key]) return;
  achievements[key] = true;
  saveAchievements();
  refreshAchievementsText();
  if (running && !paused) {
    showOverlay(`<p><strong>🏆 解锁成就</strong></p><p>${label}</p>`);
    setTimeout(() => {
      if (running && !paused) hideOverlay();
    }, 800);
  }
}

function loadAudioSetting() {
  muted = localStorage.getItem(audioKey) === '1';
  muteBtn.textContent = muted ? '🔇 音效关' : '🔊 音效开';
}

function saveAudioSetting() {
  localStorage.setItem(audioKey, muted ? '1' : '0');
  muteBtn.textContent = muted ? '🔇 音效关' : '🔊 音效开';
  saveActiveAccountSnapshot();
}

function beep(type = 'eat') {
  if (muted) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  if (!beep.ctx) beep.ctx = new AudioCtx();
  const ctx = beep.ctx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  const map = { eat: [620, 0.06], bonus: [820, 0.09], hit: [180, 0.14], mission: [980, 0.12] };
  const [freq, dur] = map[type] || map.eat;
  osc.frequency.value = freq;
  gain.gain.value = 0.0001;
  const t = ctx.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.05, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.01);
}

function loadBestByMode() {
  try {
    const parsed = JSON.parse(localStorage.getItem(bestByModeKey) || '{}');
    bestByMode.classic = Number(parsed.classic || 0);
    bestByMode.timed = Number(parsed.timed || 0);
    bestByMode.blitz = Number(parsed.blitz || 0);
    bestByMode.endless = Number(parsed.endless || 0);
    bestByMode.roguelike = Number(parsed.roguelike || 0);
  } catch {
    bestByMode = { classic: 0, timed: 0, blitz: 0, endless: 0, roguelike: 0 };
  }
}

function saveBestByMode() {
  localStorage.setItem(bestByModeKey, JSON.stringify(bestByMode));
  saveActiveAccountSnapshot();
}

function refreshModeBestText() {
  modeBestEl.textContent = String(bestByMode[mode] || 0);
}

function loadLifetimeStats() {
  try {
    const parsed = JSON.parse(localStorage.getItem(statsKey) || '{}');
    foodsEaten = Number(parsed.foodsEaten || 0);
    totalPlays = Number(parsed.totalPlays || 0);
    streakWins = Number(parsed.streakWins || 0);
  } catch {
    foodsEaten = 0;
    totalPlays = 0;
    streakWins = 0;
  }
  foodsEl.textContent = String(foodsEaten);
  playsEl.textContent = String(totalPlays);
  streakEl.textContent = String(streakWins);
}

function saveLifetimeStats() {
  localStorage.setItem(statsKey, JSON.stringify({ foodsEaten, totalPlays, streakWins }));
  saveActiveAccountSnapshot();
}

function loadEndlessBestLevel() {
  endlessBestLevel = Number(localStorage.getItem(endlessBestLevelKey) || '0');
  bestLevelEl.textContent = String(endlessBestLevel);
}

function saveEndlessBestLevel() {
  localStorage.setItem(endlessBestLevelKey, String(endlessBestLevel));
  bestLevelEl.textContent = String(endlessBestLevel);
  saveActiveAccountSnapshot();
}

function loadRogueMeta() {
  try {
    const parsed = JSON.parse(localStorage.getItem(rogueMetaKey) || '{}');
    roguePerks = Number(parsed.perks || 0);
  } catch {
    roguePerks = 0;
  }
  roguePerksEl.textContent = String(roguePerks);
}

function saveRogueMeta() {
  localStorage.setItem(rogueMetaKey, JSON.stringify({ perks: roguePerks }));
  roguePerksEl.textContent = String(roguePerks);
  saveActiveAccountSnapshot();
}

function applyRoguelikeMutator() {
  rogueSpeedDelta = 0;
  rogueScoreBonus = 0;
  rogueComboWindowBonus = 0;
  rogueStartShield = 0;
  rogueMutatorLabel = '--';

  if (mode !== 'roguelike') {
    rogueMutatorEl.textContent = '--';
refreshDlcHud();
    return;
  }

  const pool = [
    { label: '疾风', speedDelta: -10, comboWindowBonus: -200 },
    { label: '丰收', scoreBonus: 2 },
    { label: '稳健', startShield: 1 },
    { label: '连击', comboWindowBonus: 350 }
  ];
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const perkBoost = Math.min(roguePerks, 10);
  rogueMutatorLabel = pick.label;
  rogueSpeedDelta = (pick.speedDelta || 0) - Math.floor(perkBoost / 4);
  rogueScoreBonus = (pick.scoreBonus || 0) + Math.floor(perkBoost / 3);
  rogueComboWindowBonus = (pick.comboWindowBonus || 0) + Math.floor(perkBoost / 2) * 20;
  rogueStartShield = pick.startShield ? 1 : 0;
  rogueMutatorEl.textContent = rogueMutatorLabel;
}


function toggleHelp(show) {
  helpPanel.style.display = show ? 'block' : 'none';
}

function maybeShowOnboarding() {
  if (localStorage.getItem(onboardingKey) === '1') return;
  toggleHelp(true);
  showOverlay('<p><strong>欢迎来到贪吃蛇</strong></p><p>先看帮助面板，再按方向键开局</p>');
  setTimeout(() => { if (!running || paused) hideOverlay(); }, 1400);
  localStorage.setItem(onboardingKey, '1');
}

function showOverlay(message) { overlay.innerHTML = `<div>${message}</div>`; overlay.style.display = 'grid'; }
function hideOverlay() { overlay.style.display = 'none'; }
function isTimerMode() { return mode === 'timed' || mode === 'blitz'; }

function getTimerStartBonusSeconds() {
  if (dlcPack === 'chrono') return 8;
  return 0;
}

function getTimeFruitBonusSeconds() {
  return dlcPack === 'chrono' ? 8 : 5;
}

function getCrownTimeBonusSeconds() {
  return dlcPack === 'chrono' ? 10 : 7;
}

function getModeTimeDuration() { return mode === 'blitz' ? blitzModeDuration : timedModeDuration; }
function updateTimeText() { timeEl.textContent = isTimerMode() ? `${Math.max(0, Math.ceil(remainingTime))}s` : '--'; }
function updateLevelText() { levelEl.textContent = mode === 'endless' ? `L${level}` : '--'; }

function normalizeRockList(list) {
  const used = new Set();
  const blocked = new Set(['8,12', '7,12', '6,12']);
  const normalized = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const x = Number(item.x);
    const y = Number(item.y);
    if (!Number.isInteger(x) || !Number.isInteger(y)) continue;
    if (x < 0 || y < 0 || x >= tileCount || y >= tileCount) continue;
    const key = `${x},${y}`;
    if (used.has(key) || blocked.has(key)) continue;
    used.add(key);
    normalized.push({ x, y });
  }
  return normalized.slice(0, 20);
}

function parseRockEditorText(raw) {
  const rows = String(raw || '').split(/\n+/).map(line => line.trim()).filter(Boolean);
  const parsed = rows.map((line) => {
    const parts = line.split(',').map(v => v.trim());
    if (parts.length !== 2) return null;
    return { x: Number(parts[0]), y: Number(parts[1]) };
  });
  return normalizeRockList(parsed);
}

function encodeRocks(rockList) {
  return rockList.map(item => `${item.x},${item.y}`).join('\n');
}

function saveCustomRocks() {
  localStorage.setItem(customRocksKey, JSON.stringify(customRocks));
  if (rockEditorInput) rockEditorInput.value = encodeRocks(customRocks);
}

function loadCustomRocks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(customRocksKey) || '[]');
    customRocks = normalizeRockList(Array.isArray(parsed) ? parsed : []);
  } catch {
    customRocks = [];
  }
  if (rockEditorInput) rockEditorInput.value = encodeRocks(customRocks);
}

function resetGame(showStartOverlay = true) {
  snake = [{ x: 8, y: 12 }, { x: 7, y: 12 }, { x: 6, y: 12 }];
  direction = { x: 1, y: 0 };
  pendingDirection = direction;
  dlcPack = dlcPackSelect.value;
  rocks = customRocks.map(item => ({ ...item }));
  food = randomFoodPosition();
  bonusFood = null;
  bonusExpireAt = 0;
  shieldFood = null;
  shieldExpireAt = 0;
  boostFood = null;
  boostExpireAt = 0;
  timeFood = null;
  timeExpireAt = 0;
  freezeFood = null;
  freezeExpireAt = 0;
  phaseFood = null;
  phaseExpireAt = 0;
  crownFood = null;
  crownExpireAt = 0;
  magnetFood = null;
  magnetExpireAt = 0;
  comboFood = null;
  comboExpireAt = 0;
  score = 0;
  running = false;
  paused = false;
  refreshChallengeHud();
  refreshDlcHud();
  startBonusSecondsThisRound = isTimerMode() ? getTimerStartBonusSeconds() : 0;
  fruitTimeBonusSeconds = 0;
  crownTimeBonusSeconds = 0;
  scoreFromFood = 0;
  scoreFromBonus = 0;
  scoreFromTimeFruit = 0;
  scoreFromCrown = 0;
  scoreFromComboFruit = 0;
  scoreFromComboChain = 0;
  scoreFromMilestone = 0;
  remainingTime = getModeTimeDuration() + startBonusSecondsThisRound;
  level = 1;
  levelTargetScore = 100;
  lastTickMs = 0;
  const hardcoreDelta = hardcoreModeInput.checked ? -20 : 0;
  applyRoguelikeMutator();
  speed = Math.max(45, baseSpeed + (currentChallenge.speedDelta || 0) + hardcoreDelta + rogueSpeedDelta);
  combo = 1;
  roundMaxCombo = 1;
  lastEatMs = 0;
  shields = hardcoreModeInput.checked ? 0 : (currentChallenge.startShield || 0);
  if (!hardcoreModeInput.checked) {
    shields = Math.min(2, shields + rogueStartShield);
    if (dlcPack === 'guardian') shields = Math.min(2, shields + 1);
  }
  missionTarget = missionOptions[Math.floor(Math.random() * missionOptions.length)];
  missionAchieved = false;
  playCountedThisRound = false;
  clearInterval(loopTimer);
  clearInterval(countdownTimer);
  clearInterval(challengeRefreshTimer);
  pauseBtn.textContent = '暂停';
  scoreEl.textContent = '0';
  lengthEl.textContent = String(snake.length);
  comboEl.textContent = 'x1';
  shieldEl.textContent = String(shields);
  missionEl.textContent = `${missionTarget}分`;
  scoreMultiplier = 1;
  multiplierExpireAt = 0;
  multiplierEl.textContent = 'x1';
  freezeUntil = 0;
  phaseUntil = 0;
  magnetUntil = 0;
  comboGuardUntil = 0;
  refreshStateText();
  startChallengeRefreshTicker();
  updateTimeText();
  updateLevelText();
  if (showStartOverlay) showOverlay('<p><strong>按方向键开始游戏</strong></p><p>W/A/S/D、触屏方向键或滑动都可控制</p>');
  renderer.draw();
}

function isOnSnake(cell) { return snake.some(seg => seg.x === cell.x && seg.y === cell.y); }

function randomFreeCell() {
  let position;
  do {
    position = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
  } while (
    isOnSnake(position) ||
    (food && food.x === position.x && food.y === position.y) ||
    (bonusFood && bonusFood.x === position.x && bonusFood.y === position.y) ||
    (shieldFood && shieldFood.x === position.x && shieldFood.y === position.y) ||
    (boostFood && boostFood.x === position.x && boostFood.y === position.y) ||
    (timeFood && timeFood.x === position.x && timeFood.y === position.y) ||
    (freezeFood && freezeFood.x === position.x && freezeFood.y === position.y) ||
    (phaseFood && phaseFood.x === position.x && phaseFood.y === position.y) ||
    (crownFood && crownFood.x === position.x && crownFood.y === position.y) ||
    (magnetFood && magnetFood.x === position.x && magnetFood.y === position.y) ||
    (comboFood && comboFood.x === position.x && comboFood.y === position.y) ||
    rocks.some(rock => rock.x === position.x && rock.y === position.y)
  );
  return position;
}

function randomFoodPosition() { return randomFreeCell(); }

function maybeSpawnBonusFood(now) {
  if (bonusFood || score === 0) return;
  if (score % getBonusStep() !== 0) return;
  bonusFood = randomFreeCell();
  bonusExpireAt = now + 3200;
}

function maybeSpawnShieldFood(now) {
  if (hardcoreModeInput.checked) return;
  if (shieldFood || shields >= 2) return;
  if (score < 60) return;
  if (score % 70 !== 0) return;
  shieldFood = randomFreeCell();
  shieldExpireAt = now + 4500;
}


function maybeSpawnBoostFood(now) {
  if (boostFood || score < 80) return;
  if (score % 90 !== 0) return;
  boostFood = randomFreeCell();
  boostExpireAt = now + 4200;
}


function maybeSpawnTimeFood(now) {
  if (timeFood || score < 50) return;
  if (score % 75 !== 0) return;
  timeFood = randomFreeCell();
  timeExpireAt = now + 4600;
}


function maybeSpawnFreezeFood(now) {
  if (freezeFood || score < 40) return;
  if (score % 65 !== 0) return;
  freezeFood = randomFreeCell();
  freezeExpireAt = now + 4200;
}

function maybeSpawnPhaseFood(now) {
  if (phaseFood || score < 70) return;
  if (score % 85 !== 0) return;
  phaseFood = randomFreeCell();
  phaseExpireAt = now + 4500;
}

function maybeSpawnCrownFood(now) {
  if (crownFood || score < 100) return;
  if (score % 110 !== 0) return;
  crownFood = randomFreeCell();
  crownExpireAt = now + 5000;
}

function maybeSpawnMagnetFood(now) {
  if (magnetFood || score < 90) return;
  if (score % 95 !== 0) return;
  magnetFood = randomFreeCell();
  magnetExpireAt = now + 4300;
}

function maybeSpawnComboFood(now) {
  if (comboFood || score < 70) return;
  if (combo < 4) return;
  if (score % 75 !== 0) return;
  comboFood = randomFreeCell();
  comboExpireAt = now + 4200;
}

function effectiveSpeed() {
  const slowed = performance.now() < freezeUntil;
  return speed + (slowed ? 40 : 0);
}

function refreshStateText(now = performance.now()) {
  const states = [];
  if (now < freezeUntil) states.push('减速');
  if (now < phaseUntil) states.push('相位');
  if (now < magnetUntil) states.push('磁吸');
  if (now < comboGuardUntil) states.push('连击护航');
  stateEl.textContent = states.join('+') || '正常';
}

function maybeAddRock() {
  if (!obstacleModeInput.checked || currentChallenge.noRocks) return;
  if (customRocks.length) return;
  if (score < 80) return;
  if (score % 40 !== 0) return;
  if (rocks.length >= 8) return;
  rocks.push(randomFreeCell());
}

function startLoop() {
  clearInterval(loopTimer);
  clearInterval(countdownTimer);
  lastTickMs = performance.now();
  loopTimer = setInterval(update, effectiveSpeed());
}

function startGameIfNeeded() {
  if (running && !paused) return;
  if (!running) {
    running = true;
    paused = false;
    if (!playCountedThisRound) {
      totalPlays += 1;
      playsEl.textContent = String(totalPlays);
      saveLifetimeStats();
      playCountedThisRound = true;
    }
    pauseBtn.textContent = '暂停';
    startCountdown(() => {
      if (paused || !running) return;
      hideOverlay();
      startLoop();
    });
    return;
  }
  if (paused) {
    paused = false;
    hideOverlay();
    pauseBtn.textContent = '暂停';
    startLoop();
  }
}


function startCountdown(onDone) {
  clearInterval(countdownTimer);
  let count = 3;
  showOverlay(`<p><strong>${count}</strong></p><p>准备开始</p>`);
  countdownTimer = setInterval(() => {
    if (paused || !running) {
      clearInterval(countdownTimer);
      return;
    }
    count -= 1;
    if (count <= 0) {
      clearInterval(countdownTimer);
      onDone();
      return;
    }
    showOverlay(`<p><strong>${count}</strong></p><p>准备开始</p>`);
  }, 550);
}

function changeDirection(next) {
  const isReverse = next.x === -direction.x && next.y === -direction.y;
  if (!isReverse) pendingDirection = next;
  startGameIfNeeded();
}

function togglePause() {
  if (!running) return;
  if (paused) return startGameIfNeeded();
  paused = true;
  clearInterval(loopTimer);
  clearInterval(countdownTimer);
  pauseBtn.textContent = '继续';
  showOverlay('<p><strong>已暂停</strong></p><p>按空格 / P 或“继续”恢复游戏</p>');
}

function shouldIgnoreHotkeys(event) {
  if (event.metaKey || event.ctrlKey || event.altKey) return true;
  const active = document.activeElement;
  if (!active) return false;
  if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active instanceof HTMLSelectElement) return true;
  return active.isContentEditable;
}

function isCollision(head) {
  const inPhase = performance.now() < phaseUntil;
  const hitWall = !wrapModeInput.checked && (head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount);
  const hitSelf = snake.some(seg => seg.x === head.x && seg.y === head.y);
  const hitRock = !inPhase && rocks.some(rock => rock.x === head.x && rock.y === head.y);
  return hitWall || hitSelf || hitRock;
}

function endGame(reasonText) {
  clearInterval(loopTimer);
  clearInterval(countdownTimer);
  running = false;
  paused = false;

  if (isTimerMode() && reasonText.includes('时间到')) {
    streakWins += 1;
  } else {
    streakWins = 0;
  }
  streakEl.textContent = String(streakWins);
  saveLifetimeStats();

  if (score > bestScore) {
    bestScore = score;
    bestEl.textContent = String(bestScore);
    localStorage.setItem('snake-best', String(bestScore));
    saveActiveAccountSnapshot();
  }

  if (score > (bestByMode[mode] || 0)) {
    bestByMode[mode] = score;
    saveBestByMode();
    refreshModeBestText();
  }

  if (mode === 'endless' && level > endlessBestLevel) {
    endlessBestLevel = level;
    saveEndlessBestLevel();
  }

  refreshSettlementPanel({ remainingTime });
  lastResult = { score, mode, ts: Date.now() };
  saveLastResult();
  refreshLastResultText();
  addHistoryEntry(score, mode);

  if (score >= 200) unlockAchievement('score200', '高分达人（单局 200 分）');
  if (roundMaxCombo >= 5) unlockAchievement('combo5', '连击高手（连击达到 x5）');
  if (isTimerMode() && reasonText.includes('时间到') && score >= 120) unlockAchievement('timedClear', '限时挑战者（限时类模式 120+）');
  if (mode === 'roguelike') {
    const gain = Math.max(1, Math.floor(score / 120));
    roguePerks += gain;
    saveRogueMeta();
  }

  beep('hit');
  showOverlay(`<p><strong>${reasonText}</strong></p><p>最终得分 ${score}</p><p>按方向键或点击“重新开始”再来一局</p>`);
}

function canMagnetCollect(head, pickup, now, range = 2) {
  if (!pickup || now >= magnetUntil) return false;
  const dist = Math.abs(head.x - pickup.x) + Math.abs(head.y - pickup.y);
  return dist <= range;
}

function update() {
  const now = performance.now();
  const elapsed = lastTickMs ? (now - lastTickMs) / 1000 : 0;
  lastTickMs = now;

  if (isTimerMode()) {
    remainingTime -= elapsed;
    updateTimeText();
    if (remainingTime <= 0) return endGame('⏰ 时间到！');
  }

  if (bonusFood && now > bonusExpireAt) bonusFood = null;
  if (shieldFood && now > shieldExpireAt) shieldFood = null;
  if (boostFood && now > boostExpireAt) boostFood = null;
  if (timeFood && now > timeExpireAt) timeFood = null;
  if (freezeFood && now > freezeExpireAt) freezeFood = null;
  if (phaseFood && now > phaseExpireAt) phaseFood = null;
  if (crownFood && now > crownExpireAt) crownFood = null;
  if (magnetFood && now > magnetExpireAt) magnetFood = null;
  if (comboFood && now > comboExpireAt) comboFood = null;
  if (scoreMultiplier > 1 && now > multiplierExpireAt) {
    scoreMultiplier = 1;
    multiplierEl.textContent = 'x1';
  }
  if (now > freezeUntil) freezeUntil = 0;
  if (now > phaseUntil) phaseUntil = 0;
  if (now > magnetUntil) magnetUntil = 0;
  if (now > comboGuardUntil) comboGuardUntil = 0;
  refreshStateText(now);

  direction = pendingDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (wrapModeInput.checked) {
    if (head.x < 0) head.x = tileCount - 1;
    if (head.x >= tileCount) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    if (head.y >= tileCount) head.y = 0;
  }

  if (isCollision(head)) {
    if (!hardcoreModeInput.checked && shields > 0) {
      shields -= 1;
      shieldEl.textContent = String(shields);
    } else {
      return endGame('💥 撞到了！');
    }
  }

  snake.unshift(head);

  let ate = false;
  if (head.x === food.x && head.y === food.y) {
    ate = true;
    addScore((10 + rogueScoreBonus) * scoreMultiplier, 'food');
    foodsEaten += 1;
    foodsEl.textContent = String(foodsEaten);
    saveLifetimeStats();
    food = randomFoodPosition();
    maybeSpawnBonusFood(now);
    maybeSpawnShieldFood(now);
    maybeSpawnBoostFood(now);
    maybeSpawnTimeFood(now);
    maybeSpawnFreezeFood(now);
    maybeSpawnPhaseFood(now);
    maybeSpawnCrownFood(now);
    maybeSpawnMagnetFood(now);
    maybeSpawnComboFood(now);
    discoverCodex('food', '基础果');
    beep('eat');
  }

  if (bonusFood && ((head.x === bonusFood.x && head.y === bonusFood.y) || canMagnetCollect(head, bonusFood, now))) {
    ate = true;
    const bonusBase = dlcPack === 'frenzy' ? 40 : 30;
    addScore(bonusBase * scoreMultiplier, 'bonus');
    foodsEaten += 1;
    foodsEl.textContent = String(foodsEaten);
    saveLifetimeStats();
    bonusFood = null;
    discoverCodex('bonus', '奖励果');
    beep('bonus');
  }

  if (shieldFood && ((head.x === shieldFood.x && head.y === shieldFood.y) || canMagnetCollect(head, shieldFood, now))) {
    ate = true;
    if (!hardcoreModeInput.checked) {
      shields = Math.min(2, shields + 1);
      shieldEl.textContent = String(shields);
    }
    shieldFood = null;
    discoverCodex('shield', '护盾果');
    beep('bonus');
  }

  if (boostFood && ((head.x === boostFood.x && head.y === boostFood.y) || canMagnetCollect(head, boostFood, now))) {
    ate = true;
    scoreMultiplier = 2;
    multiplierExpireAt = now + 8000;
    multiplierEl.textContent = 'x2';
    boostFood = null;
    discoverCodex('boost', '倍率果');
    beep('mission');
  }

  if (timeFood && ((head.x === timeFood.x && head.y === timeFood.y) || canMagnetCollect(head, timeFood, now))) {
    ate = true;
    if (isTimerMode()) {
      const extraSeconds = getTimeFruitBonusSeconds();
      remainingTime += extraSeconds;
      fruitTimeBonusSeconds += extraSeconds;
      updateTimeText();
    } else {
      addScore(15 * scoreMultiplier, 'timeFruit');
    }
    timeFood = null;
    discoverCodex('time', '时间果');
    beep('bonus');
  }

  if (freezeFood && ((head.x === freezeFood.x && head.y === freezeFood.y) || canMagnetCollect(head, freezeFood, now))) {
    ate = true;
    freezeUntil = now + 6000;
    freezeFood = null;
    refreshStateText(now);
    discoverCodex('freeze', '冰冻果');
    beep('mission');
    if (running && !paused) {
      startLoop();
    }
  }

  if (phaseFood && ((head.x === phaseFood.x && head.y === phaseFood.y) || canMagnetCollect(head, phaseFood, now))) {
    ate = true;
    phaseUntil = now + 6000;
    phaseFood = null;
    refreshStateText(now);
    discoverCodex('phase', '相位果');
    beep('mission');
  }

  if (crownFood && ((head.x === crownFood.x && head.y === crownFood.y) || canMagnetCollect(head, crownFood, now))) {
    ate = true;
    crownFood = null;
    const rewardRoll = Math.floor(Math.random() * 4);
    let rewardText = '';
    if (rewardRoll === 0) {
      addScore(40 * scoreMultiplier, 'crown');
      rewardText = '奖励 +40 分';
    } else if (rewardRoll === 1) {
      if (!hardcoreModeInput.checked) {
        shields = Math.min(2, shields + 1);
        shieldEl.textContent = String(shields);
        rewardText = '奖励 护盾 +1';
      } else {
        addScore(20 * scoreMultiplier, 'crown');
        rewardText = '硬核补偿 +20 分';
      }
    } else if (rewardRoll === 2) {
      scoreMultiplier = 2;
      multiplierExpireAt = Math.max(multiplierExpireAt, now + 6000);
      multiplierEl.textContent = 'x2';
      rewardText = '奖励 倍率 x2';
    } else {
      if (isTimerMode()) {
        const extraSeconds = getCrownTimeBonusSeconds();
        remainingTime += extraSeconds;
        crownTimeBonusSeconds += extraSeconds;
        updateTimeText();
        rewardText = `奖励 +${extraSeconds} 秒`;
      } else {
        phaseUntil = Math.max(phaseUntil, now + 4000);
        refreshStateText(now);
        rewardText = '奖励 相位 4 秒';
      }
    }
    discoverCodex('crown', '王冠果');
    beep('mission');
    if (running && !paused) {
      showOverlay(`<p><strong>👑 王冠奖励</strong></p><p>${rewardText}</p>`);
      setTimeout(() => {
        if (running && !paused) hideOverlay();
      }, 700);
    }
  }

  if (magnetFood && ((head.x === magnetFood.x && head.y === magnetFood.y) || canMagnetCollect(head, magnetFood, now, 3))) {
    ate = true;
    magnetUntil = now + 7000;
    magnetFood = null;
    refreshStateText(now);
    discoverCodex('magnet', '磁力果');
    beep('mission');
    if (running && !paused) {
      showOverlay('<p><strong>🧲 磁力启动</strong></p><p>附近道具自动吸附 7 秒</p>');
      setTimeout(() => {
        if (running && !paused) hideOverlay();
      }, 700);
    }
  }

  if (comboFood && ((head.x === comboFood.x && head.y === comboFood.y) || canMagnetCollect(head, comboFood, now, 2))) {
    ate = true;
    comboFood = null;
    comboGuardUntil = now + 6000;
    addScore(20 * scoreMultiplier, 'comboFruit');
    refreshStateText(now);
    discoverCodex('combo', '连击果');
    beep('bonus');
    if (running && !paused) {
      showOverlay('<p><strong>🔥 连击护航</strong></p><p>6 秒内连击不重置，并奖励 +20 分</p>');
      setTimeout(() => {
        if (running && !paused) hideOverlay();
      }, 700);
    }
  }

  if (ate) {
    const eatDelta = lastEatMs ? now - lastEatMs : Infinity;
    const comboWindow = (hardcoreModeInput.checked ? 2000 : 3000) + rogueComboWindowBonus;
    combo = eatDelta <= comboWindow ? Math.min(combo + 1, 9) : 1;
    roundMaxCombo = Math.max(roundMaxCombo, combo);
    addScore((combo - 1) * 2 * scoreMultiplier, 'comboChain');
    comboEl.textContent = `x${combo}`;
    lastEatMs = now;
    maybeAddRock();
  } else if (lastEatMs && now - lastEatMs > (hardcoreModeInput.checked ? 2000 : 3000) && now > comboGuardUntil) {
    combo = 1;
    comboEl.textContent = 'x1';
  }

  if (!ate) {
    snake.pop();
  } else {
    const speedBoost = Math.floor(score / 50) * 5;
    const hardcoreDelta2 = hardcoreModeInput.checked ? -20 : 0;
    speed = Math.max(45, baseSpeed + hardcoreDelta2 - speedBoost + rogueSpeedDelta);
    if (running && !paused) startLoop();
  }

  scoreEl.textContent = String(score);
  lengthEl.textContent = String(snake.length);

  if (mode === 'endless') {
    while (score >= levelTargetScore) {
      level += 1;
      levelTargetScore += 100 + (level - 1) * 20;
      speed = Math.max(40, speed - 4);

      let milestoneText = '';
      if (level % 3 === 0) {
        if (!hardcoreModeInput.checked) {
          shields = Math.min(2, shields + 1);
          shieldEl.textContent = String(shields);
          milestoneText = '里程碑奖励：护盾 +1';
        } else {
          addScore(25 * scoreMultiplier, 'milestone');
          milestoneText = '里程碑奖励：硬核补偿 +25 分';
        }
      }

      if (level > endlessBestLevel) {
        endlessBestLevel = level;
        saveEndlessBestLevel();
      }

      updateLevelText();
      if (running && !paused) {
        const extra = milestoneText ? `<p>${milestoneText}</p>` : '';
        showOverlay(`<p><strong>⬆️ 升级！</strong></p><p>进入第 ${level} 关</p>${extra}`);
        setTimeout(() => {
          if (running && !paused) hideOverlay();
        }, 750);
      }
    }
  }

  if (!missionAchieved && score >= missionTarget) {
    missionAchieved = true;
    if (!hardcoreModeInput.checked) {
      shields = Math.min(2, shields + 1);
      shieldEl.textContent = String(shields);
    }
    missionEl.textContent = `完成✔`;
    if (running && !paused) {
      beep('mission');
      const rewardText = hardcoreModeInput.checked ? '硬核模式：无护盾奖励' : '奖励：护盾 +1';
      showOverlay(`<p><strong>任务达成！</strong></p><p>${rewardText}</p>`);
      setTimeout(() => {
        if (running && !paused) hideOverlay();
      }, 700);
    }
  }

  renderer.draw();
}

const renderer = SnakeRender.createRenderer({
  ctx,
  canvas,
  gridSize,
  tileCount,
  getSkinThemes: () => skinThemes,
  getCurrentSkin: () => currentSkin,
  getState: () => ({
    food, bonusFood, shieldFood, boostFood, timeFood, freezeFood,
    phaseFood, crownFood, magnetFood, comboFood, rocks, snake, phaseUntil
  })
});

SnakeInput.createInputController({
  documentEl: document,
  canvas,
  mobilePad,
  shouldIgnoreHotkeys,
  onTogglePause: () => togglePause(),
  onRestart: () => resetGame(true),
  onToggleMute: () => {
    muted = !muted;
    saveAudioSetting();
  },
  onToggleHelp: () => toggleHelp(helpPanel.style.display === 'none'),
  onDirection: (next) => changeDirection(next)
});

restartBtn.addEventListener('click', () => resetGame(true));
pauseBtn.addEventListener('click', togglePause);

difficultySelect.addEventListener('change', () => {
  saveSettings();
  baseSpeed = Number(difficultySelect.value);
  const speedBoost = Math.floor(score / 50) * 5;
  const hardcoreDelta3 = hardcoreModeInput.checked ? -20 : 0;
  speed = Math.max(45, baseSpeed + hardcoreDelta3 - speedBoost + rogueSpeedDelta);
  if (running && !paused) startLoop();
});

modeSelect.addEventListener('change', () => {
  modePreference = modeSelect.value;
  saveSettings();
  mode = modeSelect.value;
  updateLevelText();
  refreshModeBestText();
  resetGame(true);
});

obstacleModeInput.addEventListener('change', () => { obstacleModePreference = obstacleModeInput.checked; saveSettings(); resetGame(true); });
hardcoreModeInput.addEventListener('change', () => { saveSettings(); resetGame(true); });
wrapModeInput.addEventListener('change', saveSettings);
contrastModeInput.addEventListener('change', () => { saveSettings(); applyContrastMode(); });
miniHudModeInput.addEventListener('change', () => { saveSettings(); applyMiniHudMode(); });
autoPauseModeInput.addEventListener('change', saveSettings);
skinSelect.addEventListener('change', () => {
  saveSettings();
  currentSkin = skinSelect.value;
  renderer.draw();
});

dlcPackSelect.addEventListener('change', () => {
  saveSettings();
  dlcPack = dlcPackSelect.value;
  refreshDlcHud();
  resetGame(true);
});


document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (!autoPauseModeInput.checked) return;
    if (running && !paused) togglePause();
    return;
  }
  refreshChallengeByDateIfNeeded();
});


clearDataBtn.addEventListener('click', () => {
  localStorage.removeItem('snake-best');
  localStorage.removeItem(settingsKey);
  localStorage.removeItem(statsKey);
  localStorage.removeItem(bestByModeKey);
  localStorage.removeItem(audioKey);
  localStorage.removeItem(achievementsKey);
  localStorage.removeItem(lastResultKey);
  localStorage.removeItem(historyKey);
  localStorage.removeItem(codexKey);
  localStorage.removeItem(endlessBestLevelKey);
  localStorage.removeItem(rogueMetaKey);
  localStorage.removeItem(customRocksKey);
  bestScore = 0;
  bestEl.textContent = '0';
  bestByMode = { classic: 0, timed: 0, blitz: 0, endless: 0, roguelike: 0 };
  refreshModeBestText();
  foodsEaten = 0;
  totalPlays = 0;
  streakWins = 0;
  muted = false;
  saveAudioSetting();
  foodsEl.textContent = '0';
  playsEl.textContent = '0';
  streakEl.textContent = '0';
  achievements = { score200: false, combo5: false, timedClear: false };
  refreshAchievementsText();
  lastResult = { score: 0, mode: 'classic', ts: 0 };
  refreshLastResultText();
  history = [];
  renderHistory();
  discoveredCodex = defaultCodexState();
  refreshCodex();
  endlessBestLevel = 0;
  saveEndlessBestLevel();
  roguePerks = 0;
  saveRogueMeta();
  customRocks = [];
  saveCustomRocks();
  if (activeAccount) {
    accountStore[activeAccount] = captureProfileSnapshot();
    saveAccountStore();
  }
  resetGame(true);
});


shareBtn.addEventListener('click', async () => {
  const modeLabel = SnakeModes.getModeLabel(mode);
  const hardcoreTag = hardcoreModeInput.checked ? '（硬核）' : '';
  const levelTag = mode === 'endless' ? `，当前关卡 L${level}（最高 L${endlessBestLevel}）` : '';
  const text = `我在贪吃蛇 v${GAME_VERSION} 的${modeLabel}${hardcoreTag}拿到 ${score} 分${levelTag}！挑战：${currentChallenge.label}，最高倍率${multiplierEl.textContent}，当前状态${stateEl.textContent}`;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      showOverlay('<p><strong>已复制战绩</strong></p><p>快去分享给好友吧</p>');
      setTimeout(() => { if (running && !paused) hideOverlay(); }, 700);
    }
  } catch {
    showOverlay('<p><strong>复制失败</strong></p><p>当前浏览器不支持剪贴板</p>');
    setTimeout(() => { if (running && !paused) hideOverlay(); }, 900);
  }
});

muteBtn.addEventListener('click', () => {
  muted = !muted;
  saveAudioSetting();
});

helpBtn.addEventListener('click', () => toggleHelp(helpPanel.style.display === 'none'));
tutorialBtn.addEventListener('click', () => {
  toggleHelp(true);
  showOverlay('<p><strong>新手引导</strong></p><p>建议先用经典模式熟悉节奏，再尝试限时与肉鸽</p>');
  setTimeout(() => { if (!running || paused) hideOverlay(); }, 1300);
});
closeHelpBtn.addEventListener('click', () => toggleHelp(false));

loginAccountBtn.addEventListener('click', () => {
  loginAccount(accountInput.value);
  accountInput.value = '';
});
logoutAccountBtn.addEventListener('click', logoutAccount);
exportSaveBtn.addEventListener('click', exportSaveData);
importSaveInput.addEventListener('change', () => importSaveData(importSaveInput.files?.[0]));
accountInput.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  loginAccount(accountInput.value);
  accountInput.value = '';
});

genWorkshopBtn.addEventListener('click', () => {
  const code = Workshop.generateCode(getWorkshopStateSnapshot);
  if (!code) return;
  showOverlay('<p><strong>创意工坊代码已生成</strong></p><p>可复制后分享给好友</p>');
  setTimeout(() => { if (running && !paused) hideOverlay(); }, 700);
});
copyWorkshopBtn.addEventListener('click', async () => {
  const code = workshopCodeInput.value.trim() || Workshop.generateCode(getWorkshopStateSnapshot);
  if (!code) return;
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(code);
    showOverlay('<p><strong>已复制工坊代码</strong></p><p>可直接发送给好友</p>');
    setTimeout(() => { if (running && !paused) hideOverlay(); }, 700);
  } catch {
    showOverlay('<p><strong>复制失败</strong></p><p>请手动复制文本框内容</p>');
    setTimeout(() => { if (running && !paused) hideOverlay(); }, 900);
  }
});
applyWorkshopBtn.addEventListener('click', () => {
  const ok = Workshop.applyCode(workshopCodeInput.value, applyWorkshopControls, getWorkshopStateSnapshot);
  if (!ok) {
    showOverlay('<p><strong>工坊代码无效</strong></p><p>请检查是否为 SWK1 格式</p>');
    setTimeout(() => { if (running && !paused) hideOverlay(); }, 900);
    return;
  }
  showOverlay('<p><strong>已应用工坊规则</strong></p><p>已重置并按新规则开始</p>');
  setTimeout(() => { if (running && !paused) hideOverlay(); }, 800);
});
applyWorkshopPresetBtn.addEventListener('click', () => {
  const key = workshopPresetSelect.value;
  const ok = Workshop.applyPreset(key, applyWorkshopControls, getWorkshopStateSnapshot);
  if (!ok) {
    showOverlay('<p><strong>请选择预设</strong></p><p>可先选择一个创意工坊模板</p>');
    setTimeout(() => { if (running && !paused) hideOverlay(); }, 800);
    return;
  }
  Workshop.generateCode(getWorkshopStateSnapshot);
  showOverlay('<p><strong>预设已应用</strong></p><p>规则已切换并生成对应分享码</p>');
  setTimeout(() => { if (running && !paused) hideOverlay(); }, 800);
});


applyRocksBtn.addEventListener('click', () => {
  const parsed = parseRockEditorText(rockEditorInput.value);
  customRocks = parsed;
  saveCustomRocks();
  resetGame(true);
  showOverlay(`<p><strong>障碍已应用</strong></p><p>共 ${customRocks.length} 个障碍点</p>`);
  setTimeout(() => { if (running && !paused) hideOverlay(); }, 800);
});

exportRocksBtn.addEventListener('click', async () => {
  const text = encodeRocks(rocks);
  rockEditorInput.value = text;
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    showOverlay('<p><strong>已导出当前障碍</strong></p><p>坐标已写入文本框并复制</p>');
  } catch {
    showOverlay('<p><strong>已导出当前障碍</strong></p><p>坐标已写入文本框，可手动复制</p>');
  }
  setTimeout(() => { if (running && !paused) hideOverlay(); }, 800);
});

clearRocksBtn.addEventListener('click', () => {
  customRocks = [];
  saveCustomRocks();
  resetGame(true);
  showOverlay('<p><strong>已清空自定义障碍</strong></p><p>后续局将恢复默认障碍生成</p>');
  setTimeout(() => { if (running && !paused) hideOverlay(); }, 900);
});

loadAccountStore();
activeAccount = (localStorage.getItem(currentAccountKey) || '').trim();
if (activeAccount && accountStore[activeAccount]) {
  applyProfileSnapshot(accountStore[activeAccount]);
}
refreshAccountUI();

selectDailyChallenge();
renderVersionEvents();
loadLifetimeStats();
loadHistory();
loadCodex();
loadEndlessBestLevel();
loadRogueMeta();
loadLastResult();
loadAchievements();
loadAudioSetting();
loadBestByMode();
loadSettings();
loadCustomRocks();
applyContrastMode();
applyMiniHudMode();
currentSkin = skinSelect.value;
mode = modeSelect.value;
updateLevelText();
baseSpeed = Number(difficultySelect.value);
refreshModeBestText();
maybeShowOnboarding();
resetGame(true);
Workshop.generateCode(getWorkshopStateSnapshot);
