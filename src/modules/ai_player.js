window.SnakeAIPlayer = (() => {
  const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
  };

  const DIRECTION_KEYS = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

  function createAIPlayer({ difficulty = 'normal', gridSize = 20, gameMode = 'classic' } = {}) {
    let snake = [];
    let direction = 'RIGHT';
    let nextDirection = 'RIGHT';
    let score = 0;
    let isAlive = true;
    let difficultySettings = getDifficultySettings(difficulty);
    let moveCooldown = 0;

    function getDifficultySettings(diff) {
      const settings = {
        easy: {
          reactionDelay: 3,      // 反应延迟（tick数）
          mistakeChance: 0.15,   // 犯错概率
          foodPriority: 0.7,     // 食物优先级
          survivalPriority: 0.3, // 生存优先级
          predictDepth: 2        // 预测深度
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
      return settings[diff] || settings.normal;
    }

    function init(startX, startY) {
      snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
      ];
      direction = 'RIGHT';
      nextDirection = 'RIGHT';
      score = 0;
      isAlive = true;
      moveCooldown = 0;
    }

    function getSnake() {
      return snake;
    }

    function getScore() {
      return score;
    }

    function getDirection() {
      return direction;
    }

    function isDead() {
      return !isAlive;
    }

    function getHead() {
      return snake[0];
    }

    function grow() {
      const tail = snake[snake.length - 1];
      snake.push({ ...tail });
      score += 10;
    }

    function makeDecision(gameState) {
      if (!isAlive) return;

      // 反应延迟
      if (moveCooldown > 0) {
        moveCooldown--;
        return;
      }
      moveCooldown = difficultySettings.reactionDelay;

      // 随机犯错
      if (Math.random() < difficultySettings.mistakeChance) {
        makeRandomMove(gameState);
        return;
      }

      // AI决策
      const bestDirection = findBestDirection(gameState);
      if (bestDirection && bestDirection !== getOppositeDirection(direction)) {
        nextDirection = bestDirection;
      }
    }

    function findBestDirection(gameState) {
      const { food, obstacles, playerSnake, otherAIs } = gameState;
      const head = getHead();
      const allObstacles = collectAllObstacles(obstacles, playerSnake, otherAIs);

      let bestDir = null;
      let bestScore = -Infinity;

      for (const dirKey of DIRECTION_KEYS) {
        const dir = DIRECTIONS[dirKey];
        const newPos = {
          x: head.x + dir.x,
          y: head.y + dir.y
        };

        // 不能反向移动
        if (dirKey === getOppositeDirection(direction)) continue;

        // 检查是否撞墙或撞障碍物
        if (isCollision(newPos, allObstacles, gameState.gridWidth, gameState.gridHeight)) {
          continue;
        }

        // 评估这个方向的得分
        let dirScore = evaluateDirection(newPos, food, allObstacles, gameState);

        // 预测未来几步
        if (difficultySettings.predictDepth > 0) {
          dirScore += predictFuture(newPos, dirKey, food, allObstacles, gameState, difficultySettings.predictDepth);
        }

        if (dirScore > bestScore) {
          bestScore = dirScore;
          bestDir = dirKey;
        }
      }

      return bestDir || getRandomSafeDirection(allObstacles, gameState);
    }

    function evaluateDirection(pos, food, obstacles, gameState) {
      let score = 0;

      // 食物距离得分
      if (food) {
        const distToFood = Math.abs(pos.x - food.x) + Math.abs(pos.y - food.y);
        score += (100 - distToFood) * difficultySettings.foodPriority;
      }

      // 周围空间得分（生存评估）
      const spaceScore = evaluateSpace(pos, obstacles, gameState);
      score += spaceScore * difficultySettings.survivalPriority;

      // 避免靠近墙壁
      const distToWall = Math.min(
        pos.x,
        pos.y,
        gameState.gridWidth - 1 - pos.x,
        gameState.gridHeight - 1 - pos.y
      );
      if (distToWall < 2) score -= 20;

      return score;
    }

    function predictFuture(pos, dir, food, obstacles, gameState, depth) {
      if (depth <= 0) return 0;

      // 简单的未来预测，检查走几步后是否还有路
      let score = 0;
      const futurePos = { ...pos };
      const directionVector = DIRECTIONS[dir];

      for (let i = 1; i <= Math.min(depth, 3); i++) {
        futurePos.x += directionVector.x;
        futurePos.y += directionVector.y;

        if (isCollision(futurePos, obstacles, gameState.gridWidth, gameState.gridHeight)) {
          score -= 30 * (depth - i + 1);
          break;
        }

        // 如果靠近食物，加分
        if (food && futurePos.x === food.x && futurePos.y === food.y) {
          score += 50 * i;
        }
      }

      return score;
    }

    function evaluateSpace(pos, obstacles, gameState) {
      // 使用Flood Fill算法评估从该位置可到达的空间
      const visited = new Set();
      const queue = [pos];
      visited.add(`${pos.x},${pos.y}`);
      let spaceCount = 0;
      const maxSearch = 50; // 限制搜索范围

      while (queue.length > 0 && spaceCount < maxSearch) {
        const current = queue.shift();
        spaceCount++;

        for (const dir of Object.values(DIRECTIONS)) {
          const next = {
            x: current.x + dir.x,
            y: current.y + dir.y
          };

          const key = `${next.x},${next.y}`;
          if (!visited.has(key) && !isCollision(next, obstacles, gameState.gridWidth, gameState.gridHeight)) {
            visited.add(key);
            queue.push(next);
          }
        }
      }

      return Math.min(spaceCount, 50);
    }

    function makeRandomMove(gameState) {
      const safeDirections = DIRECTION_KEYS.filter(dir => {
        if (dir === getOppositeDirection(direction)) return false;
        const newPos = {
          x: getHead().x + DIRECTIONS[dir].x,
          y: getHead().y + DIRECTIONS[dir].y
        };
        return !isCollision(newPos, [], gameState.gridWidth, gameState.gridHeight);
      });

      if (safeDirections.length > 0) {
        nextDirection = safeDirections[Math.floor(Math.random() * safeDirections.length)];
      }
    }

    function getRandomSafeDirection(obstacles, gameState) {
      const safeDirections = DIRECTION_KEYS.filter(dir => {
        if (dir === getOppositeDirection(direction)) return false;
        const newPos = {
          x: getHead().x + DIRECTIONS[dir].x,
          y: getHead().y + DIRECTIONS[dir].y
        };
        return !isCollision(newPos, obstacles, gameState.gridWidth, gameState.gridHeight);
      });

      return safeDirections.length > 0
        ? safeDirections[Math.floor(Math.random() * safeDirections.length)]
        : null;
    }

    function collectAllObstacles(obstacles, playerSnake, otherAIs) {
      const all = [...(obstacles || [])];

      if (playerSnake) {
        all.push(...playerSnake);
      }

      if (otherAIs) {
        otherAIs.forEach(ai => {
          if (ai !== this && ai.getSnake) {
            all.push(...ai.getSnake());
          }
        });
      }

      // 避开自己的身体
      all.push(...snake);

      return all;
    }

    function isCollision(pos, obstacles, gridWidth, gridHeight) {
      // 撞墙
      if (pos.x < 0 || pos.x >= gridWidth || pos.y < 0 || pos.y >= gridHeight) {
        return true;
      }

      // 撞障碍物或蛇
      return obstacles.some(obs => obs.x === pos.x && obs.y === pos.y);
    }

    function getOppositeDirection(dir) {
      const opposites = {
        UP: 'DOWN',
        DOWN: 'UP',
        LEFT: 'RIGHT',
        RIGHT: 'LEFT'
      };
      return opposites[dir];
    }

    function move() {
      if (!isAlive) return false;

      direction = nextDirection;
      const head = getHead();
      const dir = DIRECTIONS[direction];
      const newHead = {
        x: head.x + dir.x,
        y: head.y + dir.y
      };

      snake.unshift(newHead);
      snake.pop();

      return true;
    }

    function checkSelfCollision() {
      const head = getHead();
      for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
          isAlive = false;
          return true;
        }
      }
      return false;
    }

    function checkCollisionWith(otherSnake) {
      const head = getHead();
      return otherSnake.some(segment => segment.x === head.x && segment.y === head.y);
    }

    function getColor() {
      const colors = {
        easy: '#4CAF50',
        normal: '#2196F3',
        hard: '#FF9800',
        hell: '#F44336'
      };
      return colors[difficulty] || colors.normal;
    }

    function getName() {
      const names = {
        easy: 'AI·新手',
        normal: 'AI·普通',
        hard: 'AI·困难',
        hell: 'AI·地狱'
      };
      return names[difficulty] || 'AI';
    }

    return {
      init,
      getSnake,
      getScore,
      getDirection,
      isDead,
      getHead,
      grow,
      makeDecision,
      move,
      checkSelfCollision,
      checkCollisionWith,
      getColor,
      getName,
      getDifficulty: () => difficulty
    };
  }

  return { createAIPlayer };
})();

// AI对战游戏控制器
window.SnakeAIBattle = (() => {
  function createAIBattleController({
    canvas,
    gridSize,
    tileCount,
    onGameOver,
    onScoreUpdate,
    render
  }) {
    let player = null;
    let aiPlayers = [];
    let food = null;
    let obstacles = [];
    let isRunning = false;
    let difficulty = 'normal';
    let gameMode = 'ai-battle';

    function init(diff = 'normal', aiCount = 1) {
      difficulty = diff;
      const startPositions = getStartPositions(aiCount + 1);

      // 初始化玩家
      player = {
        snake: [
          { x: startPositions[0].x, y: startPositions[0].y },
          { x: startPositions[0].x - 1, y: startPositions[0].y },
          { x: startPositions[0].x - 2, y: startPositions[0].y }
        ],
        direction: 'RIGHT',
        score: 0,
        isAlive: true,
        color: '#00FF00'
      };

      // 初始化AI
      aiPlayers = [];
      for (let i = 0; i < aiCount; i++) {
        const ai = window.SnakeAIPlayer.createAIPlayer({
          difficulty: diff,
          gridSize,
          gameMode
        });
        ai.init(startPositions[i + 1].x, startPositions[i + 1].y);
        aiPlayers.push(ai);
      }

      // 生成食物
      spawnFood();

      // 生成障碍物（地狱难度）
      obstacles = [];
      if (diff === 'hell') {
        generateObstacles();
      }

      isRunning = true;
    }

    function getStartPositions(count) {
      const positions = [];
      const margin = 5;
      const cols = Math.ceil(Math.sqrt(count));

      for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        positions.push({
          x: margin + col * Math.floor((tileCount.x - 2 * margin) / cols),
          y: margin + row * Math.floor((tileCount.y - 2 * margin) / Math.ceil(count / cols))
        });
      }

      return positions;
    }

    function generateObstacles() {
      const obstacleCount = Math.floor(tileCount.x * tileCount.y * 0.05);
      for (let i = 0; i < obstacleCount; i++) {
        let pos;
        do {
          pos = {
            x: Math.floor(Math.random() * tileCount.x),
            y: Math.floor(Math.random() * tileCount.y)
          };
        } while (isPositionOccupied(pos));
        obstacles.push(pos);
      }
    }

    function isPositionOccupied(pos) {
      // 检查是否在玩家或AI蛇身上
      if (player && player.snake.some(s => s.x === pos.x && s.y === pos.y)) return true;
      if (aiPlayers.some(ai => ai.getSnake().some(s => s.x === pos.x && s.y === pos.y))) return true;
      if (food && food.x === pos.x && food.y === pos.y) return true;
      return false;
    }

    function spawnFood() {
      do {
        food = {
          x: Math.floor(Math.random() * tileCount.x),
          y: Math.floor(Math.random() * tileCount.y)
        };
      } while (isPositionOccupied(food));
    }

    function update(playerDirection) {
      if (!isRunning) return;

      // 更新玩家
      if (player && player.isAlive) {
        player.direction = playerDirection;
        const head = player.snake[0];
        const dir = getDirectionVector(player.direction);
        const newHead = { x: head.x + dir.x, y: head.y + dir.y };

        // 检查玩家撞墙
        if (newHead.x < 0 || newHead.x >= tileCount.x || newHead.y < 0 || newHead.y >= tileCount.y) {
          player.isAlive = false;
        }

        // 检查玩家撞障碍物
        if (player.isAlive && obstacles.some(o => o.x === newHead.x && o.y === newHead.y)) {
          player.isAlive = false;
        }

        // 检查玩家撞自己
        if (player.isAlive && player.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
          player.isAlive = false;
        }

        // 检查玩家撞AI
        if (player.isAlive) {
          for (const ai of aiPlayers) {
            if (ai.getSnake().some(s => s.x === newHead.x && s.y === newHead.y)) {
              player.isAlive = false;
              break;
            }
          }
        }

        if (player.isAlive) {
          player.snake.unshift(newHead);

          // 吃食物
          if (newHead.x === food.x && newHead.y === food.y) {
            player.score += 10;
            spawnFood();
          } else {
            player.snake.pop();
          }
        }
      }

      // 更新AI
      const gameState = {
        food,
        obstacles,
        gridWidth: tileCount.x,
        gridHeight: tileCount.y,
        playerSnake: player?.snake || []
      };

      aiPlayers.forEach(ai => {
        if (!ai.isDead()) {
          // AI决策
          ai.makeDecision({
            ...gameState,
            otherAIs: aiPlayers.filter(other => other !== ai)
          });

          // AI移动
          ai.move();

          // 检查AI撞墙
          const aiHead = ai.getHead();
          if (aiHead.x < 0 || aiHead.x >= tileCount.x || aiHead.y < 0 || aiHead.y >= tileCount.y) {
            // AI死亡
          }

          // 检查AI吃食物
          if (aiHead.x === food.x && aiHead.y === food.y) {
            ai.grow();
            spawnFood();
          }

          // 检查AI撞自己
          ai.checkSelfCollision();

          // 检查AI撞玩家
          if (player && player.isAlive && ai.checkCollisionWith(player.snake)) {
            // AI死亡
          }

          // 检查AI之间碰撞
          aiPlayers.forEach(otherAI => {
            if (otherAI !== ai && !otherAI.isDead() && ai.checkCollisionWith(otherAI.getSnake())) {
              // AI死亡
            }
          });
        }
      });

      // 检查游戏结束
      const aliveAIs = aiPlayers.filter(ai => !ai.isDead());
      if (!player || !player.isAlive) {
        isRunning = false;
        if (onGameOver) {
          const aiScores = aiPlayers.map((ai, i) => ({
            name: ai.getName(),
            score: ai.getScore(),
            isAI: true
          }));
          onGameOver({
            playerScore: player?.score || 0,
            aiScores,
            win: false
          });
        }
      } else if (aliveAIs.length === 0) {
        isRunning = false;
        if (onGameOver) {
          onGameOver({
            playerScore: player.score,
            aiScores: [],
            win: true
          });
        }
      }

      // 更新分数显示
      if (onScoreUpdate) {
        onScoreUpdate({
          player: player?.score || 0,
          ai: aiPlayers.map(ai => ({ name: ai.getName(), score: ai.getScore() }))
        });
      }
    }

    function getDirectionVector(dir) {
      const vectors = {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 }
      };
      return vectors[dir] || vectors.RIGHT;
    }

    function renderBattle(ctx) {
      // 绘制障碍物
      ctx.fillStyle = '#666';
      obstacles.forEach(obs => {
        ctx.fillRect(obs.x * gridSize, obs.y * gridSize, gridSize - 2, gridSize - 2);
      });

      // 绘制食物
      if (food) {
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(
          food.x * gridSize + gridSize / 2,
          food.y * gridSize + gridSize / 2,
          gridSize / 2 - 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // 绘制AI蛇
      aiPlayers.forEach(ai => {
        const snake = ai.getSnake();
        const color = ai.getColor();
        snake.forEach((segment, index) => {
          ctx.fillStyle = index === 0 ? color : adjustColor(color, -20);
          ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        });
      });

      // 绘制玩家蛇
      if (player) {
        player.snake.forEach((segment, index) => {
          ctx.fillStyle = index === 0 ? player.color : adjustColor(player.color, -20);
          ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        });
      }
    }

    function adjustColor(color, amount) {
      // 简单的颜色调整
      return color;
    }

    function getGameState() {
      return {
        player,
        aiPlayers,
        food,
        obstacles,
        isRunning
      };
    }

    function stop() {
      isRunning = false;
    }

    return {
      init,
      update,
      renderBattle,
      getGameState,
      stop,
      isGameRunning: () => isRunning
    };
  }

  return { createAIBattleController };
})();
