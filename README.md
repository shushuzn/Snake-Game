# Snake 单文件网页游戏

这是一个**无需构建工具、无需安装依赖**的单文件贪吃蛇项目，核心逻辑、样式与 UI 都在 `index.html` 中，开箱即玩。

## 项目特点

- **零构建运行**：直接用静态服务器打开即可。
- **模式丰富**：支持经典 / 限时模式，可切换难度和皮肤。
- **道具系统完整**：包含基础果、奖励果、护盾果、倍率果、时间果、冰冻果、相位果、王冠果。
- **进阶玩法**：障碍机制、硬核挑战、任务与连击系统。
- **本地持久化**：设置、历史、成就、图鉴、最佳分等数据保存在 `localStorage`。

## 目录说明

```text
.
├── index.html                                   # 游戏本体（HTML/CSS/JS 全在单文件内）
├── README.md                                    # 项目说明文档
└── skills/snake-feature-evolver/
    ├── SKILL.md                                 # 功能演进说明
    ├── references/modes-and-systems.md          # 模式与系统参考
    └── scripts/bump_version.py                  # 版本号同步脚本
```

## 快速开始

### 方式一：Python 内置服务器（推荐）

```bash
python3 -m http.server 4173
# 浏览器打开 http://localhost:4173/index.html
```

### 方式二：直接双击打开

也可以直接在浏览器中打开 `index.html`。但若浏览器对本地文件策略更严格，建议使用上面的静态服务器方式。

## 玩法概览

- 使用键盘方向键（或页面提供的操作方式）控制蛇移动。
- 通过吃果实获得分数与成长。
- 规避墙体、障碍和碰撞风险。
- 在限时模式中尽量提升单位时间得分效率。

> 提示：不同道具效果可叠加或互相影响，建议在不同难度下尝试组合策略。

## 数据存储与重置

本项目使用浏览器 `localStorage` 存储玩家数据。常见场景：

- 换浏览器或清理缓存后，历史记录可能丢失。
- 在同一浏览器同一域名下可保留历史数据。

如需“完全重置”，可在浏览器开发者工具中清除该站点的 Local Storage。

## 版本维护

项目提供脚本用于同步更新页面可见版本与 `GAME_VERSION`：

```bash
python3 skills/snake-feature-evolver/scripts/bump_version.py 0.22.1
```

建议在每次发版时执行该脚本，避免页面显示版本与代码常量不一致。

## 开发与自检

### JavaScript 语法检查

```bash
node -e "const fs=require('fs');const m=fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*)<\/script>/);new Function(m[1]);console.log('js ok')"
```

### Git 空白与冲突标记检查

```bash
git diff --check
```

## 后续发展建议（Roadmap）

- 增加移动端更友好的触控手势与按钮布局。
- 提供自定义地图与障碍编辑器。
- 增加“每日挑战”与排行榜上传（可选后端）。
- 优化新手引导与道具说明可视化。

---

如果你在游玩或开发过程中发现问题，欢迎提交 issue 或直接发起改进 PR。
