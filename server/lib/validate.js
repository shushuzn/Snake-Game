/**
 * 输入校验与通用工具。
 */
function clampInt(v, min, max, fallback) {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function cleanStr(v, maxLen, fallback = '') {
  if (typeof v !== 'string') return fallback;
  return v.trim().slice(0, maxLen);
}

module.exports = { clampInt, cleanStr };
