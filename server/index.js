/**
 * Snake Game 在线后端 — 排行榜 + 账号 API
 *
 * 启动: PORT=8787 npm start (默认 8787)
 * API:
 *   GET  /api/health                         健康检查
 *   GET  /api/leaderboard?mode=&limit=       排行榜(按分数降序)
 *   POST /api/leaderboard                    提交分数 {player,score,mode,challengeSeed?,dlcPack?}
 *   POST /api/account/register               注册账号 {name} -> {id,token}
 *   GET  /api/account/:id?token=             读取账号
 *   PUT  /api/account/:id                    更新账号 {token, name?, data?}
 *
 * 数据存储: server/data/*.json (JSON 文件, 原子写)
 */
const express = require('express');
const store = require('./lib/store');
const { clampInt, cleanStr } = require('./lib/validate');

const PORT = Number(process.env.PORT || 8787);
const app = express();

// ---------- 中间件 ----------
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

// CORS: 允许任意来源(前端可能部署在 file:// 或任意域名)
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// 请求日志
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

// ---------- 健康检查 ----------
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'snake-game-server', ts: Date.now() });
});

// ---------- 排行榜 ----------
app.get('/api/leaderboard', (req, res) => {
  const mode = cleanStr(req.query.mode, 40, '');
  const limit = clampInt(req.query.limit, 1, 100, 20);
  const entries = store.listScores({ mode: mode || undefined, limit });
  res.json({ entries });
});

app.post('/api/leaderboard', (req, res) => {
  const body = req.body || {};
  const score = clampInt(body.score, 0, 100000000, 0);
  if (score <= 0) {
    return res.status(400).json({ ok: false, error: 'invalid score' });
  }
  const entry = store.addScore({
    player: cleanStr(body.player, 20, 'Anonymous'),
    score,
    mode: cleanStr(body.mode, 40, 'classic'),
    challengeSeed: cleanStr(body.challengeSeed, 64, ''),
    dlcPack: cleanStr(body.dlcPack, 40, ''),
  });
  res.json({ ok: true, entry });
});

// ---------- 账号 ----------
app.post('/api/account/register', (req, res) => {
  const body = req.body || {};
  const account = store.registerAccount(cleanStr(body.name, 20, 'Player'));
  res.json({ ok: true, account });
});

app.get('/api/account/:id', (req, res) => {
  const account = store.getAccount(cleanStr(req.params.id, 64));
  if (!account) return res.status(404).json({ ok: false, error: 'not_found' });
  const { token, ...safe } = account;
  void token;
  res.json({ ok: true, account: safe });
});

app.put('/api/account/:id', (req, res) => {
  const id = cleanStr(req.params.id, 64);
  const body = req.body || {};
  const result = store.updateAccount(id, cleanStr(body.token, 64), body);
  if (result.error === 'not_found') return res.status(404).json({ ok: false, error: 'not_found' });
  if (result.error === 'forbidden') return res.status(403).json({ ok: false, error: 'forbidden' });
  res.json({ ok: true, account: result.account });
});

// ---------- 兜底 ----------
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'not_found' });
});

app.use((err, req, res, next) => {
  void next;
  console.error('[error]', err);
  res.status(500).json({ ok: false, error: 'internal_error' });
});

app.listen(PORT, () => {
  console.log(`snake-game-server listening on http://127.0.0.1:${PORT}`);
});
