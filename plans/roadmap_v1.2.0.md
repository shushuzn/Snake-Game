# Snake v1.2.0 Roadmap - 回归激励与成长系统优化

> 基于 AGENTS.md 指标驱动开发框架

## 当前指标分析

### North Star Metric
| 指标 | 当前值 | 目标值 | 差距 |
|------|--------|--------|------|
| V_total | 68.5% | ≥75% | -6.5% |

### Supporting Metrics
| 指标 | 当前值 | 优先级 |
|------|--------|--------|
| return_quality | 65.0 | 🔴 最高 |
| progress_clarity | 68.0 | 🔴 高 |
| upgrade_satisfaction | 70.0 | 🟡 中 |
| growth_momentum | 72.0 | 🟢 |
| stability_score | 75.0 | 🟢 |

### Risk Metrics
| 指标 | 当前值 | 状态 |
|------|--------|------|
| fail_rate | 0.8% | ✅ 低 |
| longest_stall | 45s | ✅ 低 |
| constraint_failed | 0 | ✅ 无 |

---

## v1.2.0 目标

**核心主题**: 回归激励与成长系统优化

**预期影响**:
- +return_quality: 通过签到奖励、每日任务提升回归动力
- +progress_clarity: 明确成长反馈、赛季进度可视化
- +upgrade_satisfaction: 装备/道具升级体验优化

---

## 功能规划

### 1. 每日签到系统 (Daily Rewards)
- [ ] 连续签到奖励机制（7天循环）
- [ ] 签到奖励：金币、道具、经验值
- [ ] 断签重置保护（可使用补签卡）
- **影响**: +return_quality

### 2. 每日任务系统 (Daily Quests)
- [ ] 每日随机任务（3个/天）
- [ ] 任务类型：得分、连击、模式通关
- [ ] 任务刷新：每日0点UTC
- **影响**: +return_quality, +growth_momentum

### 3. 成长系统可视化 (Progression Visualization)
- [ ] 等级经验条UI
- [ ] 经验获取来源：游戏结算、任务奖励、成就
- [ ] 等级解锁新内容（未来功能占位）
- **影响**: +progress_clarity, +upgrade_satisfaction

### 4. 赛季进度展示 (Season Progress)
- [ ] 当前赛季进度条
- [ ] 赛季等级显示
- [ ] 赛季奖励预览
- **影响**: +progress_clarity

### 5. 成就系统扩展 (Achievements v1.2)
- [ ] 新增成就：每日任务完成、签到里程碑
- [ ] 成就分类展示：得分、技巧、收集、里程碑
- **影响**: +progress_clarity

---

## 技术实现

### 模块结构
```
src/modules/
├── daily_rewards.js    # NEW: 签到系统
├── daily_quests.js     # NEW: 每日任务
├── progression.js     # NEW: 成长系统
└── season.js          # MODIFY: 扩展赛季进度
```

### 数据持久化
```javascript
// localStorage keys
'snake-daily-rewards'   // 签到数据
'snake-daily-quests'    // 任务数据
'snake-progression'    // 成长数据
```

### 游戏循环集成
```
game.js
├── initDailyRewards()
├── initDailyQuests()
├── checkDailyReset()
└── onGameEnd() // 结算时给予经验
```

---

## 实施顺序

### Phase 1: 基础设施
1. 签到系统核心逻辑
2. 数据持久化
3. UI基础组件

### Phase 2: 任务系统
1. 每日任务生成
2. 任务追踪与完成检测
3. 任务奖励发放

### Phase 3: 成长反馈
1. 经验系统
2. 等级UI
3. 赛季进度展示

### Phase 4: 整合测试
1. 全系统集成测试
2. 边界情况处理
3. 性能优化

---

## 验收标准

### 功能验收
- [ ] 签到系统：连续签到计算正确，补签功能正常
- [ ] 每日任务：任务生成、追踪、完成、奖励发放
- [ ] 成长系统：经验获取、等级计算、UI更新
- [ ] 赛季进度：显示正确、刷新正常

### 指标验收
- [ ] return_quality ≥ 70% (+5%)
- [ ] progress_clarity ≥ 72% (+4%)
- [ ] upgrade_satisfaction ≥ 73% (+3%)

### 技术验收
- [ ] 代码无 lint 错误
- [ ] 性能无明显退化
- [ ] 旧存档兼容

---

## 时间线

| 阶段 | 预计迭代 |
|------|----------|
| Phase 1 | 1 |
| Phase 2 | 1 |
| Phase 3 | 1 |
| Phase 4 | 1 |
| **总计** | **4** |

---

## 风险评估

### 高风险
- 签到防作弊机制（可选v1.2.1）

### 中风险
- 任务平衡性需要测试验证
- 经验系统数值需要调优

### 低风险
- UI组件开发
- 数据结构设计
