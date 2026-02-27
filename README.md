# Snake 多文件网页游戏

这是一个**无需构建工具、无需安装依赖**的贪吃蛇网页项目，现已从单文件结构发展为多文件结构。

## 当前能力（持续发展中）

- **5 种模式**：经典、限时 60 秒、冲刺 45 秒、无尽关卡、肉鸽模式。
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
│   │   ├── challenge.js           # 每日挑战
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

## 最新进展

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
- `v0.99`：✅ 性能优化与渲染优化（已完成）。
- `v0.98`：✅ 创作与分享体验整合优化（已完成）。
- `v0.97`：✅ 新手引导分层与地图分享质量校验闭环（已完成）。
- `v0.96`：✅ 复盘建议路径提示 + 新手引导分层首版（已完成）。
- `v0.95`：✅ 分享前校验增强（已完成）。

### 当前版本
- **Now（进行中）**：`v0.99` 性能优化与bug修复。
- **Next（下一步）**：`v1.00` 正式版发布。

> 说明：看板每个版本完成后，都会同步写入"最新进展"。
