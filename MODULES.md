# Snake Game 模块结构

## 模块概览

总计: 65 个模块

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
