# Snake Game 模块结构

## 模块概览

| 指标 | 数值 |
|------|------|
| 总模块数 | 66 |
| 总大小 | 387.5KB |
| Gzip 大小 | 135.6KB |
| 平均大小 | ~6KB/模块 |

## 体积分析 (2026-04-11)

**最大模块 (Top 10):**
| 模块 | 大小 | Gzip |
|------|------|------|
| ai_player | 18.6KB | 6.5KB |
| level_unlock | 17.9KB | 6.3KB |
| skill_tree | 16.3KB | 5.7KB |
| titles | 15.4KB | 5.4KB |
| guide | 15.1KB | 5.3KB |
| achievement_showcase | 14.8KB | 5.2KB |
| first_milestone | 14.2KB | 5.0KB |
| season | 11.7KB | 4.1KB |
| multiplayer | 10.5KB | 3.7KB |
| daily_challenge_mode | 9.2KB | 3.2KB |

**小模块 (< 2KB, 8个):**
- reset_flow.js (854B)
- mode_rules.js (1.2KB)
- reset_prepare.js (1.4KB)
- play_state.js (1.4KB)
- loop_timers.js (1.6KB)
- storage.js (1.7KB)
- achievement_detail.js (1.8KB)
- profile.js (1.8KB)

## 模块分类

### 成就系统 (6)
| 模块 | 功能 |
|------|------|
| achievement_detail.js | 成就详情弹窗 |
| achievement_preview.js | 成就预览 |
| achievement_search.js | 成就搜索 |
| achievement_showcase.js | 成就展示 |
| achievement_stats.js | 成就统计 |
| achievement_toast.js | 成就通知 |

### 好友系统 (3)
| 模块 | 功能 |
|------|------|
| friends.js | 好友管理 |
| friends_challenge.js | 好友挑战 |
| friends_leaderboard.js | 好友排行榜 |

### 回流系统 (5)
| 模块 | 功能 |
|------|------|
| return_center.js | 回流中心 |
| return_missions.js | 回流任务 |
| return_reminder.js | 回流提醒 |
| return_reminder.js | 回流引导 |
| enhanced_return_rewards.js | 增强回流奖励 |

### 赛季系统 (2)
| 模块 | 功能 |
|------|------|
| season.js | 赛季挑战 |
| season_rewards_preview.js | 赛季奖励预览 |

### 每日系统 (2)
| 模块 | 功能 |
|------|------|
| daily_challenge_mode.js | 每日挑战模式 |
| daily_rewards.js | 每日奖励 |
| daily_tasks.js | 每日任务 |

### 奖励系统 (2)
| 模块 | 功能 |
|------|------|
| reward_system.js | 动态奖励引擎 |
| reward_preview.js | 奖励预览面板 |

### 模式系统 (3)
| 模块 | 功能 |
|------|------|
| modes.js | 游戏模式配置 |
| mode_rules.js | 模式规则 |
| mode_trial.js | 模式试玩 |

### 核心系统 (其他)
| 模块 | 功能 |
|------|------|
| game.js | 主游戏逻辑 (5384 行) |
| play_state.js | 游戏状态管理 |
| round_state.js | 回合状态 |
| render.js | 渲染 |
| input.js | 输入处理 |
| statistics.js | 统计 |
| settlement.js | 结算 |
| shop.js | 商店 |
| profile.js | 玩家档案 |
| leaderboard.js | 排行榜 |
| storage.js | 存储 |
| settings.js | 设置 |
| titles.js | 称号 |
| records.js | 记录 |

## game.js 结构 (5384 行)

game.js 是单文件，包含:
- 游戏初始化
- 主循环
- 状态管理
- UI 更新
- 事件处理
- 成就系统集成
- 赛季系统集成
- 购买系统集成
- 奖励系统集成

## 依赖关系

```
game.js
├── storage.js (被所有模块使用)
├── achievement_*.js (成就显示)
├── reward_*.js (奖励发放)
├── season.js (赛季进度)
└── [其他 55 个模块]
```

## 维护建议

1. game.js 过大，建议未来拆分
2. 模块遵循 MODULE_API_STANDARD
3. 新模块必须注册到 index.html

## 模块加载系统

### ModuleLoader (src/modules/moduleLoader.js)

提供模块懒加载和使用追踪功能。

**核心 API:**
```javascript
// 启动引导: 按 manifest 注入全部模块(经典脚本, 兼容 file://)
// lazy 清单中的模块不阻塞启动, 就绪后后台续注 (v1.28.0)
await ModuleLoader.bootstrap(window.SNAKE_MODULE_MANIFEST, { lazy: window.SNAKE_LAZY_MODULES });

// 按需加载模块
await ModuleLoader.load('achievement_showcase');

// 预加载 (空闲时)
ModuleLoader.preload('reward_preview');

// 检查是否已加载
if (ModuleLoader.isLoaded('achievement_showcase')) { ... }

// 查看使用统计
ModuleLoader.printStats();  // 控制台可视化

// 获取原始数据
ModuleLoader.getUsageStats();
```

**懒加载机制 (v1.28.0):**
- `src/modules/manifest.js` 维护两个清单:
  - `SNAKE_MODULE_MANIFEST` — 全部 66 模块
  - `SNAKE_LAZY_MODULES` — 13 个懒加载模块(不阻塞启动, 就绪后后台续注)
- 两阶段启动: 首批注入非 lazy 模块 → 派发 `snake:modules-ready` → 游戏启动 → 后台续注 lazy 模块
- 懒加载候选选择依据: 全局不被 game.js 引用、不被其他模块加载期引用
- 清单由 `node scripts/generate-modules.mjs` 生成, `node scripts/check-manifest.js` 校验一致性

### 模块分类

**核心模块 (43个)** - game.js 直接引用，必须同步加载:
- 核心: storage, events, play_state, round_state, input, render, modes, mode_rules, settlement, statistics, settings, records
- 功能: challenge, season, shop, account, friends, leaderboard 等

**懒加载模块 (41个)** - 按需加载:
- achievement_preview, ai_player, battle_pass, clan, tutorial 等

### 优化建议

1. **当前状态**: 135KB gzip 可接受，暂不需要优化
2. **未来优化方向**:
   - 使用 esbuild/rollup 打包核心模块
   - 合并小模块 (< 2KB)
   - 实现真正的懒加载激活
3. **监控工具**:
   - `node scripts/analyze-modules.mjs` - 体积分析
   - `ModuleLoader.printStats()` - 运行时使用追踪

### 添加新模块

```bash
# 1. 创建模块
# 2. 运行自动生成
node scripts/generate-modules.mjs
```

### 懒加载实验记录 (2026-04-11)

#### 尝试 1: `defer` 属性
**结果**: 失败

**原因**:
- `defer` 改变脚本执行顺序
- 模块间存在依赖关系 (achievement_showcase 依赖 friends)
- 即使只对 3 个 friends 模块添加 defer，也破坏了 achievement_showcase 测试

#### 尝试 2: 懒初始化代理模式 (v1.26.0 Phase 3)
**结果**: 成功 ✅

**原理**:
- 模块脚本在页面加载时正常同步加载
- 但 `createModule()` 调用延迟到首次访问时才执行
- 通过工厂函数实现单例懒初始化

**实现**:
```javascript
// game.js 中的懒初始化工厂函数
let _friendsRuntime = null;
function getFriendsRuntime() {
  if (!_friendsRuntime) {
    _friendsRuntime = window.SnakeFriends.createFriendsModule({ storage });
  }
  return _friendsRuntime;
}

// 使用点 - 在首次访问时才创建
function refreshFriendsUI() {
  const friendsRuntime = getFriendsRuntime(); // 懒初始化
  if (!friendsRuntime) return;
  // ...
}
```

**涉及函数**:
- `getFriendsRuntime()` - friends.js 懒初始化
- `getFriendsLeaderboardRuntime()` - friends_leaderboard.js 懒初始化
- `getFriendsChallengeRuntime()` - friends_challenge.js 懒初始化

**覆盖的 UI 函数**:
- `refreshFriendsUI()`, `handleAddFriend()`, `removeFriend()`
- `refreshFriendsLeaderboardUI()`
- `refreshChallengesUI()`, `handleSendChallenge()`, `acceptChallenge()`, `declineChallenge()`, `completeChallenge()`, `claimChallengeReward()`
- `updateChallengeTargetSelect()`

**结论**:
- 懒初始化代理模式成功 (15/15 测试通过)
- Friends 模块在用户点击好友按钮时才初始化
- 无需重构 game.js 模块加载机制 (低风险)
- 基础设施 (ModuleLoader) 已就绪
- 需要完整的依赖分析才能安全懒加载
