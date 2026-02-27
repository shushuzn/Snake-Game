window.SnakeMultiplayer = (() => {
  const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
  };

  function createMultiplayerController({
    canvas,
    gridSize,
    tileCount,
    onGameOver,
    onScoreUpdate,
    playerCount = 2
  }) {
    let players = [];
    let food = null;
    let obstacles = [];
    let isRunning = false;
    let gameMode = 'multiplayer';
    let alivePlayers = [];

    // 玩家配置
    const playerConfigs = [
      {
        id: 1,
        name: '玩家1',
        color: '#00FF00',
        headColor: '#00CC00',
        startPos: { x: 5, y: 5 },
        direction: 'RIGHT',
        controls: { up: 'w', down: 's', left: 'a', right: 'd' }
      },
      {
        id: 2,
        name: '玩家2',
        color: '#0088FF',
        headColor: '#0066CC',
        startPos: { x: tileCount.x - 6, y: tileCount.y - 6 },
        direction: 'LEFT',
        controls: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }
      },
      {
        id: 3,
        name: '玩家3',
        color: '#FF8800',
        headColor: '#CC6600',
        startPos: { x: 5, y: tileCount.y - 6 },
        direction: 'UP',
        controls: { up: 'i', down: 'k', left: 'j', right: 'l' }
      },
      {
        id: 4,
        name: '玩家4',
        color: '#FF00FF',
        headColor: '#CC00CC',
        startPos: { x: tileCount.x - 6, y: 5 },
        direction: 'DOWN',
        controls: { up: '8', down: '5', left: '4', right: '6' }
      }
    ];

    function init(count = 2) {
      playerCount = Math.max(2, Math.min(4, count));
      players = [];
      alivePlayers = [];

      for (let i = 0; i < playerCount; i++) {
        const config = playerConfigs[i];
        const player = {
          id: config.id,
          name: config.name,
          snake: [
            { x: config.startPos.x, y: config.startPos.y },
            { x: config.startPos.x - (config.direction === 'RIGHT' ? 1 : config.direction === 'LEFT' ? -1 : 0), y: config.startPos.y - (config.direction === 'DOWN' ? 1 : config.direction === 'UP' ? -1 : 0) },
            { x: config.startPos.x - (config.direction === 'RIGHT' ? 2 : config.direction === 'LEFT' ? -2 : 0), y: config.startPos.y - (config.direction === 'DOWN' ? 2 : config.direction === 'UP' ? -2 : 0) }
          ],
          direction: config.direction,
          nextDirection: config.direction,
          score: 0,
          isAlive: true,
          color: config.color,
          headColor: config.headColor,
          controls: config.controls,
          kills: 0
        };
        players.push(player);
        alivePlayers.push(player);
      }

      // 生成食物
      spawnFood();

      // 生成障碍物（2人以上时）
      obstacles = [];
      if (playerCount >= 3) {
        generateObstacles();
      }

      isRunning = true;
    }

    function generateObstacles() {
      const obstacleCount = Math.floor(tileCount.x * tileCount.y * 0.03 * (playerCount - 2));
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
      // 检查是否在玩家蛇附近（开局保护区域）
      for (const player of players) {
        for (const segment of player.snake) {
          const dist = Math.abs(segment.x - pos.x) + Math.abs(segment.y - pos.y);
          if (dist < 5) return true;
        }
      }
      if (food && food.x === pos.x && food.y === pos.y) return true;
      if (obstacles.some(o => o.x === pos.x && o.y === pos.y)) return true;
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

    function handleInput(key) {
      if (!isRunning) return;

      for (const player of players) {
        if (!player.isAlive) continue;

        let newDirection = null;
        if (key === player.controls.up) newDirection = 'UP';
        else if (key === player.controls.down) newDirection = 'DOWN';
        else if (key === player.controls.left) newDirection = 'LEFT';
        else if (key === player.controls.right) newDirection = 'RIGHT';

        if (newDirection && newDirection !== getOppositeDirection(player.direction)) {
          player.nextDirection = newDirection;
        }
      }
    }

    function getOppositeDirection(dir) {
      const opposites = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
      return opposites[dir];
    }

    function update() {
      if (!isRunning) return;

      // 更新每个玩家
      for (const player of players) {
        if (!player.isAlive) continue;

        // 应用方向
        player.direction = player.nextDirection;
        const dir = DIRECTIONS[player.direction];
        const head = player.snake[0];
        const newHead = {
          x: head.x + dir.x,
          y: head.y + dir.y
        };

        // 检查撞墙
        if (newHead.x < 0 || newHead.x >= tileCount.x || newHead.y < 0 || newHead.y >= tileCount.y) {
          killPlayer(player, '撞墙');
          continue;
        }

        // 检查撞障碍物
        if (obstacles.some(o => o.x === newHead.x && o.y === newHead.y)) {
          killPlayer(player, '撞障碍物');
          continue;
        }

        // 检查撞自己
        if (player.snake.some((s, i) => i > 0 && s.x === newHead.x && s.y === newHead.y)) {
          killPlayer(player, '撞自己');
          continue;
        }

        // 检查撞其他玩家
        for (const other of players) {
          if (other !== player && other.isAlive) {
            // 撞其他蛇的身体
            if (other.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
              killPlayer(player, `被${other.name}击杀`);
              other.kills++;
              break;
            }
          }
        }

        if (!player.isAlive) continue;

        // 移动蛇
        player.snake.unshift(newHead);

        // 检查吃食物
        if (newHead.x === food.x && newHead.y === food.y) {
          player.score += 10;
          spawnFood();
        } else {
          player.snake.pop();
        }
      }

      // 更新存活玩家列表
      alivePlayers = players.filter(p => p.isAlive);

      // 检查游戏结束
      if (alivePlayers.length <= 1) {
        isRunning = false;
        if (onGameOver) {
          const winner = alivePlayers[0] || null;
          onGameOver({
            winner: winner ? { name: winner.name, score: winner.score, kills: winner.kills } : null,
            players: players.map(p => ({
              name: p.name,
              score: p.score,
              kills: p.kills,
              isAlive: p.isAlive,
              color: p.color
            }))
          });
        }
      }

      // 更新分数显示
      if (onScoreUpdate) {
        onScoreUpdate(players.map(p => ({
          name: p.name,
          score: p.score,
          isAlive: p.isAlive,
          color: p.color
        })));
      }
    }

    function killPlayer(player, reason) {
      player.isAlive = false;
      // 死亡时身体变成障碍物
      for (const segment of player.snake) {
        if (!obstacles.some(o => o.x === segment.x && o.y === segment.y)) {
          obstacles.push({ x: segment.x, y: segment.y });
        }
      }
    }

    function render(ctx) {
      // 绘制障碍物
      ctx.fillStyle = '#666';
      for (const obs of obstacles) {
        ctx.fillRect(obs.x * gridSize, obs.y * gridSize, gridSize - 2, gridSize - 2);
      }

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

      // 绘制每个玩家
      for (const player of players) {
        const isAlive = player.isAlive;

        for (let i = 0; i < player.snake.length; i++) {
          const segment = player.snake[i];
          const isHead = i === 0;

          if (isAlive) {
            ctx.fillStyle = isHead ? player.headColor : player.color;
          } else {
            // 死亡的蛇变灰
            ctx.fillStyle = isHead ? '#666' : '#888';
          }

          // 绘制蛇身
          ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
          );

          // 头部绘制眼睛
          if (isHead && isAlive) {
            ctx.fillStyle = '#FFF';
            const eyeSize = 3;
            const offset = 4;

            // 根据方向绘制眼睛
            if (player.direction === 'RIGHT' || player.direction === 'LEFT') {
              ctx.fillRect(segment.x * gridSize + offset, segment.y * gridSize + 3, eyeSize, eyeSize);
              ctx.fillRect(segment.x * gridSize + offset, segment.y * gridSize + gridSize - 6, eyeSize, eyeSize);
            } else {
              ctx.fillRect(segment.x * gridSize + 3, segment.y * gridSize + offset, eyeSize, eyeSize);
              ctx.fillRect(segment.x * gridSize + gridSize - 6, segment.y * gridSize + offset, eyeSize, eyeSize);
            }
          }
        }
      }
    }

    function getPlayers() {
      return players;
    }

    function getPlayerCount() {
      return playerCount;
    }

    function isGameRunning() {
      return isRunning;
    }

    function stop() {
      isRunning = false;
    }

    function getControlHelp() {
      return players.map(p => ({
        name: p.name,
        color: p.color,
        controls: `${p.controls.up.toUpperCase()}/${p.controls.down.toUpperCase()}/${p.controls.left.toUpperCase()}/${p.controls.right.toUpperCase()}`
      }));
    }

    return {
      init,
      update,
      render,
      handleInput,
      getPlayers,
      getPlayerCount,
      isGameRunning,
      stop,
      getControlHelp
    };
  }

  return { createMultiplayerController };
})();
