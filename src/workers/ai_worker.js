/**
 * AI Worker - 运行在独立线程的 AI 计算模块
 * 负责：路径搜索、空间评估、方向决策等计算密集型任务
 */

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

const DIRECTION_KEYS = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

const DIFFICULTY_SETTINGS = {
  easy: {
    reactionDelay: 3,
    mistakeChance: 0.15,
    foodPriority: 0.7,
    survivalPriority: 0.3,
    predictDepth: 2
  },
  normal: {
    reactionDelay: 1,
    mistakeChance: 0.05,
    foodPriority: 0.8,
    survivalPriority: 0.2,
    predictDepth: 3
  },
  hard: {
    reactionDelay: 0,
    mistakeChance: 0.02,
    foodPriority: 0.9,
    survivalPriority: 0.1,
    predictDepth: 5
  },
  hell: {
    reactionDelay: 0,
    mistakeChance: 0,
    foodPriority: 1.0,
    survivalPriority: 0,
    predictDepth: 8
  }
};

// AI 状态存储
const aiStates = new Map();
let requestId = 0;

// 处理主线程消息
self.onmessage = function(e) {
  const { type, data, requestId: id } = e.data;
  
  switch (type) {
    case 'create':
      handleCreate(data);
      break;
    case 'init':
      handleInit(data);
      break;
    case 'decision':
      handleDecision(data, id);
      break;
    case 'destroy':
      handleDestroy(data);
      break;
  }
};

function handleCreate({ aiId, difficulty }) {
  const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.normal;
  aiStates.set(aiId, {
    difficulty,
    settings,
    snake: [],
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    moveCooldown: 0
  });
  
  self.postMessage({ type: 'created', data: { aiId, success: true } });
}

function handleInit({ aiId, startX, startY }) {
  const state = aiStates.get(aiId);
  if (!state) return;
  
  state.snake = [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY }
  ];
  state.direction = 'RIGHT';
  state.nextDirection = 'RIGHT';
  state.moveCooldown = 0;
  
  self.postMessage({ type: 'inited', data: { aiId, success: true } });
}

function handleDecision({ aiId, gameState }, id) {
  const state = aiStates.get(aiId);
  if (!state) {
    self.postMessage({ type: 'decision', data: { aiId, decision: null, id }, error: 'AI not found' });
    return;
  }

  const { settings } = state;
  
  // 反应延迟
  if (state.moveCooldown > 0) {
    state.moveCooldown--;
    self.postMessage({ type: 'decision', data: { aiId, decision: null, id } });
    return;
  }
  state.moveCooldown = settings.reactionDelay;

  // 随机犯错
  if (Math.random() < settings.mistakeChance) {
    const decision = getRandomSafeDirection(gameState, state);
    self.postMessage({ type: 'decision', data: { aiId, decision, id } });
    return;
  }

  // AI 决策 - 在 Worker 中执行计算密集型算法
  const decision = findBestDirection(gameState, state);
  state.nextDirection = decision;
  
  self.postMessage({ type: 'decision', data: { aiId, decision, id } });
}

function handleDestroy({ aiId }) {
  aiStates.delete(aiId);
  self.postMessage({ type: 'destroyed', data: { aiId } });
}

function findBestDirection(gameState, state) {
  const { food, obstacles, playerSnake, otherAIs } = gameState;
  const head = state.snake[0];
  const allObstacles = collectAllObstacles(obstacles, playerSnake, otherAIs, state.snake);

  let bestDir = null;
  let bestScore = -Infinity;

  for (const dirKey of DIRECTION_KEYS) {
    const dir = DIRECTIONS[dirKey];
    const newPos = { x: head.x + dir.x, y: head.y + dir.y };

    // 不能反向移动
    if (dirKey === getOppositeDirection(state.direction)) continue;

    // 检查是否撞墙或撞障碍物
    if (isCollision(newPos, allObstacles, gameState.gridWidth, gameState.gridHeight)) {
      continue;
    }

    // 评估这个方向的得分
    let dirScore = evaluateDirection(newPos, food, allObstacles, gameState, state.settings);

    // 预测未来几步
    if (state.settings.predictDepth > 0) {
      dirScore += predictFuture(newPos, dirKey, food, allObstacles, gameState, state.settings.predictDepth);
    }

    if (dirScore > bestScore) {
      bestScore = dirScore;
      bestDir = dirKey;
    }
  }

  return bestDir || getRandomSafeDirection(gameState, state);
}

function evaluateDirection(pos, food, obstacles, gameState, settings) {
  let score = 0;

  // 食物距离得分
  if (food) {
    const distToFood = Math.abs(pos.x - food.x) + Math.abs(pos.y - food.y);
    score += (100 - distToFood) * settings.foodPriority;
  }

  // 周围空间得分（生存评估）
  const spaceScore = evaluateSpace(pos, obstacles, gameState);
  score += spaceScore * settings.survivalPriority;

  // 避免靠近墙壁
  const distToWall = Math.min(
    pos.x, pos.y,
    gameState.gridWidth - 1 - pos.x,
    gameState.gridHeight - 1 - pos.y
  );
  if (distToWall < 2) score -= 20;

  return score;
}

function predictFuture(pos, dir, food, obstacles, gameState, depth) {
  if (depth <= 0) return 0;

  let score = 0;
  const futurePos = { ...pos };
  const directionVector = DIRECTIONS[dir];

  for (let i = 1; i <= depth; i++) {
    futurePos.x += directionVector.x;
    futurePos.y += directionVector.y;

    if (isCollision(futurePos, obstacles, gameState.gridWidth, gameState.gridHeight)) {
      score -= 30 * (depth - i + 1);
      break;
    }

    if (food && futurePos.x === food.x && futurePos.y === food.y) {
      score += 50 * i;
    }
  }

  return score;
}

function evaluateSpace(pos, obstacles, gameState) {
  // Flood Fill 算法评估从该位置可到达的空间
  const visited = new Set();
  const queue = [pos];
  visited.add(`${pos.x},${pos.y}`);
  let spaceCount = 0;
  const maxSearch = 50;

  while (queue.length > 0 && spaceCount < maxSearch) {
    const current = queue.shift();
    spaceCount++;

    for (const dir of Object.values(DIRECTIONS)) {
      const next = { x: current.x + dir.x, y: current.y + dir.y };
      const key = `${next.x},${next.y}`;
      if (!visited.has(key) && !isCollision(next, obstacles, gameState.gridWidth, gameState.gridHeight)) {
        visited.add(key);
        queue.push(next);
      }
    }
  }

  return Math.min(spaceCount, 50);
}

function getRandomSafeDirection(gameState, state) {
  const safeDirections = DIRECTION_KEYS.filter(dir => {
    if (dir === getOppositeDirection(state.direction)) return false;
    const newPos = {
      x: state.snake[0].x + DIRECTIONS[dir].x,
      y: state.snake[0].y + DIRECTIONS[dir].y
    };
    return !isCollision(newPos, collectAllObstacles([], state.snake, [], state.snake), gameState.gridWidth, gameState.gridHeight);
  });

  return safeDirections.length > 0
    ? safeDirections[Math.floor(Math.random() * safeDirections.length)]
    : null;
}

function collectAllObstacles(obstacles, playerSnake, otherAIs, ownSnake) {
  const all = [...(obstacles || [])];
  if (playerSnake) all.push(...playerSnake);
  if (otherAIs) {
    otherAIs.forEach(ai => {
      if (ai.snake) all.push(...ai.snake);
    });
  }
  if (ownSnake) all.push(...ownSnake);
  return all;
}

function isCollision(pos, obstacles, gridWidth, gridHeight) {
  if (pos.x < 0 || pos.x >= gridWidth || pos.y < 0 || pos.y >= gridHeight) {
    return true;
  }
  return obstacles.some(obs => obs.x === pos.x && obs.y === pos.y);
}

function getOppositeDirection(dir) {
  const opposites = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
  return opposites[dir];
}
