# Errors

Command failures and integration errors.

---

## [ERR-20260807-001] git_stash_pop

**Logged**: 2026-08-07T02:18:57+0800
**Priority**: critical
**Status**: resolved
**Area**: config

### Summary
git stash pop 报 "could not write index" 导致工作区文件异常删除 + 对象库损坏 + push early EOF

### Error
```
error: could not write index
The stash entry is kept in case you need it again.
fatal: unable to read 1c3079356c6641cd0c938c514f7e9ca9ad63b8d4
error: remote unpack failed: index-pack failed
remote: fatal: early EOF
```

### Context
- 命令: git stash push(3 文件)后 git stash pop
- 环境: Windows git-bash, 仓库 D:\OpenClaw\Snake-Game
- 影响: src/modules/ 76→32 文件、index cache-tree 损坏、HEAD 树 manifest blob 缺失

### Suggested Fix
恢复路径: ①rm .git/index.lock → ②git restore src/modules/ → ③缺失文件用 raw.githubusercontent.com 按 commit sha 下载(hash-object 校验)→ ④generate-modules.mjs 重建 manifest → ⑤远端 bare clone 复制 objects → ⑥hash-object -w 补 HEAD 缺失 blob → ⑦清理损坏 reflog → push。避免 stash 作临时备份, 用 worktree 或 commit 分支替代。

### Metadata
- Reproducible: unknown
- Related Files: .git/
- See Also: LRN-20260807-003

---

## [ERR-20260807-002] playwright_firefox_server_integration

**Logged**: 2026-08-07T02:18:57+0800
**Priority**: medium
**Status**: resolved
**Area**: tests

### Summary
Playwright firefox 联调用例(server_integration)在 file:// 页面 fetch 本地后端时 NetworkError, 且全量运行时挂起 12min

### Error
```
Error: expect(received).toContain(expected)
Expected substring: "2200"
Received string: "远端综合榜：请求失败（NetworkError when attempting to fetch resource.），已回退本地数据"
```

### Context
- 命令: playwright test --workers=4(双浏览器全量)
- firefox 对 file:// origin 发起 http://127.0.0.1:8787 跨源请求被拦截; 基线对照(HEAD 无改动)同败 = 环境问题
- Chromium 同用例 2/2 通过

### Suggested Fix
全量验证用 --project=chromium; firefox 单独跑时 --grep-invert "leaderboard connects to backend"; 该用例在 firefox 下为已知环境限制, 非回归。

### Metadata
- Reproducible: yes
- Related Files: tests/server_integration.spec.js
- See Also: LRN-20260807-002

---
