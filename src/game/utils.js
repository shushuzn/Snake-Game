// ============================================================
// 纯工具函数（无闭包依赖，可安全独立）
// 从 game.js bootSnakeGame 闭包中抽取
// ============================================================

export function encodeRocks(rockList) {
  return rockList.map(item => `${item.x},${item.y}`).join('\n');
}

export function encodeMapPayload(rockList) {
  return rockList.map(item => `${item.x},${item.y}`).join(';');
}

export function checksumMapPayload(payload) {
  let acc = 7;
  for (let i = 0; i < payload.length; i += 1) {
    acc = (acc * 131 + payload.charCodeAt(i)) % 104729;
  }
  return acc.toString(36).toUpperCase();
}

export function getMapRiskLevel(coveragePercent) {
  if (coveragePercent >= 14) return '高';
  if (coveragePercent >= 8) return '中';
  return '低';
}

export function getRecommendedModeByCoverage(coveragePercent) {
  if (coveragePercent >= 14) return '经典/限时（谨慎）';
  if (coveragePercent >= 8) return '经典/肉鸽';
  return '经典/无尽';
}
