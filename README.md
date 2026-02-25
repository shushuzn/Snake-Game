# Snake 单文件网页游戏

这是一个无需构建工具的单文件贪吃蛇项目，核心实现都在 `index.html` 中，开箱即玩。

## 功能亮点

- 经典 / 限时模式、难度与皮肤切换。
- 多种道具机制：基础果、奖励果、护盾果、倍率果、时间果、冰冻果、相位果、王冠果。
- 障碍与硬核玩法、任务与连击系统。
- 本地持久化：设置、历史、成就、图鉴、最佳分等数据保存在 `localStorage`。

## 本地运行

```bash
python3 -m http.server 4173
# 浏览器打开 http://localhost:4173/index.html
```

## 版本维护

项目提供脚本用于同步更新页面可见版本与 `GAME_VERSION`：

```bash
python3 skills/snake-feature-evolver/scripts/bump_version.py 0.22.1
```

## 基础检查

```bash
node -e "const fs=require('fs');const m=fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*)<\/script>/);new Function(m[1]);console.log('js ok')"
git diff --check
```
