/**
 * AI Worker Bridge - 主线程与 AI Worker 之间的通信层
 * 提供与原版 SnakeAIPlayer 相同的 API，但决策计算在 Worker 中执行
 */

window.AIWorkerBridge = (() => {
  let worker = null;
  const pendingDecisions = new Map();
  const aiInstances = new Map();
  let requestIdCounter = 0;

  // 初始化 Worker
  function init() {
    if (worker) return;
    
    worker = new Worker(new URL('./workers/ai_worker.js', import.meta.url), { type: 'module' });
    
    worker.onmessage = function(e) {
      const { type, data, error } = e.data;
      
      switch (type) {
        case 'created':
          // create 是 fire-and-forget，不需要 resolve
          break;
        case 'inited':
          // init 是 fire-and-forget，不需要 resolve
          break;
        case 'decision':
          const pending = pendingDecisions.get(data.id);
          if (pending) {
            pending.resolve(data.decision);
            pendingDecisions.delete(data.id);
          }
          break;
        case 'destroyed':
          aiInstances.delete(data.aiId);
          break;
      }
    };

    worker.onerror = function(err) {
      console.error('AI Worker error:', err);
    };
  }

  function generateRequestId() {
    return ++requestIdCounter;
  }

  function sendMessage(type, data) {
    return new Promise((resolve) => {
      const id = generateRequestId();
      pendingDecisions.set(id, { resolve });
      worker.postMessage({ type, data, requestId: id });
    });
  }

  function createAIPlayer({ difficulty = 'normal', gridSize = 20, gameMode = 'classic' } = {}) {
    init();
    
    const aiId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 同步创建（Worker 会异步处理）
    sendMessage('create', { aiId, difficulty });
    
    const instance = {
      aiId,
      difficulty,
      gridSize,
      gameMode,
      snake: [],
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      score: 0,
      isAlive: true,

      init(startX, startY) {
        this.snake = [
          { x: startX, y: startY },
          { x: startX - 1, y: startY },
          { x: startX - 2, y: startY }
        ];
        this.direction = 'RIGHT';
        this.nextDirection = 'RIGHT';
        this.score = 0;
        this.isAlive = true;
        sendMessage('init', { aiId, startX, startY });
      },

      getSnake() {
        return this.snake;
      },

      getScore() {
        return this.score;
      },

      getDirection() {
        return this.direction;
      },

      isDead() {
        return !this.isAlive;
      },

      getHead() {
        return this.snake[0];
      },

      grow() {
        const tail = this.snake[this.snake.length - 1];
        this.snake.push({ ...tail });
        this.score += 10;
      },

      async makeDecision(gameState) {
        if (!this.isAlive) return;

        const decision = await new Promise((resolve) => {
          const id = generateRequestId();
          pendingDecisions.set(id, { resolve });
          
          // 更新蛇的位置信息
          const workerGameState = {
            ...gameState,
            otherAIs: gameState.otherAIs?.map(ai => ({
              snake: ai.getSnake ? ai.getSnake() : ai.snake
            }))
          };
          
          worker.postMessage({ 
            type: 'decision', 
            data: { aiId, gameState: workerGameState }, 
            requestId: id 
          });
        });

        if (decision) {
          this.nextDirection = decision;
        }
      },

      move() {
        if (!this.isAlive) return false;
        this.direction = this.nextDirection;
        const head = this.getHead();
        const dir = getDirectionVector(this.direction);
        const newHead = { x: head.x + dir.x, y: head.y + dir.y };
        this.snake.unshift(newHead);
        this.snake.pop();
        return true;
      },

      checkSelfCollision() {
        const head = this.getHead();
        for (let i = 1; i < this.snake.length; i++) {
          if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
            this.isAlive = false;
            return true;
          }
        }
        return false;
      },

      checkCollisionWith(otherSnake) {
        const head = this.getHead();
        return otherSnake.some(segment => segment.x === head.x && segment.y === head.y);
      },

      getColor() {
        const colors = {
          easy: '#4CAF50',
          normal: '#2196F3',
          hard: '#FF9800',
          hell: '#F44336'
        };
        return colors[this.difficulty] || colors.normal;
      },

      getName() {
        const names = {
          easy: 'AI·新手',
          normal: 'AI·普通',
          hard: 'AI·困难',
          hell: 'AI·地狱'
        };
        return names[this.difficulty] || 'AI';
      },

      getDifficulty() {
        return this.difficulty;
      },

      destroy() {
        sendMessage('destroy', { aiId });
        aiInstances.delete(aiId);
      }
    };

    aiInstances.set(aiId, instance);
    return instance;
  }

  function getDirectionVector(dir) {
    const vectors = {
      UP: { x: 0, y: -1 },
      DOWN: { x: 0, y: 1 },
      LEFT: { x: -1, y: 0 },
      RIGHT: { x: 1, y: 0 }
    };
    return vectors[dir];
  }

  function terminate() {
    if (worker) {
      worker.terminate();
      worker = null;
    }
    pendingDecisions.clear();
    aiInstances.clear();
  }

  return { createAIPlayer, terminate };
})();
