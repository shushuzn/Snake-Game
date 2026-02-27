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
      if (runtime.getRoundMaxCombo() >= 10) achievements.unlock('combo10', '连击大师（连击达到 x10）');
      const gamesPlayed = runtime.getGamesPlayed();
      if (gamesPlayed >= 10) achievements.unlock('games10', '资深玩家（游玩 10 局）');
      if (gamesPlayed >= 50) achievements.unlock('games50', '老玩家（游玩 50 局）');

      if (runtime.getMode() === 'roguelike') {
        const gain = Math.max(1, Math.floor(runtime.getScore() / 120));
        roguelike.addPerks(gain);
      }

      audio.hit();
      ui.showEndOverlay(reasonText, runtime.getScore());
    }

    return { finalize };
  }

  return { createEndgameFlowModule };
})();
