# Roadmap v1.6.0

## 版本信息
- **版本号**: v1.6.0
- **发布日期**: 待定
- **版本主题**: 回流优化与成就展示
- **目标指标**:
  - return_quality: 65.0 → 70.0
  - progress_clarity: 68.0 → 72.0

## 功能清单

### 1. 成就展示界面升级 (achievement-showcase-v2)
**功能说明**: 优化成就系统UI，提供更清晰的成就进度和展示
- 成就分类浏览（按类型：分数、连击、模式、稀有）
- 成就进度条（部分完成的成就显示百分比）
- 成就稀有度标签（普通、稀有、史诗、传说）
- 成就获得动画和特效
- 成就分享功能优化

**技术要点**:
- 扩展 `src/modules/achievements.js` 或创建 `src/modules/achievement_showcase.js`
- 成就数据结构调整
- 动画效果实现

### 2. 个人数据中心 (stats-center-v2)
**功能说明**: 全面升级玩家数据中心，提供更清晰的成长反馈
- 总游戏时长统计
- 各模式胜率雷达图
- 成长曲线图（分数/场次趋势）
- 最近活动时间线
- 成就完成率仪表盘

**技术要点**:
- 创建 `src/modules/stats_center.js`
- 数据聚合和计算逻辑
- 图表渲染（Canvas 或 CSS）

### 3. 赛季任务系统 (season-missions)
**功能说明**: 引入赛季专属任务，提供明确的赛季目标
- 赛季限定任务（每周3个）
- 赛季奖励路线（完成任务获取代币）
- 赛季结束倒计时显示
- 赛季专属成就和称号

**技术要点**:
- 创建 `src/modules/season_missions.js`
- 赛季数据配置和存储
- 与现有 season.js 整合

### 4. 回流欢迎界面 (return-welcome-flow)
**功能说明**: 优化回流玩家体验，让他们快速融入
- 检测沉寂天数
- 回流欢迎弹窗（显示流失时游戏更新内容）
- 回流专属任务（追赶任务）
- 回流保护机制（新回归玩家有短暂护盾/双倍分数）

**技术要点**:
- 扩展 `src/modules/recall.js`（如存在）
- 或创建 `src/modules/return_welcome.js`
-沉寂天数计算逻辑

### 5. 模式试玩系统 (mode-trial-system)
**功能说明**: 降低新模式尝试门槛，提供试玩体验
- 未解锁模式试玩按钮
- 限时试玩（每模式每天5分钟试用）
- 试玩转正奖励（试玩后解锁享折扣）
- 试玩进度不保存（消除顾虑）

**技术要点**:
- 扩展 `src/modules/modes.js`
- 试玩计时系统
- 模式解锁状态管理

## 模块依赖关系

```
achievement_showcase.js
   - 依赖: achievements.js, storage.js
   - 被依赖: stats_center.js

stats_center.js
   - 依赖: storage.js, records.js
   - 被依赖: season_missions.js

season_missions.js
   - 依赖: season.js, achievements.js, storage.js
   - 被依赖: (独立)

return_welcome.js
   - 依赖: storage.js, daily_tasks.js
   - 被依赖: mode_trial.js

mode_trial.js
   - 依赖: modes.js, mode_rules.js, storage.js
   - 被依赖: (独立)
```

## 预计工作量

| 功能模块 | 预计代码行数 | 复杂度 |
|---------|-------------|--------|
| 成就展示界面升级 | ~300行 | 中 |
| 个人数据中心 | ~350行 | 高 |
| 赛季任务系统 | ~280行 | 中 |
| 回流欢迎界面 | ~200行 | 中 |
| 模式试玩系统 | ~180行 | 中 |
| 样式更新 | ~300行 | 中 |
| **总计** | **~1610行** | - |

## 版本检查清单

- [ ] 版本号更新 (index.html, game.js)
- [ ] 新模块语法检查通过
- [ ] 功能完整测试
- [ ] README.md 更新
- [ ] ROADMAP.md 更新
- [ ] Git 提交并推送
