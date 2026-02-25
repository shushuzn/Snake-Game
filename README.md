# Snake 多文件网页游戏

这是一个**无需构建工具、无需安装依赖**的贪吃蛇网页项目，现已从单文件结构发展为多文件结构：

- `index.html`：页面结构与控件布局
- `styles.css`：样式与响应式布局
- `game.js`：游戏主逻辑与状态管理

## 当前能力（持续发展中）

- **4 种模式**：经典、限时 60 秒、无尽关卡、肉鸽模式。
- **多输入支持**：方向键、W/A/S/D、触屏方向键、滑动。
- **道具与成长**：基础果、奖励果、护盾果、倍率果、时间果、冰冻果、相位果、王冠果、连击果。
- **系统机制**：障碍、硬核模式、连击、任务、成就、图鉴、高对比显示开关、精简HUD开关、失焦自动暂停开关。
- **局外成长**：肉鸽词条 + 肉鸽点成长。
- **本地持久化**：设置、战绩、最佳分、模式记录、成就等数据保存在 `localStorage`。

## 目录结构

```text
.
├── index.html                                   # 页面结构
├── styles.css                                   # 页面样式
├── game.js                                      # 游戏逻辑
├── README.md                                    # 项目说明
└── skills/snake-feature-evolver/
    ├── SKILL.md
    ├── references/modes-and-systems.md
    └── scripts/bump_version.py
```

## 快速开始

```bash
python3 -m http.server 4173
# 浏览器访问 http://localhost:4173/index.html
```

也可直接打开 `index.html`，但建议优先使用本地静态服务器。

## 开发自检

### 1) JavaScript 语法检查

```bash
node --check game.js
```

### 2) HTML/CSS/JS 资源引用检查（快速）

```bash
rg -n "styles.css|game.js" index.html
```

### 3) Git 空白与冲突标记检查

```bash
git diff --check
```

## 版本维护

同步页面可见版本与 `GAME_VERSION`：

```bash
python3 skills/snake-feature-evolver/scripts/bump_version.py 0.32.2
```

## 最新进展

- v0.32.2：新增失焦自动暂停开关，可按习惯关闭后台自动暂停。
- v0.32.1：新增精简HUD开关，移动端阅读更聚焦，且偏好可持久化。
- v0.32.0：重写前端布局与视觉层次，保留原有玩法系统与存档兼容。

## 后续发展方向

- 继续拆分 `game.js`（输入、渲染、模式系统模块化）。
- 提供地图/障碍编辑器。
- 增加每日挑战与排行榜（可选后端）。
- 优化移动端交互与新手引导。
