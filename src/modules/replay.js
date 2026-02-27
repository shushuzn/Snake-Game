window.SnakeReplay = (() => {
  // 回放记录器 - 记录游戏关键帧
  function createReplayRecorder() {
    let recording = false;
    let replayData = null;
    let currentFrame = 0;

    function startRecording(mode, difficulty, players) {
      recording = true;
      replayData = {
        version: '1.4.0',
        mode: mode,
        difficulty: difficulty,
        players: players,
        startTime: Date.now(),
        frames: []
      };
      currentFrame = 0;
    }

    function recordFrame(frameData) {
      if (!recording || !replayData) return;

      replayData.frames.push({
        frame: currentFrame++,
        timestamp: Date.now() - replayData.startTime,
        ...frameData
      });
    }

    function stopRecording(finalData) {
      recording = false;
      if (replayData) {
        replayData.endTime = Date.now();
        replayData.duration = replayData.endTime - replayData.startTime;
        replayData.finalData = finalData;
      }
      return replayData;
    }

    function isRecording() {
      return recording;
    }

    function getCurrentReplay() {
      return replayData;
    }

    return {
      startRecording,
      recordFrame,
      stopRecording,
      isRecording,
      getCurrentReplay
    };
  }

  // 回放播放器 - 播放记录的游戏
  function createReplayPlayer({
    canvas,
    gridSize,
    tileCount,
    onComplete,
    onFrameUpdate
  }) {
    let replayData = null;
    let isPlaying = false;
    let currentFrameIndex = 0;
    let playTimer = null;
    let playSpeed = 1.0;

    function loadReplay(data) {
      replayData = data;
      currentFrameIndex = 0;
      return replayData !== null;
    }

    function loadReplayFromStorage(key) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        return loadReplay(data);
      } catch (e) {
        console.error('Failed to load replay:', e);
        return false;
      }
    }

    function startPlayback(speed = 1.0) {
      if (!replayData || !replayData.frames || replayData.frames.length === 0) {
        return false;
      }

      playSpeed = speed;
      isPlaying = true;
      currentFrameIndex = 0;

      // 计算每帧间隔（基于原始帧率约10fps）
      const frameInterval = 100 / playSpeed;

      playTimer = setInterval(() => {
        if (!isPlaying) return;

        if (currentFrameIndex >= replayData.frames.length) {
          stopPlayback();
          if (onComplete) onComplete(replayData);
          return;
        }

        const frame = replayData.frames[currentFrameIndex];
        if (onFrameUpdate) onFrameUpdate(frame, currentFrameIndex, replayData.frames.length);

        currentFrameIndex++;
      }, frameInterval);

      return true;
    }

    function pausePlayback() {
      isPlaying = false;
      if (playTimer) {
        clearInterval(playTimer);
        playTimer = null;
      }
    }

    function resumePlayback() {
      if (!replayData) return false;
      return startPlayback(playSpeed);
    }

    function stopPlayback() {
      isPlaying = false;
      if (playTimer) {
        clearInterval(playTimer);
        playTimer = null;
      }
      currentFrameIndex = 0;
    }

    function seekToFrame(frameIndex) {
      if (!replayData || !replayData.frames) return false;
      currentFrameIndex = Math.max(0, Math.min(frameIndex, replayData.frames.length - 1));
      return true;
    }

    function setSpeed(speed) {
      playSpeed = Math.max(0.25, Math.min(4.0, speed));
      if (isPlaying) {
        pausePlayback();
        resumePlayback();
      }
    }

    function render(ctx) {
      if (!replayData || !replayData.frames || currentFrameIndex >= replayData.frames.length) return;

      const frame = replayData.frames[currentFrameIndex];

      // 绘制障碍物
      if (frame.obstacles) {
        ctx.fillStyle = '#666';
        for (const obs of frame.obstacles) {
          ctx.fillRect(obs.x * gridSize, obs.y * gridSize, gridSize - 2, gridSize - 2);
        }
      }

      // 绘制食物
      if (frame.food) {
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(
          frame.food.x * gridSize + gridSize / 2,
          frame.food.y * gridSize + gridSize / 2,
          gridSize / 2 - 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // 绘制蛇
      if (frame.snakes) {
        for (const snakeData of frame.snakes) {
          for (let i = 0; i < snakeData.body.length; i++) {
            const segment = snakeData.body[i];
            const isHead = i === 0;

            ctx.fillStyle = isHead ? snakeData.headColor : snakeData.color;
            ctx.fillRect(
              segment.x * gridSize + 1,
              segment.y * gridSize + 1,
              gridSize - 2,
              gridSize - 2
            );
          }
        }
      }
    }

    function getPlaybackInfo() {
      if (!replayData) return null;
      return {
        currentFrame: currentFrameIndex,
        totalFrames: replayData.frames.length,
        progress: replayData.frames.length > 0 ? currentFrameIndex / replayData.frames.length : 0,
        isPlaying: isPlaying,
        speed: playSpeed,
        mode: replayData.mode,
        duration: replayData.duration
      };
    }

    return {
      loadReplay,
      loadReplayFromStorage,
      startPlayback,
      pausePlayback,
      resumePlayback,
      stopPlayback,
      seekToFrame,
      setSpeed,
      render,
      getPlaybackInfo,
      isPlaying: () => isPlaying
    };
  }

  // 保存回放数据到本地存储
  function saveReplay(key, replayData) {
    try {
      // 压缩帧数据，只保留关键帧（每3帧保存一帧）
      const compressedData = {
        ...replayData,
        frames: replayData.frames.filter((_, i) => i % 3 === 0)
      };

      const history = JSON.parse(localStorage.getItem(key) || '[]');
      history.unshift({
        date: new Date().toISOString(),
        data: compressedData
      });

      // 最多保存20条回放
      if (history.length > 20) history.pop();

      localStorage.setItem(key, JSON.stringify(history));
      return true;
    } catch (e) {
      console.error('Failed to save replay:', e);
      return false;
    }
  }

  // 获取回放历史列表
  function getReplayHistory(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      return [];
    }
  }

  // 删除回放
  function deleteReplay(key, index) {
    try {
      const history = JSON.parse(localStorage.getItem(key) || '[]');
      if (index >= 0 && index < history.length) {
        history.splice(index, 1);
        localStorage.setItem(key, JSON.stringify(history));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  return {
    createReplayRecorder,
    createReplayPlayer,
    saveReplay,
    getReplayHistory,
    deleteReplay
  };
})();
