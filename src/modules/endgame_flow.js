window.SnakeEndgameFlow = (() => {
  function createEndgameFlowModule({
    runtime,
    stats,
    bests,
    settlement,
    records,
    achievements,
    roguelike,
    ui,
    audio
  }) {
    function finalize(reasonText) {
      runtime.stopLoop();
      runtime.setRunning(false);
      runtime.setPaused(false);

      if (runtime.isTimerMode() && reasonText.includes('时间到')) {
        stats.setStreak(stats.getStreak() + 1);
      } else {
        stats.setStreak(0);
      }
      stats.persist();

      if (runtime.getScore() > bests.getBestScore()) {
        bests.setBestScore(runtime.getScore());
      }

      if (runtime.getScore() > bests.getModeBest(runtime.getMode())) {
        bests.setModeBest(runtime.getMode(), runtime.getScore());
      }

      if (runtime.getMode() === 'endless' && runtime.getLevel() > bests.getEndlessBestLevel()) {
        bests.setEndlessBestLevel(runtime.getLevel());
      }

      settlement.refresh({ remainingTime: runtime.getRemainingTime() });
      records.recordRound(runtime.getScore(), runtime.getMode());

      if (runtime.getScore() >= 200) achievements.unlock('score200', '高分达人（单局 200 分）');
      if (runtime.getRoundMaxCombo() >= 5) achievements.unlock('combo5', '连击高手（连击达到 x5）');
      if (runtime.isTimerMode() && reasonText.includes('时间到') && runtime.getScore() >= 120) {
        achievements.unlock('timedClear', '限时挑战者（限时类模式 120+）');
      }

      // New achievements for v1.1.0
      if (runtime.getScore() >= 500) achievements.unlock('score500', '高分达人（单局 500 分）');
      if (runtime.getScore() >= 1000) achievements.unlock('score1000', '超级高分（单局 1000 分）');
      if (runtime.getScore() >= 2000) achievements.unlock('score2000', '传奇高分（单局 2000 分）');
      if (runtime.getRoundMaxCombo() >= 10) achievements.unlock('combo10', '连击大师（连击达到 x10）');
      if (runtime.getRoundMaxCombo() >= 15) achievements.unlock('combo15', '连击至尊（连击达到 x15）');
      const gamesPlayed = runtime.getGamesPlayed();
      if (gamesPlayed >= 10) achievements.unlock('games10', '资深玩家（游玩 10 局）');
      if (gamesPlayed >= 50) achievements.unlock('games50', '老玩家（游玩 50 局）');
      if (gamesPlayed >= 100) achievements.unlock('games100', '骨灰玩家（游玩 100 局）');

      if (runtime.getMode() === 'roguelike') {
        const gain = Math.max(1, Math.floor(runtime.getScore() / 120));
        roguelike.addPerks(gain);
      }

      // 对战类成就 - AI对战胜利检测
      if (runtime.getMode() === 'ai-battle') {
        const playerScore = runtime.getScore();
        const aiScores = runtime.getAIScores ? runtime.getAIScores() : [];
        const isPlayerWin = aiScores.length > 0 && playerScore > Math.max(...aiScores);
        if (isPlayerWin) {
          const difficulty = runtime.getAIBattleDifficulty();
          if (difficulty === 'easy') achievements.unlock('aiBeatEasy', 'AI对战：击败简单难度');
          if (difficulty === 'normal') achievements.unlock('aiBeatNormal', 'AI对战：击败普通难度');
          if (difficulty === 'hard') achievements.unlock('aiBeatHard', 'AI对战：击败困难难度');
          if (difficulty === 'hell') achievements.unlock('aiBeatHell', 'AI对战：击败地狱难度');
        }
      }

      // 对战类成就 - 多人对战胜利检测
      if (runtime.getMode() === 'multiplayer') {
        const playerScore = runtime.getScore();
        const otherScores = runtime.getMultiplayerScores ? runtime.getMultiplayerScores() : [];
        const isPlayerWin = otherScores.length > 0 && playerScore > Math.max(...otherScores);
        if (isPlayerWin) {
          const playerCount = runtime.getMultiplayerPlayerCount();
          if (playerCount >= 2) achievements.unlock('multiplayerWin2', '多人对战：2人模式获胜');
          if (playerCount >= 3) achievements.unlock('multiplayerWin3', '多人对战：3人模式获胜');
          if (playerCount >= 4) achievements.unlock('multiplayerWin4', '多人对战：4人模式获胜');
        }
      }

      // 收集类成就 - 食物收集检测
      const totalFoods = stats.getFoodsEaten();
      if (totalFoods >= 100) achievements.unlock('foods100', '收集达人（累计收集100个食物）');
      if (totalFoods >= 500) achievements.unlock('foods500', '收集高手（累计收集500个食物）');
      if (totalFoods >= 1000) achievements.unlock('foods1000', '收集大师（累计收集1000个食物）');

      // 收集类成就 - 图鉴收集检测
      const discoveredCount = runtime.getDiscoveredCodexCount();
      const totalCodex = runtime.getTotalCodexCount();
      if (discoveredCount >= 5) achievements.unlock('codex5', '图鉴收集（解锁5个图鉴）');
      if (discoveredCount >= 10) achievements.unlock('codex10', '图鉴收藏家（解锁10个图鉴）');
      if (discoveredCount >= totalCodex && totalCodex > 0) achievements.unlock('allCodex', '全图鉴大师（解锁所有图鉴）');

      // 无尽模式成就检测
      if (runtime.getMode() === 'endless') {
        const currentLevel = runtime.getLevel();
        if (currentLevel >= 5) achievements.unlock('endlessLevel5', '无尽挑战者（达到第5关）');
        if (currentLevel >= 10) achievements.unlock('endlessLevel10', '无尽高手（达到第10关）');
        if (currentLevel >= 20) achievements.unlock('endlessLevel20', '无尽大师（达到第20关）');
      }

      audio.hit();
      ui.showEndOverlay(reasonText, runtime.getScore());
    }

    return { finalize };
  }

  return { createEndgameFlowModule };
})();
