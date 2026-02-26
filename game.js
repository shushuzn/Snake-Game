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
const genMapCodeBtn = document.getElementById('genMapCode');
const applyMapCodeBtn = document.getElementById('applyMapCode');
const clearRocksBtn = document.getElementById('clearRocks');
const mapSummaryEl = document.getElementById('mapSummary');
const historyListEl = document.getElementById('historyList');
const leaderboardListEl = document.getElementById('leaderboardList');
const leaderboardStatusEl = document.getElementById('leaderboardStatus');
const leaderboardSourceTagEl = document.getElementById('leaderboardSourceTag');
const leaderboardDimensionSelectEl = document.getElementById('leaderboardDimension');
const toggleLeaderboardSourceBtn = document.getElementById('toggleLeaderboardSource');
const seasonIdEl = document.getElementById('seasonId');
const seasonRemainingEl = document.getElementById('seasonRemaining');
const seasonBestEl = document.getElementById('seasonBest');
const seasonRewardEl = document.getElementById('seasonReward');
const seasonHistoryListEl = document.getElementById('seasonHistoryList');
const eventLabelEl = document.getElementById('eventLabel');
const eventSummaryEl = document.getElementById('eventSummary');
const eventPanelEl = document.getElementById('eventPanel');
const jumpToEventPanelBtn = document.getElementById('jumpToEventPanel');
const codexListEl = document.getElementById('codexList');
const codexProgressEl = document.getElementById('codexProgress');
const versionEventsListEl = document.getElementById('versionEventsList');
const dlcCompareListEl = document.getElementById('dlcCompareList');
const settlementListEl = document.getElementById('settlementList');
const recapSummaryEl = document.getElementById('recapSummary');
const recapListEl = document.getElementById('recapList');
const recapTimelineListEl = document.getElementById('recapTimelineList');
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
const swipeThresholdSelect = document.getElementById('swipeThreshold');
const mobilePad = document.querySelector('.mobile-pad');
const versionTag = document.getElementById('versionTag');

const GAME_VERSION = '0.92.0';
const gridSize = 20;
const tileCount = canvas.width / gridSize;
const timedModeDuration = 60;
const blitzModeDuration = 45;
const missionOptions = SnakeModes.missionOptions;
const settingsKey = 'snake-settings-v2';
const settingsSchemaVersion = 3;
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
const leaderboardKey = 'snake-leaderboard-v1';
const seasonMetaKey = 'snake-season-meta-v1';
const recapKey = 'snake-recap-v1';

const validModes = ['classic', 'timed', 'blitz', 'endless', 'roguelike'];
const validDifficulties = ['140', '110', '80'];
const validDlcPacks = ['none', 'frenzy', 'guardian', 'chrono'];
const dlcMeta = {
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

function isValidModeValue(value) {
  return validModes.includes(String(value));
}

function isValidDifficultyValue(value) {
  return validDifficulties.includes(String(value));
}

function isValidDlcPackValue(value) {
  return validDlcPacks.includes(String(value));
}

function isValidSwipeThresholdValue(value) {
  return ['12', '18', '24', '32'].includes(String(value));
}


const versionEvents = [
  { version: '0.92.0', notes: ['排行榜新增分维度筛选：支持综合榜与五种模式榜快速切换', '路线图推进：v0.92 完成榜单分维度扩展，下一步推进活动规则可配置化'] },
  { version: '0.91.0', notes: ['新增连击里程奖励：连击达到 x5 立即获得额外分数奖励', '连击达到 x8 可触发短时倍率冲刺，帮助中后期滚雪球'] },
  { version: '0.90.0', notes: ['活动入口聚合上线：新增活动面板快速跳转，版本事件与活动浏览路径打通', '地图摘要首版上线：障碍数量/覆盖率/危险等级/推荐模式可视化'] },
  { version: '0.89.0', notes: ['排行榜远端读取链路上线：支持远端 JSON 拉取、超时保护与失败回退本地', '路线图推进：v0.89 完成远端榜真实接入，下一步进入活动入口聚合与地图摘要'] },
  { version: '0.88.0', notes: ['活动规则包扩展：新增新年/春节/黄金周/周末常驻规则包，并统一倍率文案', '路线图推进：v0.88 完成活动规则包扩展，下一步进入远端榜接口真实接入'] },
  { version: '0.87.0', notes: ['新增赛季奖励预览，并与当前活动挑战包联动显示奖励加成', '路线图 P3 推进：赛季奖励与活动联动展示落地，下一步扩展活动规则包'] },
  { version: '0.86.0', notes: ['对局复盘新增关键帧时间线（最近8条），支持展示开局/进食里程碑/升级节点', '路线图 P3 推进：数据回放增强落地，下一步进入赛季奖励与活动联动展示'] },
  { version: '0.85.0', notes: ['新增排行榜来源切换开关（本地榜/远端榜占位），离线场景自动提示回退', '路线图 P3 推进：排行榜远端接口切换首版落地，下一步进入数据回放关键帧时间线'] },
  { version: '0.84.0', notes: ['新增活动挑战包面板（节日主题首版），展示当前活动加成与说明', '路线图 P3 推进：活动化运营能力首版落地，下一步进入排行榜远端接口切换开关'] },
  { version: '0.83.0', notes: ['新增对局复盘摘要面板（最近一局），展示关键指标与终局原因', '路线图 P3 推进：数据回放与复盘首版落地，下一步进入活动化运营能力'] },
  { version: '0.82.0', notes: ['新增 DLC 风险收益对比面板，支持阶段 2 可视化对比', '狂热扩展新增护盾上限惩罚（上限=1），风险收益规则进入第二阶段'] },
  { version: '0.81.0', notes: ['新增滑动灵敏度设置（12/18/24/32px），支持移动端手势阈值个性化', '路线图 P2 推进：移动端交互增强首版落地，下一步进入风险收益型 DLC 第二阶段'] },
  { version: '0.80.0', notes: ['新增赛季信息区与历史赛季入口（最近6期），支持月赛季剩余时间与赛季最佳展示', '路线图 P2 推进：赛季信息首版完成，下一步进入移动端引导与手势自定义'] },
  { version: '0.79.0', notes: ['新增本地排行榜面板（Top20），按分数/时间排序并持久化到本地', '路线图 P2 推进：榜单面板首版完成，下一步进入赛季信息区与历史入口'] },
  { version: '0.78.0', notes: ['创意工坊规则码新增 mapCode 字段，支持障碍地图随规则一键分享与应用', '路线图 P2 推进：工坊与地图码互通完成，下一步进入榜单面板首版'] },
  { version: '0.77.0', notes: ['障碍编辑器新增地图码（SNKMAP1）生成与应用，支持校验码验证', '路线图 P2 推进：地图码导入导出首版落地，进入工坊互通阶段'] },
  { version: '0.76.0', notes: ['挑战面板刷新改为复用 getDailyChallengeBundle，减少重复日期/挑战推导逻辑', '路线图 P1 推进：挑战展示链路完成一次去冗余优化，便于后续维护与扩展'] },
  { version: '0.75.0', notes: ['每日挑战跨天切换优化：进行中的对局维持当局挑战，结束后再应用新日期挑战', '挑战面板新增跨天切换提示，避免午夜期间规则突变造成体验割裂'] },
  { version: '0.74.0', notes: ['优化每日挑战刷新展示：今日/明日挑战使用同一时间快照生成，跨秒显示更一致', '挑战得分倍率新增安全校验与上限保护，降低异常配置风险'] },
  { version: '0.73.0', notes: ['每日挑战新增“周循环主题”：工作日稳态 / 周末双倍率，挑战节奏更有区分度', '路线图 P1 推进：周循环主题已落地，挑战系统进入细化平衡阶段'] },
  { version: '0.72.0', notes: ['DLC 状态栏支持“风险/收益”规则摘要提示，便于开局前决策', '路线图 P1 推进：完成 DLC 风险收益可视化，进入每周挑战主题设计阶段'] },
  { version: '0.71.0', notes: ['新增 reset_prepare.js，重置前置（spawn + roundMeta 组装）从 game.js 拆分', '路线图 P1 推进：重置编排层完成前后拆分，主流程模块化进一步收敛'] },
  { version: '0.70.0', notes: ['新增 reset_flow.js，重置收尾（计时器停止/HUD复位/开局提示）从 game.js 拆分', '路线图 P1 推进：完成重置收尾编排层拆分，下一步拆分重置前置编排层'] },
  { version: '0.69.0', notes: ['新增 endgame_flow.js 与 records.js，拆分结算触发与战绩写入编排逻辑', '路线图 P1 推进：完成结算触发层 + 战绩编排层拆分，下一步拆分重置收尾编排层'] },
  { version: '0.68.0', notes: ['新增 play_state.js，开局/继续/暂停状态机决策从 game.js 拆分', '路线图 P1 推进：状态机决策层模块化落地，下一步拆分结算触发编排层'] },
  { version: '0.67.0', notes: ['新增 loop_timers.js，主循环与倒计时计时器编排从 game.js 拆分', '路线图 P1 推进：主循环计时编排模块化落地，下一步拆分状态机决策层'] },
  { version: '0.66.0', notes: ['新增 item_spawn.js，道具生成与加石头规则编排从 game.js 拆分', '路线图 P1 推进：道具生成编排模块化落地，下一步拆分主循环状态机编排层'] },
  { version: '0.65.0', notes: ['新增 round_state.js，回合初始化状态与出生参数编排从 game.js 拆分', '路线图 P1 推进：战局状态编排模块化落地，下一步拆分道具生成编排层'] },
  { version: '0.64.0', notes: ['新增 mode_rules.js，限时模式与 DLC 时间/步进规则从 game.js 拆分', '路线图 P1 推进：模式规则编排模块化落地，下一步拆分战局状态编排层'] },
  { version: '0.63.0', notes: ['新增 workshop_runtime.js，工坊状态快照与按钮交互编排从 game.js 拆分', '路线图 P1 推进：工坊编排模块化落地，下一步拆分模式规则编排层'] },
  { version: '0.62.0', notes: ['新增 settings.js，设置加载/保存与视觉模式应用从 game.js 拆分', '路线图 P1 推进：设置编排模块化落地，下一步拆分工坊编排层'] },
  { version: '0.61.0', notes: ['新增 account.js，账号登录/导入导出与快照恢复编排从 game.js 拆分', '路线图 P1 推进：账号编排模块化落地，下一步拆分设置编排层'] },
  { version: '0.60.0', notes: ['新增 storage.js 统一文本/JSON存储与账号快照操作，进一步减少主文件存储样板代码', '路线图 P1 推进：存档能力模块化落地，下一步拆分账号/设置编排层'] },
  { version: '0.59.0', notes: ['挑战 HUD/锁定与跨天刷新逻辑拆分至 challenge.js，主文件进一步瘦身', '路线图 P1 推进：挑战系统模块化落地，下一步拆分独立存档模块'] },
  { version: '0.58.0', notes: ['存档读写统一为 read/writeStorageJson，减少重复 try/catch 解析代码', '路线图 P1 推进：先完成存档层去冗余，再拆分独立存档模块'] },
  { version: '0.57.0', notes: ['设置校验规则改为常量化，减少重复判断分支', '路线图 P1 持续推进：先完成配置层去冗余重构'] },
  { version: '0.56.0', notes: ['结算统计逻辑拆分到 settlement.js，主循环职责更聚焦', '路线图 P1 启动：结算模块已从 game.js 抽离为独立模块'] },
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
const storage = window.SnakeStorage.createStorageModule(localStorage);
let bestScore = Number(storage.readText('snake-best', '0'));
let bestByMode = { classic: 0, timed: 0, blitz: 0, endless: 0, roguelike: 0 };
let running = false;
let paused = false;
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
let muted = false;
let achievements = { score200: false, combo5: false, timedClear: false };
let roundMaxCombo = 1;
let roundFoodsEaten = 0;
let roundKeyframes = [];
let scoreMultiplier = 1;
let multiplierExpireAt = 0;
let freezeUntil = 0;
let phaseUntil = 0;
let magnetUntil = 0;
let comboGuardUntil = 0;
let currentChallenge = SnakeModes.dailyChallengeOptions[0];
let obstacleModePreference = obstacleModeInput.checked;
let modePreference = modeSelect.value;

const challengeRuntime = window.SnakeChallenge.createChallengeModule({
  snakeModes: SnakeModes,
  elements: { challengeEl, challengeDetailEl, challengeNextEl, challengeNextDateEl, challengeRefreshEl, challengeDateEl },
  controls: { modeSelect, obstacleModeInput },
  runtime: {
    isRunning: () => running,
    getCurrentChallenge: () => currentChallenge,
    getModePreference: () => modePreference,
    setModePreference: (value) => { modePreference = value; },
    syncMode: (value) => { mode = value; },
    getObstacleModePreference: () => obstacleModePreference,
    setObstacleModePreference: (value) => { obstacleModePreference = value; }
  },
  setCurrentChallenge: (value) => { currentChallenge = value; }
});


let discoveredCodex = {};
let currentSkin = 'classic';
let dlcPack = 'none';
const settlement = window.SnakeSettlement.createSettlementModule({ settlementListEl });
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
renderDlcComparePanel();


function getDlcStatusText() {
  return (dlcMeta[dlcPack] || dlcMeta.none).hudText;
}

function getDlcRiskRewardSummary() {
  const meta = dlcMeta[dlcPack] || dlcMeta.none;
  return `${meta.summary}｜收益：${meta.reward}｜风险：${meta.risk}`;
}

function refreshDlcHud() {
  dlcStatusEl.textContent = getDlcStatusText();
  dlcStatusEl.title = getDlcRiskRewardSummary();
}

function getShieldCap() {
  if (dlcPack === 'frenzy') return 1;
  return 2;
}

function addShield(next = 1) {
  shields = Math.min(getShieldCap(), shields + Math.max(0, Number(next || 0)));
}

function pushRoundKeyframe(label, detail) {
  const safeLabel = String(label || '').trim();
  const safeDetail = String(detail || '').trim();
  if (!safeLabel || !safeDetail) return;
  const duplicated = roundKeyframes.some(item => item.label === safeLabel && item.detail === safeDetail);
  if (duplicated) return;
  roundKeyframes.push({ label: safeLabel, detail: safeDetail });
  if (roundKeyframes.length > 8) roundKeyframes = roundKeyframes.slice(-8);
}

function renderDlcComparePanel() {
  const rows = Object.entries(dlcMeta).map(([key, meta]) => {
    const selected = key === dlcPack ? '（当前）' : '';
    const phase2 = key === 'frenzy' ? '｜阶段2规则：护盾上限=1' : '';
    return `<li><strong>${meta.hudText}${selected}</strong><br/><small>收益：${meta.reward}；风险：${meta.risk}${phase2}</small></li>`;
  });
  dlcCompareListEl.innerHTML = rows.join('');
}

function getChallengeScoreFactor() {
  const rawFactor = Number(currentChallenge?.scoreFactor || 1);
  if (!Number.isFinite(rawFactor)) return 1;
  return Math.min(3, Math.max(1, rawFactor));
}

function addScore(points, source = '') {
  const delta = Number(points || 0);
  if (!delta) return;
  const challengeFactor = getChallengeScoreFactor();
  const eventFactor = Number(eventsRuntime?.getScoreFactor?.() || 1);
  const finalDelta = Math.max(1, Math.round(delta * challengeFactor * eventFactor));
  score += finalDelta;
  const tags = [];
  if (challengeFactor > 1) tags.push(`周主题x${challengeFactor}`);
  if (eventFactor > 1) tags.push(`活动x${eventFactor.toFixed(1)}`);
  const sourceLabel = tags.length && source ? `${source}（${tags.join('，')}）` : source;
  settlement.addScore(sourceLabel, finalDelta);
}

function refreshSettlementPanel(extra = {}) {
  settlement.render({
    modeLabel: SnakeModes.getModeLabel(mode),
    dlcText: getDlcStatusText(),
    score,
    timerMode: isTimerMode(),
    remainingTime: extra.remainingTime
  });
}

function getStorageKeysForProfile() {
  return [
    'snake-best', settingsKey, statsKey, audioKey, bestByModeKey,
    achievementsKey, lastResultKey, historyKey, codexKey, endlessBestLevelKey, rogueMetaKey, customRocksKey
  ];
}

function captureProfileSnapshot() {
  return storage.captureSnapshot(getStorageKeysForProfile());
}

function applyProfileSnapshot(snapshot) {
  storage.applySnapshot(getStorageKeysForProfile(), snapshot);
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

const accountRuntime = window.SnakeAccount.createAccountModule({
  storage,
  keys: { accountStoreKey, currentAccountKey },
  state: {
    getActiveAccount: () => activeAccount,
    setActiveAccount: (value) => { activeAccount = value; },
    getAccountStore: () => accountStore,
    setAccountStore: (value) => { accountStore = value; }
  },
  callbacks: {
    captureProfileSnapshot,
    applyProfileSnapshot,
    reloadAllFromStorage
  },
  elements: { accountNameEl, importSaveInput },
  ui: {
    showOverlay,
    hideOverlay,
    isRunning: () => running,
    isPaused: () => paused
  }
});

const settingsRuntime = window.SnakeSettings.createSettingsModule({
  storage,
  settingsKey,
  settingsSchemaVersion,
  controls: {
    modeSelect,
    difficultySelect,
    skinSelect,
    dlcPackSelect,
    wrapModeInput,
    obstacleModeInput,
    hardcoreModeInput,
    contrastModeInput,
    miniHudModeInput,
    autoPauseModeInput,
    swipeThresholdSelect
  },
  validators: {
    isValidMode: isValidModeValue,
    isValidDifficulty: isValidDifficultyValue,
    isValidDlcPack: isValidDlcPackValue,
    isValidSwipeThreshold: isValidSwipeThresholdValue
  },
  skinThemes,
  getModePreference: () => modePreference,
  setModePreference: (value) => { modePreference = value; },
  getObstacleModePreference: () => obstacleModePreference,
  setObstacleModePreference: (value) => { obstacleModePreference = value; },
  onSave: saveActiveAccountSnapshot
});

function getModeSettingValue() {
  return settingsRuntime.getModeSettingValue();
}

function getObstacleModeSettingValue() {
  return settingsRuntime.getObstacleModeSettingValue();
}

function applyContrastMode() {
  settingsRuntime.applyContrastMode();
}

function applyMiniHudMode() {
  settingsRuntime.applyMiniHudMode();
}

function loadSettings() {
  settingsRuntime.loadSettings();
}

function saveSettings() {
  settingsRuntime.saveSettings();
}

function saveActiveAccountSnapshot() {
  accountRuntime.saveActiveSnapshot();
}

function loginAccount(name) {
  accountRuntime.login(name);
}

function logoutAccount() {
  accountRuntime.logout();
}

function exportSaveData() {
  accountRuntime.exportSaveData(GAME_VERSION);
}

async function importSaveData(file) {
  await accountRuntime.importSaveData(file);
}

const Workshop = window.SnakeWorkshop.createWorkshopModule({
  version: GAME_VERSION,
  inputEl: workshopCodeInput,
  isValidMode: isValidModeValue,
  isValidDifficulty: isValidDifficultyValue,
  isValidSkin: (value) => Object.hasOwn(skinThemes, value),
  isValidDlcPack: isValidDlcPackValue,
  applyVisualModes: () => settingsRuntime.applyVisualModes(),
  saveSettings,
  syncRuntime: ({ skin, mode, difficulty }) => {
    currentSkin = skin;
    mode = mode;
    baseSpeed = Number(difficulty);
    updateLevelText();
    refreshModeBestText();
  },
  resetAndRefresh: () => resetGame(true),
  getMapCode: () => encodeMapCode(customRocks),
  applyMapCode: (rawMapCode) => {
    const parsed = parseMapCode(rawMapCode);
    if (!parsed.ok) return { ok: false, reason: parsed.reason };
    customRocks = parsed.rocks;
    saveCustomRocks();
    return { ok: true };
  }
});

const workshopRuntime = window.SnakeWorkshopRuntime.createWorkshopRuntime({
  workshop: Workshop,
  controls: {
    workshopCodeInput,
    workshopPresetSelect,
    genWorkshopBtn,
    copyWorkshopBtn,
    applyWorkshopBtn,
    applyWorkshopPresetBtn,
    modeSelect,
    difficultySelect,
    skinSelect,
    dlcPackSelect,
    wrapModeInput,
    obstacleModeInput,
    hardcoreModeInput,
    contrastModeInput,
    miniHudModeInput,
    autoPauseModeInput,
    swipeThresholdSelect
  },
  runtime: {
    getModeSettingValue,
    getObstacleModeSettingValue,
    setModePreference: (value) => { modePreference = value; },
    setObstacleModePreference: (value) => { obstacleModePreference = value; },
    getMapCode: () => encodeMapCode(customRocks)
  },
  ui: {
    showOverlay,
    hideOverlay,
    isRunning: () => running,
    isPaused: () => paused
  }
});

const modeRulesRuntime = window.SnakeModeRules.createModeRulesModule({
  timedModeDuration,
  blitzModeDuration,
  runtime: {
    getMode: () => mode,
    getDlcPack: () => dlcPack,
    getCurrentChallenge: () => currentChallenge
  }
});

const roundStateRuntime = window.SnakeRoundState.createRoundStateModule();

const itemSpawnRuntime = window.SnakeItemSpawn.createItemSpawnModule({
  runtime: {
    getScore: () => score,
    getShields: () => shields,
    getCombo: () => combo,
    getBonusStep,
    isHardcoreEnabled: () => hardcoreModeInput.checked,
    isObstacleEnabled: () => obstacleModeInput.checked,
    isChallengeNoRocks: () => Boolean(currentChallenge.noRocks),
    hasCustomRocks: () => customRocks.length > 0,
    getRocksCount: () => rocks.length,
    addRock: (value) => { rocks.push(value); },
    randomFreeCell,
    hasBonusFood: () => Boolean(bonusFood),
    hasShieldFood: () => Boolean(shieldFood),
    hasBoostFood: () => Boolean(boostFood),
    hasTimeFood: () => Boolean(timeFood),
    hasFreezeFood: () => Boolean(freezeFood),
    hasPhaseFood: () => Boolean(phaseFood),
    hasCrownFood: () => Boolean(crownFood),
    hasMagnetFood: () => Boolean(magnetFood),
    hasComboFood: () => Boolean(comboFood),
    setBonusFood: (pos, expireAt) => { bonusFood = pos; bonusExpireAt = expireAt; },
    setShieldFood: (pos, expireAt) => { shieldFood = pos; shieldExpireAt = expireAt; },
    setBoostFood: (pos, expireAt) => { boostFood = pos; boostExpireAt = expireAt; },
    setTimeFood: (pos, expireAt) => { timeFood = pos; timeExpireAt = expireAt; },
    setFreezeFood: (pos, expireAt) => { freezeFood = pos; freezeExpireAt = expireAt; },
    setPhaseFood: (pos, expireAt) => { phaseFood = pos; phaseExpireAt = expireAt; },
    setCrownFood: (pos, expireAt) => { crownFood = pos; crownExpireAt = expireAt; },
    setMagnetFood: (pos, expireAt) => { magnetFood = pos; magnetExpireAt = expireAt; },
    setComboFood: (pos, expireAt) => { comboFood = pos; comboExpireAt = expireAt; }
  }
});

const loopTimersRuntime = window.SnakeLoopTimers.createLoopTimersModule({
  showOverlay,
  getEffectiveSpeed: effectiveSpeed,
  onTick: update,
  isPaused: () => paused,
  isRunning: () => running
});

const recordsRuntime = window.SnakeRecords.createRecordsModule({
  storage,
  keys: { historyKey, lastResultKey },
  ui: { historyListEl, lastResultEl },
  getModeLabel: SnakeModes.getModeLabel,
  isValidModeValue,
  onPersist: saveActiveAccountSnapshot
});

const playStateRuntime = window.SnakePlayState.createPlayStateModule({
  runtime: {
    isRunning: () => running,
    isPaused: () => paused,
    setRunning: (value) => { running = value; },
    setPaused: (value) => { paused = value; },
    isPlayCountedThisRound: () => playCountedThisRound,
    setPlayCountedThisRound: (value) => { playCountedThisRound = value; }
  },
  ui: {
    showOverlay,
    hideOverlay,
    setPauseButtonPausedLabel: () => { pauseBtn.textContent = '暂停'; },
    setPauseButtonResumeLabel: () => { pauseBtn.textContent = '继续'; }
  },
  timers: loopTimersRuntime,
  stats: {
    incrementTotalPlays: () => {
      totalPlays += 1;
      playsEl.textContent = String(totalPlays);
      saveLifetimeStats();
    }
  },
  onCountdownDone: startLoop,
  onResume: startLoop
});

const leaderboardRuntime = window.SnakeLeaderboard.createLeaderboardModule({
  storage,
  key: leaderboardKey,
  listEl: leaderboardListEl,
  statusEl: leaderboardStatusEl,
  sourceTagEl: leaderboardSourceTagEl,
  toggleBtn: toggleLeaderboardSourceBtn,
  dimensionSelectEl: leaderboardDimensionSelectEl,
  getModeLabel: SnakeModes.getModeLabel,
  onPersist: saveActiveAccountSnapshot,
  remoteConfig: {
    url: './leaderboard_remote.json',
    timeoutMs: 2000
  }
});


const seasonRuntime = window.SnakeSeason.createSeasonModule({
  storage,
  key: seasonMetaKey,
  elements: {
    seasonIdEl,
    seasonRemainingEl,
    seasonBestEl,
    seasonHistoryListEl
  },
  onPersist: saveActiveAccountSnapshot
});


const eventsRuntime = window.SnakeEvents.createEventsModule({
  elements: { eventLabelEl, eventSummaryEl }
});


function getSeasonRewardTier(score) {
  if (score >= 600) return { tier: 'S', base: 200 };
  if (score >= 400) return { tier: 'A', base: 120 };
  if (score >= 250) return { tier: 'B', base: 80 };
  if (score >= 120) return { tier: 'C', base: 40 };
  return { tier: 'D', base: 10 };
}

function refreshSeasonRewardPreview() {
  if (!seasonRewardEl) return;
  const best = seasonRuntime.getCurrentBestScore();
  const tier = getSeasonRewardTier(best);
  const factorRaw = Number(eventsRuntime.getScoreFactor());
  const eventFactor = Number.isFinite(factorRaw) && factorRaw > 0 ? factorRaw : 1;
  const finalReward = Math.round(tier.base * eventFactor);
  const eventTag = eventFactor > 1 ? `（活动加成 x${eventFactor.toFixed(1)}）` : '';
  seasonRewardEl.textContent = `${tier.tier} 档：${finalReward} 奖励点${eventTag}`;
}

const recapRuntime = window.SnakeRecap.createRecapModule({
  storage,
  key: recapKey,
  summaryEl: recapSummaryEl,
  listEl: recapListEl,
  timelineListEl: recapTimelineListEl,
  getModeLabel: SnakeModes.getModeLabel,
  onPersist: saveActiveAccountSnapshot
});


const resetPrepareRuntime = window.SnakeResetPrepare.createResetPrepareModule({
  state: {
    setSnake: (value) => { snake = value; },
    setDirection: (value) => { direction = value; },
    syncPendingDirection: () => { pendingDirection = direction; },
    applyRoguelikeMutator,
    getRogueSpeedDelta: () => rogueSpeedDelta,
    getRogueStartShield: () => rogueStartShield
  },
  world: {
    resetRocksFromCustom: () => { rocks = customRocks.map(item => ({ ...item })); },
    spawnFood: () => { food = randomFoodPosition(); },
    applySpawnState: (spawnState) => {
      bonusFood = spawnState.bonusFood;
      bonusExpireAt = spawnState.bonusExpireAt;
      shieldFood = spawnState.shieldFood;
      shieldExpireAt = spawnState.shieldExpireAt;
      boostFood = spawnState.boostFood;
      boostExpireAt = spawnState.boostExpireAt;
      timeFood = spawnState.timeFood;
      timeExpireAt = spawnState.timeExpireAt;
      freezeFood = spawnState.freezeFood;
      freezeExpireAt = spawnState.freezeExpireAt;
      phaseFood = spawnState.phaseFood;
      phaseExpireAt = spawnState.phaseExpireAt;
      crownFood = spawnState.crownFood;
      crownExpireAt = spawnState.crownExpireAt;
      magnetFood = spawnState.magnetFood;
      magnetExpireAt = spawnState.magnetExpireAt;
      comboFood = spawnState.comboFood;
      comboExpireAt = spawnState.comboExpireAt;
    }
  },
  dlc: {
    syncSelectedPack: () => { dlcPack = dlcPackSelect.value; },
    refreshHud: refreshDlcHud,
    getPack: () => dlcPack,
    getShieldCap
  },
  challenge: {
    refreshHud: () => challengeRuntime.refreshHud(),
    getCurrentChallenge: () => currentChallenge
  },
  round: {
    createSpawnState: () => roundStateRuntime.createSpawnState(),
    createRoundMeta: (args) => roundStateRuntime.createRoundMeta(args)
  },
  mode: {
    getBaseSpeed: () => baseSpeed,
    isHardcoreEnabled: () => hardcoreModeInput.checked,
    isTimerMode,
    getTimerStartBonusSeconds,
    getModeTimeDuration,
    getMissionOptions: () => missionOptions
  }
});

const resetFlowRuntime = window.SnakeResetFlow.createResetFlowModule({
  runtime: {
    applyRoundMeta: (roundMeta) => {
      score = roundMeta.score;
      running = roundMeta.running;
      paused = roundMeta.paused;
      remainingTime = roundMeta.remainingTime;
      level = roundMeta.level;
      levelTargetScore = roundMeta.levelTargetScore;
      lastTickMs = roundMeta.lastTickMs;
      speed = roundMeta.speed;
      combo = roundMeta.combo;
      roundMaxCombo = roundMeta.roundMaxCombo;
      lastEatMs = roundMeta.lastEatMs;
      shields = roundMeta.shields;
      missionTarget = roundMeta.missionTarget;
      missionAchieved = roundMeta.missionAchieved;
      playCountedThisRound = roundMeta.playCountedThisRound;
      scoreMultiplier = roundMeta.scoreMultiplier;
      multiplierExpireAt = roundMeta.multiplierExpireAt;
      freezeUntil = roundMeta.freezeUntil;
      phaseUntil = roundMeta.phaseUntil;
      magnetUntil = roundMeta.magnetUntil;
      comboGuardUntil = roundMeta.comboGuardUntil;
      roundFoodsEaten = roundMeta.roundFoodsEaten;
      roundKeyframes = roundMeta.roundKeyframes || [];
    },
    getShields: () => shields,
    getMissionTarget: () => missionTarget
  },
  ui: {
    setPauseButtonPausedLabel: () => { pauseBtn.textContent = '暂停'; },
    setScore: (value) => { scoreEl.textContent = String(value); },
    setLength: (value) => { lengthEl.textContent = String(value); },
    setCombo: (value) => { comboEl.textContent = `x${value}`; },
    setShield: (value) => { shieldEl.textContent = String(value); },
    setMissionTarget: (value) => { missionEl.textContent = `${value}分`; },
    setMultiplier: (value) => { multiplierEl.textContent = `x${value}`; },
    refreshStateText,
    updateTimeText,
    updateLevelText,
    showStartOverlay: () => showOverlay('<p><strong>按方向键开始游戏</strong></p><p>W/A/S/D、触屏方向键或滑动都可控制</p>')
  },
  timers: {
    stopAll: () => loopTimersRuntime.stopAll()
  },
  challenge: {
    stopTicker: () => challengeRuntime.stopTicker(),
    startTicker: () => challengeRuntime.startTicker()
  },
  render: { draw: () => renderer.draw() }
});

const endgameFlowRuntime = window.SnakeEndgameFlow.createEndgameFlowModule({
  runtime: {
    stopLoop: () => loopTimersRuntime.stopAll(),
    setRunning: (value) => { running = value; },
    setPaused: (value) => { paused = value; },
    isTimerMode,
    getScore: () => score,
    getMode: () => mode,
    getLevel: () => level,
    getRemainingTime: () => remainingTime,
    getRoundMaxCombo: () => roundMaxCombo
  },
  stats: {
    getStreak: () => streakWins,
    setStreak: (value) => {
      streakWins = value;
      streakEl.textContent = String(streakWins);
    },
    persist: saveLifetimeStats
  },
  bests: {
    getBestScore: () => bestScore,
    setBestScore: (value) => {
      bestScore = value;
      bestEl.textContent = String(bestScore);
      storage.writeText('snake-best', String(bestScore));
      saveActiveAccountSnapshot();
    },
    getModeBest: (modeName) => bestByMode[modeName] || 0,
    setModeBest: (modeName, value) => {
      bestByMode[modeName] = value;
      saveBestByMode();
      refreshModeBestText();
    },
    getEndlessBestLevel: () => endlessBestLevel,
    setEndlessBestLevel: (value) => {
      endlessBestLevel = value;
      saveEndlessBestLevel();
    }
  },
  settlement: {
    refresh: refreshSettlementPanel
  },
  records: {
    recordRound: (nextScore, modeName) => {
      recordsRuntime.recordRound(nextScore, modeName);
      leaderboardRuntime.recordRound(nextScore, modeName);
      seasonRuntime.recordRound(nextScore, modeName);
      refreshSeasonRewardPreview();
    }
  },
  achievements: {
    unlock: unlockAchievement
  },
  roguelike: {
    addPerks: (gain) => {
      roguePerks += gain;
      saveRogueMeta();
    }
  },
  ui: {
    showEndOverlay: (reasonText, nextScore) => {
      recapRuntime.record({
        reason: reasonText,
        score: nextScore,
        mode,
        maxCombo: roundMaxCombo,
        roundFoods: roundFoodsEaten,
        levelLabel: mode === 'endless' ? `L${level}` : '--',
        remainingTimeLabel: isTimerMode() ? `${Math.max(0, Math.ceil(remainingTime))}s` : '--',
        dlcText: getDlcStatusText(),
        timeline: roundKeyframes
      });
      showOverlay(`<p><strong>${reasonText}</strong></p><p>最终得分 ${nextScore}</p><p>按方向键或点击“重新开始”再来一局</p>`);
    }
  },
  audio: {
    hit: () => beep('hit')
  }
});

function getBonusStep() {
  return modeRulesRuntime.getBonusStep();
}

function isTimerMode() {
  return modeRulesRuntime.isTimerMode();
}

function getTimerStartBonusSeconds() {
  return modeRulesRuntime.getTimerStartBonusSeconds();
}

function getTimeFruitBonusSeconds() {
  return modeRulesRuntime.getTimeFruitBonusSeconds();
}

function getCrownTimeBonusSeconds() {
  return modeRulesRuntime.getCrownTimeBonusSeconds();
}

function getModeTimeDuration() {
  return modeRulesRuntime.getModeTimeDuration();
}


function effectiveSpeed() {
  return speed;
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
  storage.writeJson(codexKey, discoveredCodex);
}

function loadCodex() {
  const base = defaultCodexState();
  const parsed = storage.readJson(codexKey, {});
  discoveredCodex = { ...base, ...parsed };
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
  recordsRuntime.loadHistory();
}

function saveHistory() {
  recordsRuntime.saveHistory();
}

function addHistoryEntry(score, modeName) {
  recordsRuntime.addHistoryEntry(score, modeName);
}

function renderHistory() {
  recordsRuntime.renderHistory();
}

function loadLastResult() {
  recordsRuntime.loadLastResult();
}

function saveLastResult() {
  recordsRuntime.saveLastResult();
}

function refreshLastResultText() {
  recordsRuntime.refreshLastResultText();
}

function loadAchievements() {
  const parsed = storage.readJson(achievementsKey, {});
  achievements.score200 = Boolean(parsed.score200);
  achievements.combo5 = Boolean(parsed.combo5);
  achievements.timedClear = Boolean(parsed.timedClear);
  refreshAchievementsText();
}

function saveAchievements() {
  storage.writeJson(achievementsKey, achievements);
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
  muted = storage.readText(audioKey) === '1';
  muteBtn.textContent = muted ? '🔇 音效关' : '🔊 音效开';
}

function saveAudioSetting() {
  storage.writeText(audioKey, muted ? '1' : '0');
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
  const parsed = storage.readJson(bestByModeKey, {});
  bestByMode.classic = Number(parsed.classic || 0);
  bestByMode.timed = Number(parsed.timed || 0);
  bestByMode.blitz = Number(parsed.blitz || 0);
  bestByMode.endless = Number(parsed.endless || 0);
  bestByMode.roguelike = Number(parsed.roguelike || 0);
}

function saveBestByMode() {
  storage.writeJson(bestByModeKey, bestByMode);
  saveActiveAccountSnapshot();
}

function refreshModeBestText() {
  modeBestEl.textContent = String(bestByMode[mode] || 0);
}

function loadLifetimeStats() {
  const parsed = storage.readJson(statsKey, {});
  foodsEaten = Number(parsed.foodsEaten || 0);
  totalPlays = Number(parsed.totalPlays || 0);
  streakWins = Number(parsed.streakWins || 0);
  foodsEl.textContent = String(foodsEaten);
  playsEl.textContent = String(totalPlays);
  streakEl.textContent = String(streakWins);
}

function saveLifetimeStats() {
  storage.writeJson(statsKey, { foodsEaten, totalPlays, streakWins });
  saveActiveAccountSnapshot();
}

function loadEndlessBestLevel() {
  endlessBestLevel = Number(storage.readText(endlessBestLevelKey, '0'));
  bestLevelEl.textContent = String(endlessBestLevel);
}

function saveEndlessBestLevel() {
  storage.writeText(endlessBestLevelKey, String(endlessBestLevel));
  bestLevelEl.textContent = String(endlessBestLevel);
  saveActiveAccountSnapshot();
}

function loadRogueMeta() {
  const parsed = storage.readJson(rogueMetaKey, {});
  roguePerks = Number(parsed.perks || 0);
  roguePerksEl.textContent = String(roguePerks);
}

function saveRogueMeta() {
  storage.writeJson(rogueMetaKey, { perks: roguePerks });
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
  if (storage.readText(onboardingKey) === '1') return;
  toggleHelp(true);
  showOverlay('<p><strong>欢迎来到贪吃蛇</strong></p><p>先看帮助面板，再按方向键开局</p>');
  setTimeout(() => { if (!running || paused) hideOverlay(); }, 1400);
  storage.writeText(onboardingKey, '1');
}

function showOverlay(message) { overlay.innerHTML = `<div>${message}</div>`; overlay.style.display = 'grid'; }
function hideOverlay() { overlay.style.display = 'none'; }
function updateTimeText() { timeEl.textContent = isTimerMode() ? `${Math.max(0, Math.ceil(remainingTime))}s` : '--'; }
function updateLevelText() { levelEl.textContent = mode === 'endless' ? `L${level}` : '--'; }

function refreshStateText(now = performance.now()) {
  if (!running) {
    stateEl.textContent = '待机';
    return;
  }
  if (paused) {
    stateEl.textContent = '暂停';
    return;
  }
  if (now < freezeUntil) {
    stateEl.textContent = '冰冻减速';
    return;
  }
  if (now < phaseUntil) {
    stateEl.textContent = '相位穿越';
    return;
  }
  if (now < magnetUntil) {
    stateEl.textContent = '磁力吸附';
    return;
  }
  if (now < comboGuardUntil) {
    stateEl.textContent = '连击护航';
    return;
  }
  if (now < multiplierExpireAt) {
    stateEl.textContent = '倍率加成';
    return;
  }
  stateEl.textContent = '正常';
}

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

function encodeMapPayload(rockList) {
  return rockList.map(item => `${item.x},${item.y}`).join(';');
}

function checksumMapPayload(payload) {
  let acc = 7;
  for (let i = 0; i < payload.length; i += 1) {
    acc = (acc * 131 + payload.charCodeAt(i)) % 104729;
  }
  return acc.toString(36).toUpperCase();
}

function encodeMapCode(rockList) {
  const normalized = normalizeRockList(rockList);
  const payload = encodeMapPayload(normalized);
  const checksum = checksumMapPayload(payload);
  return `SNKMAP1:${payload}:${checksum}`;
}

function parseMapCode(raw) {
  const text = String(raw || '').trim();
  if (!text.startsWith('SNKMAP1:')) {
    return { ok: false, reason: '缺少 SNKMAP1 前缀' };
  }
  const parts = text.split(':');
  if (parts.length !== 3) {
    return { ok: false, reason: '地图码结构错误（应为 SNKMAP1:payload:checksum）' };
  }
  const payload = parts[1] || '';
  const checksum = (parts[2] || '').toUpperCase();
  if (checksumMapPayload(payload) != checksum) {
    return { ok: false, reason: '地图码校验失败，请确认完整复制' };
  }
  const entries = payload ? payload.split(';') : [];
  const parsed = entries.map((entry) => {
    const [x, y] = entry.split(',').map(v => Number(v));
    return { x, y };
  });
  const normalized = normalizeRockList(parsed);
  return { ok: true, rocks: normalized };
}

function parseRocksFromInput(raw) {
  const text = String(raw || '').trim();
  if (!text) return { rocks: [], mode: 'empty' };
  if (text.startsWith('SNKMAP1:')) {
    const parsedMap = parseMapCode(text);
    if (!parsedMap.ok) return { error: parsedMap.reason, mode: 'mapCode' };
    return { rocks: parsedMap.rocks, mode: 'mapCode' };
  }
  return { rocks: parseRockEditorText(text), mode: 'coords' };
}

function getMapRiskLevel(coveragePercent) {
  if (coveragePercent >= 14) return '高';
  if (coveragePercent >= 8) return '中';
  return '低';
}

function getRecommendedModeByCoverage(coveragePercent) {
  if (coveragePercent >= 14) return '经典/限时（谨慎）';
  if (coveragePercent >= 8) return '经典/肉鸽';
  return '经典/无尽';
}

function refreshMapSummary(rockList = customRocks) {
  if (!mapSummaryEl) return;
  const count = Array.isArray(rockList) ? rockList.length : 0;
  const totalCells = tileCount * tileCount;
  const coveragePercent = totalCells > 0 ? (count / totalCells) * 100 : 0;
  const risk = getMapRiskLevel(coveragePercent);
  const recommended = getRecommendedModeByCoverage(coveragePercent);
  mapSummaryEl.textContent = `地图摘要：障碍 ${count} · 覆盖率 ${coveragePercent.toFixed(1)}% · 危险度 ${risk} · 推荐 ${recommended}`;
}

function saveCustomRocks() {
  storage.writeJson(customRocksKey, customRocks);
  if (rockEditorInput) rockEditorInput.value = encodeRocks(customRocks);
  refreshMapSummary(customRocks);
}

function loadCustomRocks() {
  const parsed = storage.readJson(customRocksKey, []);
  customRocks = normalizeRockList(Array.isArray(parsed) ? parsed : []);
  if (rockEditorInput) rockEditorInput.value = encodeRocks(customRocks);
  refreshMapSummary(customRocks);
}

function resetGame(showStartOverlay = true) {
  const roundMeta = resetPrepareRuntime.prepareRound();
  settlement.resetRound(roundMeta.startBonusSeconds);
  resetFlowRuntime.applyResetRound({
    roundMeta,
    snakeLength: snake.length,
    showStartOverlay
  });
  pushRoundKeyframe('开局', `模式 ${SnakeModes.getModeLabel(mode)}，DLC ${getDlcStatusText()}`);
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

function startLoop() {
  loopTimersRuntime.stopAll();
  lastTickMs = performance.now();
  loopTimersRuntime.startLoop();
}

function startGameIfNeeded() {
  playStateRuntime.startGameIfNeeded();
}


function startCountdown(onDone) {
  loopTimersRuntime.startCountdown(onDone);
}

function changeDirection(next) {
  const isReverse = next.x === -direction.x && next.y === -direction.y;
  if (!isReverse) pendingDirection = next;
  startGameIfNeeded();
}

function togglePause() {
  playStateRuntime.togglePause();
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
  endgameFlowRuntime.finalize(reasonText);
}

function canMagnetCollect(head, pickup, now, range = 2) {
  if (!pickup || now >= magnetUntil) return false;
  const dist = Math.abs(head.x - pickup.x) + Math.abs(head.y - pickup.y);
  return dist <= range;
}

function applyComboMilestoneReward(now, comboValue) {
  if (comboValue === 5) {
    addScore(15 * scoreMultiplier, 'comboMilestone5');
    pushRoundKeyframe('连击里程碑', '连击达到 x5，额外 +15 分');
    if (running && !paused) {
      showOverlay('<p><strong>🔥 连击里程碑 x5</strong></p><p>额外奖励 +15 分</p>');
      setTimeout(() => {
        if (running && !paused) hideOverlay();
      }, 650);
    }
    return;
  }
  if (comboValue === 8) {
    scoreMultiplier = 2;
    multiplierExpireAt = Math.max(multiplierExpireAt, now + 4000);
    multiplierEl.textContent = 'x2';
    pushRoundKeyframe('连击里程碑', '连击达到 x8，触发倍率冲刺 4 秒');
    if (running && !paused) {
      showOverlay('<p><strong>⚡ 连击里程碑 x8</strong></p><p>触发 4 秒倍率冲刺（x2）</p>');
      setTimeout(() => {
        if (running && !paused) hideOverlay();
      }, 700);
    }
  }
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
    roundFoodsEaten += 1;
    if (roundFoodsEaten === 1 || roundFoodsEaten === 5 || roundFoodsEaten === 10) {
      pushRoundKeyframe('进食里程碑', `本局累计 ${roundFoodsEaten} 个`);
    }
    foodsEl.textContent = String(foodsEaten);
    saveLifetimeStats();
    food = randomFoodPosition();
    itemSpawnRuntime.spawnOnFoodEat(now);
    discoverCodex('food', '基础果');
    beep('eat');
  }

  if (bonusFood && ((head.x === bonusFood.x && head.y === bonusFood.y) || canMagnetCollect(head, bonusFood, now))) {
    ate = true;
    const bonusBase = dlcPack === 'frenzy' ? 40 : 30;
    addScore(bonusBase * scoreMultiplier, 'bonus');
    foodsEaten += 1;
    roundFoodsEaten += 1;
    if (roundFoodsEaten === 1 || roundFoodsEaten === 5 || roundFoodsEaten === 10) {
      pushRoundKeyframe('进食里程碑', `本局累计 ${roundFoodsEaten} 个`);
    }
    foodsEl.textContent = String(foodsEaten);
    saveLifetimeStats();
    bonusFood = null;
    discoverCodex('bonus', '奖励果');
    beep('bonus');
  }

  if (shieldFood && ((head.x === shieldFood.x && head.y === shieldFood.y) || canMagnetCollect(head, shieldFood, now))) {
    ate = true;
    if (!hardcoreModeInput.checked) {
      addShield(1);
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
      settlement.addTimeBonus('fruit', extraSeconds);
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
        addShield(1);
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
        settlement.addTimeBonus('crown', extraSeconds);
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
    applyComboMilestoneReward(now, combo);
    lastEatMs = now;
    itemSpawnRuntime.maybeAddRock();
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
          addShield(1);
          shieldEl.textContent = String(shields);
          milestoneText = '里程碑奖励：护盾 +1';
        } else {
          addScore(25 * scoreMultiplier, 'milestone');
          milestoneText = '里程碑奖励：硬核补偿 +25 分';
        }
      }

      pushRoundKeyframe('升级节点', `进入第 ${level} 关`);
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
      addShield(1);
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
  renderDlcComparePanel();
  resetGame(true);
});


document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (!autoPauseModeInput.checked) return;
    if (running && !paused) togglePause();
    return;
  }
  challengeRuntime.refreshByDateIfNeeded();
});


clearDataBtn.addEventListener('click', () => {
  storage.removeMany(['snake-best', settingsKey, statsKey, bestByModeKey, audioKey, achievementsKey, lastResultKey, historyKey, codexKey, endlessBestLevelKey, rogueMetaKey, customRocksKey, leaderboardKey, seasonMetaKey, recapKey]);
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
  recordsRuntime.clearLastResult();
  recordsRuntime.clearHistory();
  leaderboardRuntime.clear();
  seasonRuntime.clear();
  recapRuntime.clear();
  refreshSeasonRewardPreview();
  discoveredCodex = defaultCodexState();
  refreshCodex();
  endlessBestLevel = 0;
  saveEndlessBestLevel();
  roguePerks = 0;
  saveRogueMeta();
  customRocks = [];
  saveCustomRocks();
  saveActiveAccountSnapshot();
  resetGame(true);
});


shareBtn.addEventListener('click', async () => {
  const modeLabel = SnakeModes.getModeLabel(mode);
  const hardcoreTag = hardcoreModeInput.checked ? '（硬核）' : '';
  const levelTag = mode === 'endless' ? `，当前关卡 L${level}（最高 L${endlessBestLevel}）` : '';
  const text = `我在贪吃蛇 v${GAME_VERSION} 的${modeLabel}${hardcoreTag}拿到 ${score} 分${levelTag}！挑战：${currentChallenge.label}，活动：${eventsRuntime.getLabel()}，最高倍率${multiplierEl.textContent}，当前状态${stateEl.textContent}`;
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

workshopRuntime.bindEvents();

rockEditorInput?.addEventListener('input', () => {
  const parsed = parseRocksFromInput(rockEditorInput.value);
  if (parsed.error) {
    mapSummaryEl.textContent = `地图摘要：输入待修正（${parsed.error}）`;
    return;
  }
  refreshMapSummary(parsed.rocks);
});

jumpToEventPanelBtn?.addEventListener('click', () => {
  eventPanelEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  eventPanelEl?.classList.add('highlight');
  setTimeout(() => eventPanelEl?.classList.remove('highlight'), 1200);
});

applyRocksBtn.addEventListener('click', () => {
  const parsed = parseRocksFromInput(rockEditorInput.value);
  if (!parsed.error) refreshMapSummary(parsed.rocks);
  if (parsed.error) {
    showOverlay(`<p><strong>地图解析失败</strong></p><p>${parsed.error}</p>`);
    setTimeout(() => { if (running && !paused) hideOverlay(); }, 900);
    return;
  }
  customRocks = parsed.rocks;
  saveCustomRocks();
  resetGame(true);
  const sourceText = parsed.mode === 'mapCode' ? '（来源：地图码）' : '';
  showOverlay(`<p><strong>障碍已应用${sourceText}</strong></p><p>共 ${customRocks.length} 个障碍点</p>`);
  setTimeout(() => { if (running && !paused) hideOverlay(); }, 800);
});

exportRocksBtn.addEventListener('click', async () => {
  const text = encodeRocks(rocks);
  rockEditorInput.value = text;
  refreshMapSummary(rocks);
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    showOverlay('<p><strong>已导出当前障碍</strong></p><p>坐标已写入文本框并复制</p>');
  } catch {
    showOverlay('<p><strong>已导出当前障碍</strong></p><p>坐标已写入文本框，可手动复制</p>');
  }
  setTimeout(() => { if (running && !paused) hideOverlay(); }, 800);
});

genMapCodeBtn.addEventListener('click', async () => {
  const code = encodeMapCode(rocks);
  rockEditorInput.value = code;
  refreshMapSummary(rocks);
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(code);
    showOverlay(`<p><strong>地图码已生成</strong></p><p>长度 ${code.length}，已写入并复制</p>`);
  } catch {
    showOverlay(`<p><strong>地图码已生成</strong></p><p>长度 ${code.length}，已写入文本框</p>`);
  }
  setTimeout(() => { if (running && !paused) hideOverlay(); }, 900);
});

applyMapCodeBtn.addEventListener('click', () => {
  const parsed = parseMapCode(rockEditorInput.value);
  if (parsed.ok) refreshMapSummary(parsed.rocks);
  if (!parsed.ok) {
    showOverlay(`<p><strong>地图码无效</strong></p><p>${parsed.reason}</p>`);
    setTimeout(() => { if (running && !paused) hideOverlay(); }, 900);
    return;
  }
  customRocks = parsed.rocks;
  saveCustomRocks();
  resetGame(true);
  showOverlay(`<p><strong>地图码已应用</strong></p><p>共 ${customRocks.length} 个障碍点</p>`);
  setTimeout(() => { if (running && !paused) hideOverlay(); }, 900);
});

clearRocksBtn.addEventListener('click', () => {
  customRocks = [];
  saveCustomRocks();
  resetGame(true);
  showOverlay('<p><strong>已清空自定义障碍</strong></p><p>后续局将恢复默认障碍生成</p>');
  setTimeout(() => { if (running && !paused) hideOverlay(); }, 900);
});

accountRuntime.loadFromStorage();

eventsRuntime.refresh();
challengeRuntime.selectDailyChallenge();
setInterval(() => seasonRuntime.refreshRemainingOnly(), 60000);
setInterval(() => {
  eventsRuntime.refresh();
  refreshSeasonRewardPreview();
}, 60000);
renderVersionEvents();
loadLifetimeStats();
loadHistory();
leaderboardRuntime.load();
leaderboardRuntime.bindEvents();
seasonRuntime.load();
refreshSeasonRewardPreview();
recapRuntime.load();
loadCodex();
loadEndlessBestLevel();
loadRogueMeta();
loadLastResult();
loadAchievements();
loadAudioSetting();
loadBestByMode();
loadSettings();
renderDlcComparePanel();
loadCustomRocks();
refreshMapSummary(customRocks);
currentSkin = skinSelect.value;
mode = modeSelect.value;
updateLevelText();
baseSpeed = Number(difficultySelect.value);
refreshModeBestText();
maybeShowOnboarding();
resetGame(true);
workshopRuntime.generateInitialCode();
