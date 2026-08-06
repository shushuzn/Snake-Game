# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice

---

## [LRN-20260807-001] best_practice

**Logged**: 2026-08-07T02:18:57+0800
**Priority**: high
**Status**: promoted
**Area**: config

### Summary
game.js 巨型闭包状态域渐进迁移的标准方法学: 先子串计数审计 → 模块内聚状态+持久化 → game.js 委托 → Node 模拟验证 → Chromium 全量门禁。

### Details
改革 13 批次(90→55 状态)沉淀的可靠流程:
1. 引用审计: 用**子串计数**(src.split(name).length-1)而非正则——bash+JS 双重转义下 new RegExp('\\b') 会退化为退格字符匹配恒 0
2. 迁移顺序: 周边域(低耦合)→ 效果计时域(主循环边界, 验证可行)→ 核心玩法域(道具 273 引用暂缓)
3. 模块模式: createModule 工厂 + 状态内聚 + 依赖注入( storage/elements/onPersist/回调 ), 不读 window 可变全局
4. 验证双保险: Node vm 沙箱模拟纯逻辑 + Chromium 36/36 全量(成员跑 + 主理人独立复核)
5. 提交: 成员不 commit, 主理人统一提交推送(SSH 443 通道)

### Suggested Action
已固化至 docs/architecture/gamejs-refactor.md 路线图与工作日志; 后续批次沿用此方法学。

### Metadata
- Source: conversation
- Related Files: docs/architecture/gamejs-refactor.md, game.js, src/modules/
- Tags: refactor, state-migration, methodology
- Pattern-Key: refactor.state_domain_migration

---

## [LRN-20260807-002] best_practice

**Logged**: 2026-08-07T02:18:57+0800
**Priority**: high
**Status**: promoted
**Area**: tests

### Summary
Playwright 全量测试在双浏览器(firefox+chromium)下会被 server_integration 的 firefox 联调用例挂起(12min 超时); 验证策略需规避。

### Details
- firefox 的 file:// 页面 fetch http://127.0.0.1:8787 报 NetworkError, 基线对照(HEAD 无改动)同败 = 环境问题非回归
- 该用例在 --workers=4 全量下会挂起拖垮整个任务
- 有效策略: Chromium 全量(--project=chromium)为主; firefox 需 --grep-invert "leaderboard connects to backend" 或单独验证

### Suggested Action
已固化至工作日志; 后续任何全量验证默认用 --project=chromium, firefox 单独确认。

### Metadata
- Source: error
- Related Files: tests/server_integration.spec.js, playwright.config.js
- Tags: playwright, firefox, e2e
- Pattern-Key: tests.playwright_firefox_env

---

## [LRN-20260807-003] correction

**Logged**: 2026-08-07T02:18:57+0800
**Priority**: critical
**Status**: promoted
**Area**: config

### Summary
git stash push/pop 在 index 写入失败时会损坏工作区(文件异常删除)与对象库(blob 缺失), 恢复路径复杂; 必须避免 stash 作为"临时备份"。

### Details
- 事故: `git stash push` 3 文件后 `git stash pop` 报 "could not write index" → 模块文件被删(76→32)、index cache-tree 损坏、HEAD 树 manifest blob 缺失 → push 持续 early EOF
- 恢复路径: 删 index.lock → git restore → raw.githubusercontent.com 按 commit sha 下载缺失文件(hash 校验)→ generate 脚本重建 → 远端 bare clone 补对象 → hash-object -w 补 HEAD 缺失 blob → 清损坏 reflog → push 成功
- 教训: ①stash push 前确认工作区干净 ②stash pop 失败立即恢复勿重复操作 ③push 失败先 `git rev-list --objects <parent>..HEAD` 逐对象校验 ④缺 blob 用 `git hash-object -w` 补

### Suggested Action
已固化至工作日志; 后续避免 stash 作为临时备份, 用 git worktree 或直接 commit 分支替代。

### Metadata
- Source: error
- Related Files: .git/, game.js
- Tags: git, stash, recovery, object-store
- Pattern-Key: git.stash_corruption_recovery

---
