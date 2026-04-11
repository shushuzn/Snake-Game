# 开发规则 v1.0

## 核心规则

### 规则 1: 每个 Commit 必须有可见输出
- ❌ 禁止：纯 JS 模块 commit（只有 src/modules/*.js）
- ✅ 必须：JS 模块 + index.html 注册 + DOM UI 元素

### 规则 2: 版本完成 = UI 可见
- ROADMAP 标记完成前必须验证 UI 可见
- 不能以"模块创建"算作功能完成

### 规则 3: 提交前检查
```bash
bash shared/pre-commit-check.sh
```

### 规则 4: 合并前检查
```bash
bash shared/git-checklist.sh <branch>
```

## 开发流程

```
1. git checkout -b feature/xxx
2. 开发功能
   - 创建 JS 模块
   - 在 index.html 注册 (script 标签)
   - 添加 DOM UI 元素
   - 在 game.js 连接模块
3. bash shared/pre-commit-check.sh
4. git commit
5. bash shared/git-checklist.sh
6. git push
```

## 版本规则

| 类型 | 场景 | 示例 |
|------|------|------|
| feature | 用户可见新功能 | v1.10.0 |
| bugfix | 修复 bug | v1.9.2 |
| patch | 小改小动 | v1.9.1 |

## 错误案例

v1.7.0-v1.9.0 犯了同样错误：
- 创建 JS 模块 → 标记完成 → 下一版本重复
- 用户看不到功能

正确做法（v1.9.1）：
- 模块 + index.html + DOM + game.js → 标记完成
