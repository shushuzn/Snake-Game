window.SnakeSpectate = (() => {
  function createSpectateController({
    canvas,
    gridSize,
    tileCount,
    onExit
  }) {
    let spectateMode = null; // 'ai-battle', 'multiplayer', 'replay'
    let spectateTarget = null;
    let isRunning = false;
    let updateTimer = null;
    let ctx = null;

    // AI观战模式
    function startAISpectate(aiDifficulty = 'normal', aiCount = 3) {
      spectateMode = 'ai-battle';
      isRunning = true;

      // 初始化纯AI对战（无玩家参与）
      spectateTarget = window.SnakeAIBattle.createAIBattleController({
        canvas,
        gridSize,
        tileCount,
        onGameOver: handleAIBattleOver,
        onScoreUpdate: handleScoreUpdate
      });

      // 初始化多个AI
      spectateTarget.init(aiDifficulty, aiCount);

      // 启动观战循环
      startSpectateLoop();

      return {
        mode: 'ai-battle',
        difficulty: aiDifficulty,
        aiCount: aiCount,
        description: `观看 ${aiCount} 个 ${getDifficultyLabel(aiDifficulty)} AI 对战`
      };
    }

    // 多人对战观战模式（观战AI之间的对战）
    function startMultiplayerSpectate(aiCount = 4) {
      spectateMode = 'multiplayer';
      isRunning = true;

      // 使用多人控制器，但所有玩家都是AI
      spectateTarget = window.SnakeMultiplayer.createMultiplayerController({
        canvas,
        gridSize,
        tileCount,
        onGameOver: handleMultiplayerOver,
        onScoreUpdate: handleScoreUpdate,
        playerCount: aiCount
      });

      spectateTarget.init(aiCount);

      // 为每个"玩家"创建一个AI控制
      const aiControllers = [];
      for (let i = 0; i < aiCount; i++) {
        const ai = window.SnakeAIPlayer.createAIPlayer({
          difficulty: 'normal',
          gridSize,
          gameMode: 'multiplayer'
        });
        // 初始化AI到对应玩家的起始位置
        const players = spectateTarget.getPlayers();
        if (players[i]) {
          ai.init(players[i].snake[0].x, players[i].snake[0].y);
        }
        aiControllers.push({
          ai: ai,
          playerIndex: i
        });
      }

      spectateTarget.aiControllers = aiControllers;

      startSpectateLoop();

      return {
        mode: 'multiplayer',
        aiCount: aiCount,
        description: `观看 ${aiCount} 个 AI 大乱斗`
      };
    }

    // 回放观战模式
    function startReplaySpectate(replayKey, replayIndex = 0) {
      spectateMode = 'replay';
      isRunning = true;

      spectateTarget = window.SnakeReplay.createReplayPlayer({
        canvas,
        gridSize,
        tileCount,
        onComplete: handleReplayComplete,
        onFrameUpdate: handleFrameUpdate
      });

      const history = window.SnakeReplay.getReplayHistory(replayKey);
      if (history[replayIndex]) {
        spectateTarget.loadReplay(history[replayIndex].data);
        spectateTarget.startPlayback(1.0);
      }

      return {
        mode: 'replay',
        description: '回放历史对局'
      };
    }

    function startSpectateLoop() {
      if (updateTimer) clearInterval(updateTimer);

      updateTimer = setInterval(() => {
        if (!isRunning || !spectateTarget) return;

        if (spectateMode === 'ai-battle') {
          // AI对战自动更新
          spectateTarget.update('RIGHT'); // 玩家方向（观战模式下不需要）
        } else if (spectateMode === 'multiplayer') {
          // 多人AI对战 - 每个AI做出决策
          const players = spectateTarget.getPlayers();
          const gameState = {
            food: spectateTarget.food,
            obstacles: spectateTarget.obstacles || [],
            gridWidth: tileCount.x,
            gridHeight: tileCount.y,
            playerSnake: []
          };

          if (spectateTarget.aiControllers) {
            for (const controller of spectateTarget.aiControllers) {
              const player = players[controller.playerIndex];
              if (!player || !player.isAlive) continue;

              // 更新AI位置
              controller.ai.snake = player.snake;
              controller.ai.direction = player.direction;

              // AI决策
              controller.ai.makeDecision({
                ...gameState,
                otherAIs: spectateTarget.aiControllers
                  .filter(c => c.playerIndex !== controller.playerIndex)
                  .map(c => c.ai)
              });

              // 转换AI方向到输入
              const dir = controller.ai.getDirection();
              spectateTarget.handleInput(dir.toLowerCase());
            }
          }

          spectateTarget.update();
        }
      }, 100); // 10fps
    }

    function handleAIBattleOver(result) {
      isRunning = false;
      if (onExit) {
        setTimeout(() => onExit('ai-battle', result), 2000);
      }
    }

    function handleMultiplayerOver(result) {
      isRunning = false;
      if (onExit) {
        setTimeout(() => onExit('multiplayer', result), 2000);
      }
    }

    function handleReplayComplete(replayData) {
      isRunning = false;
      if (onExit) {
        onExit('replay', replayData);
      }
    }

    function handleScoreUpdate(scores) {
      // 分数更新，可用于HUD显示
    }

    function handleFrameUpdate(frame, current, total) {
      // 帧更新回调
    }

    function stopSpectate() {
      isRunning = false;
      if (updateTimer) {
        clearInterval(updateTimer);
        updateTimer = null;
      }
      if (spectateTarget && spectateTarget.stop) {
        spectateTarget.stop();
      }
      spectateMode = null;
      spectateTarget = null;
    }

    function render(ctx) {
      if (!isRunning || !spectateTarget) return;

      if (spectateMode === 'ai-battle' && spectateTarget.renderBattle) {
        spectateTarget.renderBattle(ctx);
      } else if (spectateMode === 'multiplayer' && spectateTarget.render) {
        spectateTarget.render(ctx);
      } else if (spectateMode === 'replay' && spectateTarget.render) {
        spectateTarget.render(ctx);
      }
    }

    function getStatus() {
      return {
        isRunning,
        mode: spectateMode,
        info: spectateTarget ? getModeInfo() : null
      };
    }

    function getModeInfo() {
      if (spectateMode === 'ai-battle') {
        return {
          mode: 'AI对战观战',
          players: spectateTarget.getGameState ? spectateTarget.getGameState().aiPlayers : []
        };
      } else if (spectateMode === 'multiplayer') {
        return {
          mode: 'AI大乱斗观战',
          players: spectateTarget.getPlayers ? spectateTarget.getPlayers() : []
        };
      } else if (spectateMode === 'replay') {
        const info = spectateTarget.getPlaybackInfo ? spectateTarget.getPlaybackInfo() : null;
        return {
          mode: '回放',
          progress: info
        };
      }
      return null;
    }

    function getDifficultyLabel(diff) {
      const labels = {
        easy: '简单',
        normal: '普通',
        hard: '困难',
        hell: '地狱'
      };
      return labels[diff] || diff;
    }

    return {
      startAISpectate,
      startMultiplayerSpectate,
      startReplaySpectate,
      stopSpectate,
      render,
      getStatus,
      isRunning: () => isRunning
    };
  }

  return { createSpectateController };
})();
