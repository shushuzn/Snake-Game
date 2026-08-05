/**
 * JSON 文件存储 — 排行榜分数与账号数据。
 * 轻量实现: 内存缓存 + 原子写盘(临时文件 + rename), 避免并发写损坏。
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SCORES_FILE = path.join(DATA_DIR, 'scores.json');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`[store] read failed ${file}:`, err.message);
    return fallback;
  }
}

function atomicWrite(file, data) {
  const tmp = file + '.' + process.pid + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

class Store {
  constructor() {
    ensureDataDir();
    this.scores = readJson(SCORES_FILE, []);
    this.accounts = readJson(ACCOUNTS_FILE, {});
    this._saveScores = this._saveScores.bind(this);
    this._saveAccounts = this._saveAccounts.bind(this);
  }

  _saveScores() {
    atomicWrite(SCORES_FILE, this.scores);
  }

  _saveAccounts() {
    atomicWrite(ACCOUNTS_FILE, this.accounts);
  }

  // ---------- 排行榜 ----------
  addScore(entry) {
    const rec = {
      id: crypto.randomUUID(),
      player: String(entry.player || 'Anonymous').slice(0, 20),
      score: Math.max(0, Math.floor(Number(entry.score) || 0)),
      mode: String(entry.mode || 'classic').slice(0, 40),
      ts: Date.now(),
      ...(entry.challengeSeed ? { challengeSeed: String(entry.challengeSeed).slice(0, 64) } : {}),
      ...(entry.dlcPack ? { dlcPack: String(entry.dlcPack).slice(0, 40) } : {}),
    };
    this.scores.push(rec);
    // 保留最近 5000 条
    if (this.scores.length > 5000) this.scores = this.scores.slice(-5000);
    this._saveScores();
    return rec;
  }

  listScores({ mode, limit = 20 } = {}) {
    let list = this.scores;
    if (mode) list = list.filter((s) => s.mode === mode);
    return list
      .sort((a, b) => b.score - a.score || a.ts - b.ts)
      .slice(0, Math.min(100, Math.max(1, Number(limit) || 20)));
  }

  // ---------- 账号 ----------
  registerAccount(name) {
    const id = crypto.randomUUID();
    const token = crypto.randomUUID();
    const account = {
      id,
      name: String(name || 'Player').slice(0, 20),
      token,
      createdAt: Date.now(),
      data: {},
    };
    this.accounts[id] = account;
    this._saveAccounts();
    return account;
  }

  getAccount(id) {
    return this.accounts[id] || null;
  }

  updateAccount(id, token, patch) {
    const account = this.accounts[id];
    if (!account) return { error: 'not_found' };
    if (account.token !== token) return { error: 'forbidden' };
    const allowed = patch && typeof patch === 'object' ? patch : {};
    if (typeof allowed.data === 'object' && allowed.data !== null) {
      account.data = allowed.data;
    }
    if (typeof allowed.name === 'string') {
      account.name = allowed.name.slice(0, 20);
    }
    this._saveAccounts();
    return { account };
  }
}

module.exports = new Store();
