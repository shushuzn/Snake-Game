# 后端部署指南

`server/` 是独立 Node/Express 服务,可在任何支持 Node 18+ 或 Docker 的平台部署。

## 1. 本地直接运行

```bash
cd server
npm install
npm start                 # http://127.0.0.1:8787
```

## 2. Docker

```bash
# 构建
docker build -t snake-game-server ./server

# 运行(数据持久化到卷)
docker run -d -p 8787:8787 -v snake-data:/app/data snake-game-server
```

## 3. 云平台

适合的平台(按推荐序):

| 平台 | 说明 |
|---|---|
| Railway / Render | 直接连 GitHub 仓库,选 server/ 为根目录,启动命令 `npm start`;挂载卷到 `/app/data` 或修改数据目录 |
| Fly.io | `fly launch` 后在 server/ 下,配置卷 `fly volume create snake_data` |
| 腾讯云 SCF / 轻量服务器 | Docker 镜像或 `node index.js` + systemd |

平台部署要点:
- 端口: 用平台注入的环境变量 `PORT`(index.js 已支持 `PORT` 覆盖)
- 持久化: 数据写入 `server/data/`,平台需挂载持久卷到该目录,否则重启丢数据
- 前端接入: 部署后把线上地址写入前端配置
  `localStorage.setItem('snake_server_url', 'https://你的域名')`

## 4. 前端接入线上后端

游戏页面(静态托管任意处)打开后,控制台执行:

```js
localStorage.setItem('snake_server_url', 'https://your-server.example.com');
location.reload();
```

随后排行榜「远端榜」走线上后端,对局分数自动上报。

## 健康检查

部署完成后验证: `GET https://your-server.example.com/api/health`
