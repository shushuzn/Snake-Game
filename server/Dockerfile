# Snake Game 在线后端 — 容器镜像
# 构建: docker build -t snake-game-server ./server
# 运行: docker run -d -p 8787:8787 -v snake-data:/app/data snake-game-server
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY index.js ./
COPY lib ./lib

ENV PORT=8787
EXPOSE 8787

# 数据目录 (挂载卷持久化, 见运行示例)
VOLUME ["/app/data"]

CMD ["node", "index.js"]
