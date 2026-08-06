# game.js 架构改革设计 (ARCHITECTURE REFORM)

> 目标: 将 5628 行巨型闭包 bootSnakeGame() 渐进拆分为领域模块, 降低耦合、提升可维护性。
> 原则: 渐进迁移(每批小步)、全量测试兜底(35 E2E + 必跑 5 项)、git 回退保险。

## 1. 现状分析 (2026-08-06)

- **单一巨型闭包**: `function bootSnakeGame() { ... }` 5624 行闭合, 内部代码无缩进(风格遗留)
- **90 个顶层 let 共享状态**: 全部函数通过闭包访问, 无显式接口
- **180 个函数**: 名义"顶层", 实为闭包内函数
- **领域分布**(状态分组):
  | 领域 | 核心状态 | 说明 |
  |------|---------|------|
  | 棋盘 | snake/direction/pendingDirection/food/rocks | 移动+碰撞 |
  | 道具 | 10 种 food + expireAt/Until | 生成(item_spawn 已模块化)/吃/效果 |
  | 游戏状态 | score/running/paused/mode/speed/level/combo/shields | 主循环+结算 |
  | 效果计时 | freezeUntil/phaseUntil/magnetUntil/multiplierExpireAt | 相位/磁力/倍率 |
  | 模式控制 | aiBattleController/multiplayerController/spectateController | 已部分模块化 |
  | 设置 | muted/modePreference/obstacleModePreference | settings 模块已存在 |

## 2. 拆分原则

1. **渐进迁移**: 按依赖排序, 一次迁移一个领域; 每批后全量 E2E + 必跑检查
2. **注入而非全局**: 迁移出的模块通过参数/回调注入共享状态, 不读 window 可变全局
3. **死代码优先清理**: 先删未使用函数/常量, 减小迁移面
4. **接口先于实现**: 模块暴露最小 API, game.js 仅调用公开接口

## 3. 迁移顺序(依赖排序)

| 批次 | 内容 | 风险 | 状态 |
|------|------|------|------|
| B0 | 架构设计 + 全量引用审计 | 低 | ✅ 2026-08-06 |
| B1a | 音效设置子域迁移 (muted + 持久化 → sound 模块) | 低 | ✅ 2026-08-06 |
| B1b-1 | 模式偏好迁移 (modePreference/obstacleModePreference → settings 模块) | 中 | ✅ 2026-08-06 |
| B1b-2 | 皮肤域 (currentSkin/skinThemes → settings 模块) | 中 | ✅ 2026-08-06 |
| B1 ✅ | 设置域全部迁移完成 | - | ✅ |
| B2a | 成就状态管理 (ACHIEVEMENT_KEYS + achievements → achievements_manager 模块) | 中 | ✅ 2026-08-06 |
| B2b | 成就解锁业务调用点(保留 game.js, 属各业务域) | - | ✅ |
| B3 | 可测试性增强 (__SNAKE_TEST__ 只读钩子 + 贪吃 E2E) | 低 | ✅ 2026-08-06 |
| B3+ | 道具效果域迁移 | **高(273 处引用, 与主循环深度耦合, 建议保持闭包)** | 暂缓 |
| B4-B5 | 棋盘域/主循环 | 高(同属核心玩法域, 迁移收益低于风险) | 暂缓 |
| B2f | 本局统计域 (roundMaxCombo/roundFoodsEaten/roundKeyframes → round_stats_manager 模块) | 中 | ✅ 2026-08-07 |
| B2g | 账号域 (activeAccount/accountStore → account 模块) | 中 | ✅ 2026-08-07 |
| B2h | 生命周期统计域 (foodsEaten/totalPlays/streakWins → lifetime_stats 模块) | 中 | ✅ 2026-08-07 |
| B2i | 肉鸽模式域 (roguePerks 持久化 + 本局突变 5 状态 → rogue_manager 模块) | 中 | ✅ 2026-08-07 |
| B3 | 道具效果域(吃道具/计时) | 中 | 待办 |
| B4 | 棋盘域(移动/碰撞) | 高 | 待办 |
| B5 | 游戏主循环状态 | 高 | 待办 |

## 4. 风险与缓解

- **闭包变量引用**: 迁移前 grep 全量引用清单(必须含**值传递**形式, 如 `isValidMode: isValidModeValue` 无括号);
  迁移后未定义变量即报错, 由 E2E 兜底
- **死代码误判教训(B0)**: 函数"零调用"不等于死代码——可能被 runtime 以值传递引用;
  判死须满足: 源码中出现次数 === 1(仅定义处), 且无字符串/事件/DOM 引用
- **时序**: 模块经典脚本先加载(manifest), game.js 在 modules-ready 后执行, 可安全读 window 模块
- **状态双写**: 迁移状态域时, 迁移期间 game.js 与模块共用同一状态对象(通过注入引用), 避免复制
- **回退**: 每批独立提交, 异常时 git revert 单批

## 5. 审计基线(2026-08-06, 最终)

- 180 个函数, **0 个死函数**(全部被引用, 含值传递与事件绑定)
- 90 个顶层 let 状态, 覆盖 6 领域
- 设置包装函数(applyContrastMode/loadSettings/saveSettings 等)为薄包装但**在用**
  (被 reloadAllFromStorage/事件/runtime 暴露引用), 非死代码
- **方法学**: 死代码判定须用脚本文件正则(避免 shell 转义); node -e 的
  `\\\\b` 在 bash 双引号下会退化为退格字符(匹配恒 0), 必须用单引号 heredoc
- 结论: game.js 无死代码可清理, 改革核心是**状态域迁移**而非清理

## 6. 验收标准

- game.js 体积: 5628 行 → 每批减少, 目标 < 4000 行(阶段一)
- 全量 E2E 35 项全绿 + 必跑 5 项通过
- 功能零回归(玩法/UI/持久化不变)
