# Snake 多文件网页游戏

这是一个**无需构建工具、无需安装依赖**的贪吃蛇网页项目，现已从单文件结构发展为多文件结构。

## 当前能力（持续发展中）

- **6 种模式**：经典、限时 60 秒、冲刺 45 秒、无尽关卡、肉鸽模式、AI对战（简单/普通/困难/地狱难度）。
- **多输入支持**：方向键、W/A/S/D、触屏方向键、滑动，以及快捷键（Space/P 暂停、R 重开、M 静音、H 帮助）。
- **道具与成长**：基础果、奖励果、护盾果、倍率果、时间果、冰冻果、相位果、王冠果、磁铁果、连击果。
- **系统机制**：障碍、硬核模式、连击、任务、成就、图鉴、高对比显示开关、精简HUD开关、失焦自动暂停开关、创意工坊规则分享、DLC 扩展包（狂热/守护/时序），以及障碍编辑器（坐标导入/导出/随机生成）。
- **局外成长**：肉鸽词条 + 肉鸽点成长。
- **本地持久化**：设置、战绩，最佳分、模式记录、成就等数据保存在 `localStorage`。
- **新手引导**：分层引导系统（基础操作 → 道具认知 → 模式策略），根据游戏局数自动解锁。
- **复盘建议**：实时检测高风险转向和失误前状态，提供路径提示。

## 目录结构

```text
.
├── index.html                      # 页面结构
├── styles.css                      # 页面样式
├── game.js                        # 主编排入口（模块拼装）
├── README.md                       # 项目说明
├── ROADMAP.md                     # 开发路线图
├── docs/
│   └── AGENTS.md                  # 指标驱动开发框架
├── src/
│   ├── modules/                   # 游戏模块
│   │   ├── account.js             # 账号系统
│   │   ├── ai_player.js           # AI玩家与AI对战系统
│   │   ├── challenge.js           # 每日挑战
│   │   ├── daily_challenge_mode.js # 每日限时挑战
│   │   ├── multiplayer.js         # 多人对战系统
│   │   ├── replay.js              # 回放系统
│   │   ├── shop.js                # 皮肤商店
│   │   ├── spectate.js            # 观战模式
│   │   ├── endgame_flow.js        # 结算流程
│   │   ├── events.js              # 活动系统
│   │   ├── guide.js               # 新手引导
│   │   ├── input.js               # 输入处理
│   │   ├── item_spawn.js          # 道具生成
│   │   ├── leaderboard.js         # 排行榜
│   │   ├── loop_timers.js         # 主循环
│   │   ├── mode_rules.js          # 模式规则
│   │   ├── modes.js               # 模式配置
│   │   ├── play_state.js          # 游戏状态
│   │   ├── recap.js               # 复盘系统
│   │   ├── records.js             # 战绩记录
│   │   ├── render.js              # 渲染系统
│   │   ├── reset_flow.js          # 重开流程
│   │   ├── reset_prepare.js       # 重开准备
│   │   ├── round_state.js         # 回合状态
│   │   ├── season.js              # 赛季系统
│   │   ├── settings.js            # 设置
│   │   ├── settlement.js           # 结算系统
│   │   ├── storage.js             # 存储系统
│   │   ├── workshop.js             # 工坊系统
│   │   └── workshop_runtime.js     # 工坊运行时
│   └── data/
│       └── leaderboard_remote.json # 远端榜单数据
├── balance/
│   ├── baseline.json              # 平衡基准
│   └── search_space.json          # 搜索空间
├── output/
│   └── tuning_report.json         # 调优报告
├── skills/
│   └── snake-feature-evolver/    # 特性演进技能
│       ├── SKILL.md
│       ├── references/
│       │   ├── modes-and-systems.md
│       │   ├── module-map.md
│       │   ├── persistence-and-account.md
│       │   └── integration-checklists.md
│       └── scripts/
│           ├── bump_version.py
│           └── run_required_checks.sh
└── tools/
    └── autotune/                   # 自动调优工具
        ├── report.py
        ├── score.py
        ├── search.py
        ├── simulate.py
        └── update_roadmap.py
```

## 快速开始

```bash
python3 -m http.server 4173
# 浏览器访问 http://localhost:4173/index.html
```

也可直接打开 `index.html`，但建议优先使用本地静态服务器。

## 开发自检

### 1) 一键必跑检查（推荐）

```bash
bash skills/snake-feature-evolver/scripts/run_required_checks.sh
```

### 2) 手工检查（等价）

```bash
node --check $(git ls-files '*.js')
rg -n "styles.css|workshop.js|modes.js|input.js|render.js|game.js" index.html
git diff --check
```

## 版本维护

同步页面可见版本与 `GAME_VERSION`：

```bash
python3 skills/snake-feature-evolver/scripts/bump_version.py 0.99.0
```

## 在线后端 (可选)

`server/` 目录提供可选的 Node/Express 后端（排行榜 + 账号），**不影响纯前端零依赖承诺**——不配置后端时游戏完全离线可用。

### 启动后端

```bash
cd server
npm install
npm start          # 默认 http://127.0.0.1:8787, 可用 PORT 环境变量覆盖
```

### 前端接入

两种方式配置后端地址（二选一）：
- 页面加载前设置 `window.SNAKE_SERVER_URL`（部署时注入）
- 浏览器控制台 `localStorage.setItem('snake_server_url', 'http://127.0.0.1:8787')`

配置后：排行榜「远端榜」从后端拉取，对局结束分数异步上报；后端不可达时自动回退本地数据。

### API 一览

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 健康检查 |
| GET | `/api/leaderboard?mode=&limit=` | 排行榜（分数降序） |
| POST | `/api/leaderboard` | 提交分数 `{player,score,mode,challengeSeed?,dlcPack?}` |
| POST | `/api/account/register` | 注册账号 `{name}` → `{id,token}` |
| GET | `/api/account/:id` | 读取账号数据 |
| PUT | `/api/account/:id` | 更新账号 `{token,name?,data?}` |

数据存储于 `server/data/*.json`（原子写，自动创建，已 gitignore）。

## 最新进展

- v1.40.0：结算卡片 - 死亡后 overlay 从纯文字升级为结构化结算卡:大字号发光得分 + 本局表现徽章(最高连击/本局食物/DLC, 无尽模式额外显示关卡、限时模式显示剩余时间);数据复用 recap 已采集字段(零新增逻辑);新增结算卡片回归测试。
- v1.39.0：E2E 覆盖扩展 - 新增存档持久化回归(开局局数 +1、刷新保持、snake-stats-v1 校验)与每日签到回归(首次发奖、刷新后不可重复领取、状态持久化校验)；全量 E2E 34 项。
- v1.38.0：工程脚本固化 - package.json 新增 test(固定 workers=4 消除并行噪声)/test:core(核心回归子集)/server(后端一键启动)/gen(manifest 生成)/check(必跑检查)/verify(全量测试+检查一键)；新增核心玩法回归测试(完整对局循环:开局→游走→结算→重开, 零错误+结算结构断言)。
- v1.37.0：新道具「幽灵果」- 第 10 种道具（图鉴新增条目），吃到后 6 秒无敌：无视墙壁/自身/障碍碰撞（isCollision 免疫），穿墙自动取模回绕，蛇体半透明（0.55 alpha）视觉提示；得分 ≥120 后每 130 分生成一次（无敌期间不重复生成）；支持磁力吸附收集。
- v1.36.0：科幻风格前端重构 - 深空星云背景（青紫双径向渐变）+ 漂移星点层 + 全息网格（径向遮罩）+ 扫描线动画；霓虹青紫主题（CSS 变量全量迁移），面板顶部棱镜高光线、棋盘霓虹边框 + 强发光、标题全息字效（大写 / 字距 / 发光）、按钮青紫霓虹渐变；保留全部 class 结构与游戏逻辑，纯 CSS 重构，零依赖、file:// 可玩、light-mode 同步适配。
- v1.35.0：暂停菜单 - 暂停时显示操作菜单（▶ 继续 / 🔄 重新开始 / 🔊 音效开关），按钮点击直达，空格/P 快捷恢复；顺带修复 overlay 内按钮无法点击的问题（.overlay 的 pointer-events:none 覆盖按钮，恢复按钮 pointer-events）；新增暂停菜单回归测试。
- v1.34.0：音效音量控制 - 设置区新增音量滑块（0-100%，拖动实时生效，静音键旁）；音量持久化到 localStorage（snake-volume-v1）；与 SnakeSound.setVolume 联动；新增音量设置回归测试（默认 50、修改持久化、刷新保持）。
- v1.33.0：修复特殊模式致命 bug - 多模式自动试玩诊断发现：AI对战/多人对战切换时主线程卡死（selectOption 超时）。根因：ai_player.js 与 multiplayer.js 的 spawnFood 用 isPositionOccupied 判断位置，而该函数会检查 food 自身（food 在 do-while 内已赋值），条件恒 true 导致无限循环，两个模式从未能启动；另发现 game.js 的 updateScoreText 被 5 处调用但从未定义（AI/多人/观战/每日挑战 reset 流程全部报错），已补定义。新增特殊模式切换回归测试（4 模式零错误）。
- v1.32.0：修复新手引导 API 失配 - 自动试玩诊断发现死亡结算反复报 `guideRuntime.getGamesPlayed is not a function`；game.js 仍引用旧版引导 API（getGamesPlayed/getCurrentLayer/GUIDE_LAYERS/incrementGamesPlayed），guide 模块已演进为任务式新版（getCurrentPhase/GUIDE_PHASES/进度百分比）；全部迁移至新 API，局数改用 totalPlays，教程面板显示引导进度百分比；新增回归测试（死亡结算+教程按钮零错误）。
- v1.31.0：音效系统升级 - 独立 WebAudio 合成模块 src/modules/sound.js（零外部资源），7 种音效：吃食物双音、道具上行滑音、碰撞下降音、任务三连音、成就琶音、按钮点击、升级上行琶音；beep() 自动委托新模块，未加载时回退内置单音，调用点零改动；支持静音与音量控制。
- v1.30.0：在线后端（可选）- server/ Express 服务提供排行榜 + 账号 API（health/leaderboard/account 三组）；JSON 文件原子写存储；前端排行榜可配置接入后端（window.SNAKE_SERVER_URL 或 localStorage），配置后远端榜实时拉取、分数异步上报，后端不可达自动回退本地；新增前后端联调 E2E（2/2）；未配置后端时保持纯离线零依赖。
- v1.29.0：启动性能优化 - 模块注入改为并行下载+保序执行（async=false 动态脚本），网络环境下总下载时间从串行叠加降为最大单文件，本地实测 modules-ready 228ms→156ms（-31.6%）；bootSnakeGame 同步初始化实测仅 ~20ms；新增启动性能监测测试（含 1s 警戒断言）。
- v1.28.0：模块懒加载两阶段启动 - 13 个低频模块（成就预览/流失分析/技能树/快速上手等，全局不被启动路径引用）纳入 SNAKE_LAZY_MODULES，游戏就绪即启动、lazy 模块后台续注，缩短首屏就绪时间；check-manifest.js 校验 lazy 清单一致性；新增 lazy 注入 E2E 测试（全量 20/20 通过）。
- v1.27.0：模块加载系统重构 - 模块清单 manifest.js 单一事实来源；ModuleLoader.bootstrap() 按清单顺序注入经典脚本，支持 file:// 直接打开（无需本地服务器）；game.js 改为事件驱动启动；index.html 移除 60+ 手动 script 标签；修复 preload 对核心模块的未处理异常；修复 render.js phaseUntil 作用域 bug；新增主循环 E2E 测试（4/4 通过）。
- v1.4.0：AI对战与多人系统 - AI对战模式（简单/普通/困难/地狱四个难度级别，智能寻路算法，反应速度和决策能力根据难度调整）；AI对战排行榜（各难度最佳战绩记录）；智能AI行为（路径寻找、食物追踪、障碍物避让、策略性决策）；多人实时对战（本地2-4人，各自独立控制，碰撞淘汰机制，死亡变障碍物，排名系统）；观战模式（观看AI对战、AI大乱斗、回放系统，支持游戏录像保存和播放）；皮肤商店（使用肉鸽点购买皮肤，10+款皮肤，分类浏览，限定皮肤，解锁条件系统）；每日限时挑战（8种特殊规则组合，2分钟限时，肉鸽点奖励，每日排行榜）。
- v1.3.0：社交与竞技系统 - 好友系统（添加/删除好友、在线状态、最佳成绩）；好友排行榜（周榜/月榜、金银铜奖牌、Top3高亮）；挑战模式（发起/接受/拒绝/完成挑战、胜率统计、50经验值奖励）；游戏统计面板（胜率、平均分、最高分、模式偏好、最近对局）；个人资料页面（显示名称、等级、头像）；分享功能（分享成绩、分享成就到社交媒体）。
- v1.2.0：回归激励与成长系统优化 - 每日签到系统（7天循环奖励、连续签到追踪、经验值奖励、等级系统）；每日任务系统（3个随机任务/天，食物收集、分数挑战、连击大师任务类型，自动进度追踪）；成长系统可视化（等级显示、经验条进度展示）；赛季进度展示（12月制进度、本月天数进度、进度条可视化）；成就系统扩展（连续签到7天、连续签到30天、完成首个任务、完成所有任务）。
- v1.2.0：正式版发布 - 性能优化与渲染优化，添加网格缓存减少重复绘制；创作与分享体验整合优化，新增预设和随机障碍生成，地图分享流程优化；新手指引导航系统完整实现，地图分享质量校验闭环；复盘建议路径提示，新手引导分层首版上线。
- v0.99.0：渲染性能优化 - 添加网格缓存减少重复绘制。
- v0.98.0：工坊体验优化 - 新增预设和随机障碍生成，地图分享流程优化。
- v0.97.0：新手指引导航系统完整实现 + 地图分享质量校验闭环。
- v0.96.0：复盘建议路径提示 + 新手引导分层首版上线。
- v0.95.0：地图分享前校验增强，应用前可识别越界/重复/关键路径冲突并给出质量提示。
- v0.94.0：榜单扩展新增每日挑战榜与DLC分类榜筛选，支持按对局标签聚焦查看战绩。
- v0.93.0：活动规则包改为声明式配置（规则类型 + 参数），便于按日期段/周末快速扩展活动。

## 工作路线图

> 目标：在保持"纯前端、零依赖可运行"的前提下，以**可复玩性**、**可分享性**、**可运营性**三条主线持续迭代。

### 版本推进计划
- `v1.2.0`：✅ 正式版发布（已完成）。
- `v0.99`：✅ 性能优化与渲染优化（已完成）。
- `v0.98`：✅ 创作与分享体验整合优化（已完成）。
- `v0.97`：✅ 新手引导分层与地图分享质量校验闭环（已完成）。
- `v0.96`：✅ 复盘建议路径提示 + 新手引导分层首版（已完成）。
- `v0.95`：✅ 分享前校验增强（已完成）。

### 当前版本
- **Now（进行中）**：`v1.2.0` 正式版维护与优化。
- **Next（下一步）**：`v1.2.x` 版本迭代与功能扩展。

> 说明：看板每个版本完成后，都会同步写入"最新进展"。
# Test
