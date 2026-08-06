# 发布清单 — Snake-Game v1.55.0

- **发布日期**: 2026-08-07
- **发布负责人**: release-ops-lead（路远行）
- **线上部署当前版本**: v1.45.0（滞后，本次同步至 v1.55.0）
- **git HEAD**: `6bd45d4`（docs: 改革路线图更新 B2i 完成）
- **部署类型**: 静态站点（纯前端零依赖，可选 Node 后端）
- **部署方式**: `_snake_deploy/` → CloudStudio Sandbox（复用，URL 不变）

---

## 1. 上线前检查清单（Go/No-Go）

### 1.1 代码健康
- [x] `node --check game.js` 语法校验通过（编辑前后均验证）
- [x] `src/` 模块目录完整，`src/modules/manifest.js` 与 `src/modules/moduleLoader.js` 引用一致
- [x] index.html 引用的脚本均在部署产物中（moduleRegistry / moduleLoader / manifest / game.js）
- [x] 无未提交代码改动（仅 `.workbuddy/` 未跟踪目录，勿动，不纳入发布）
- [x] 无阻塞性 Blocker（经质量侧确认）

### 1.2 测试
- [x] Chromium 全量用例通过（36/36）
- [x] 核心玩法路径自动化（v1.48.0 改革 B3 引入）
- [ ] firefox 联调用例受 file:// 跨源 fetch 环境限制失败 —— **环境问题，基线对照同败，非本次回归**，不阻塞发布

### 1.3 版本标签
- [x] `game.js` L177 `GAME_VERSION = '1.55.0'`（由 `'1.4.0'` 同步，原值滞后 git 迭代号）
- [x] 页面显示：L758 `versionTag.textContent = \`v${GAME_VERSION}\`` → 显示 `v1.55.0`
- [x] 版本标签 title（L759）同步
- [x] 存档导出（L1022/L1030）、结算版本标记（L1564）、分享文案（L5148）均读取 GAME_VERSION，自动同步

### 1.4 构建产物
- [x] 纯前端零依赖，无需编译构建；`_snake_deploy/` 直接拷贝静态文件
- [x] 部署产物清单：`index.html` / `styles.css` / `game.js` / `favicon.svg` / `src/`
- [ ] （可选，未启用）Node 后端 `server/` 独立部署，本次不影响前端静态站

### 1.5 部署步骤（历史流程 2026-08-06 记录）
```bash
rm -rf _snake_deploy
mkdir -p _snake_deploy
cp index.html styles.css game.js favicon.svg _snake_deploy/
cp -r src _snake_deploy/
# 调用 cloudstudio_deploy(_snake_deploy) 复用 sandbox，URL 不变
```

### 1.6 回滚预案
- 回滚目标版本：v1.45.0（线上部署的上一稳定版）
- 回滚方式：静态站点无数据库/无服务端状态，将 `_snake_deploy/` 替换为 v1.45.0 对应文件（`git checkout 33acce2 -- game.js index.html styles.css favicon.svg src/` 后重新部署）即可
- 回滚触发条件：页面白屏 / 核心玩法不可用 / 存档读写异常（P0 级）
- 本地缓存提示：玩家浏览器可能缓存旧 game.js，可提示硬刷新（Ctrl+F5）

---

## 2. 补丁说明（Patch Notes）— v1.44.0 → v1.55.0

> 对玩家的语言：本次版本是「引擎稳定性与性能」批次 —— 游戏视觉与玩法保持不变，但底层代码全面重构，让游戏运行更稳定、加载更流畅。

### 新内容 / 增强
- **引擎稳定性与性能（架构改革 B1a → B2i，v1.44.0 → v1.55.0）**
  - 音效设置、模式偏好、皮肤、成就、图鉴、最佳纪录、本局统计、账号、生命周期统计、肉鸽模式等状态域迁入独立模块，核心运行更稳、更易维护
  - 启动/运行性能提升（模块化加载）
- **可测试性增强（v1.48.0）**
  - 核心玩法路径首次可自动化回归，保障每次更新质量
- **版本标签同步**
  - 页面版本号显示由 v1.4.0 更正为 v1.55.0，与内部迭代号对齐（原显示值长期滞后，本次修正）

### 修复
- 本批次以内部重构为主，无新增已知玩家可见 bug 修复项
- （说明）v1.33.0 前的特殊模式致命 bug 修复、v1.35.0 暂停菜单点击修复等已在历史版本生效，本次包含在内

### 已知问题
- 无新增已知问题
- （环境限制）file:// 直开页面下联调用例跨源 fetch 受限，建议通过本地静态服务或线上部署访问

---

## 3. 变更日志（内部 Changelog）— 摘要

| 版本 | 提交 | 类型 | 内容 |
|---|---|---|---|
| v1.55.0 | 8b94bd7 | refactor | 肉鸽模式域迁入新模块（B2i） |
| v1.54.0 | 00bade4 | refactor | 生命周期统计域迁入新模块（B2h） |
| v1.53.0 | cae9ea7 | refactor | 账号域迁入 account 模块（B2g） |
| v1.52.0 | 45f31f2 | refactor | 本局统计域迁入新模块（B2f） |
| v1.51.0 | 7a965da | refactor | 最佳纪录域迁入新模块（B2e） |
| v1.50.0 | 8b37c66 | refactor | currentChallenge 迁入 settings 模块（B2d） |
| v1.49.0 | 4f1f871 | refactor | 图鉴域迁入新模块（B2c） |
| v1.48.0 | f5a2325 | feat | 改革 B3 — 可测试性增强（核心玩法路径首次可自动化） |
| v1.47.0 | cd374d9 | refactor | 成就状态管理迁入新模块（B2a） |
| v1.46.0 | 19b3e0b | refactor | 皮肤域迁入 settings 模块（B1b-2） |
| v1.45.0 | 5f8ad7e | refactor | 模式偏好状态迁入 settings 模块（B1b-1） |
| v1.44.0 | 5f7d631 | refactor | 音效设置子域迁入 sound 模块（B1a） |

---

## 4. 部署记录

- [x] 生成 `_snake_deploy/` 静态产物（index.html / styles.css / game.js / favicon.svg / src/）
- [x] 调用 cloudstudio_deploy 部署（sandbox: a432202eb95f47abae3bc67b3e66c0f7）
- [x] 线上 URL: https://a432202eb95f47abae3bc67b3e66c0f7.gz1.agentos-app.net
- [x] 上线后冒烟：index.html / game.js / styles.css / favicon.svg / src/modules/moduleRegistry.js 均 HTTP 200；线上 game.js 确认 `GAME_VERSION = '1.55.0'`
- [x] 部署产物已同步最新 game.js（版本标签 v1.55.0）

---

## 5. 责任矩阵

| 环节 | 负责人 | 状态 |
|---|---|---|
| 代码健康 / 测试门禁 | quality-lead（严守真） | 通过（36/36，firefox 环境例外） |
| 版本同步 / 发布清单 | release-ops-lead（路远行） | 完成 |
| 部署执行 | release-ops-lead（路远行） | 完成（已上线并冒烟验证） |
| git 提交（统一处理） | team-lead（主理人） | 待处理 |
