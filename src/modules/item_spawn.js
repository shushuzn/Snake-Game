window.SnakeItemSpawn = (() => {
  function createItemSpawnModule({ runtime }) {
    function maybeSpawnItem({
      active,
      score,
      minScore,
      step,
      spawn
    }) {
      if (active) return;
      if (score < minScore) return;
      if (score % step !== 0) return;
      spawn();
    }

    function spawnOnFoodEat(now) {
      const score = runtime.getScore();

      if (!runtime.hasBonusFood() && score > 0 && score % runtime.getBonusStep() === 0) {
        runtime.setBonusFood(runtime.randomFreeCell(), now + 3200);
      }

      if (!runtime.isHardcoreEnabled()) {
        maybeSpawnItem({
          active: runtime.hasShieldFood() || runtime.getShields() >= 2,
          score,
          minScore: 60,
          step: 70,
          spawn: () => runtime.setShieldFood(runtime.randomFreeCell(), now + 4500)
        });
      }

      maybeSpawnItem({
        active: runtime.hasBoostFood(),
        score,
        minScore: 80,
        step: 90,
        spawn: () => runtime.setBoostFood(runtime.randomFreeCell(), now + 4200)
      });

      maybeSpawnItem({
        active: runtime.hasTimeFood(),
        score,
        minScore: 50,
        step: 75,
        spawn: () => runtime.setTimeFood(runtime.randomFreeCell(), now + 4600)
      });

      maybeSpawnItem({
        active: runtime.hasFreezeFood(),
        score,
        minScore: 40,
        step: 65,
        spawn: () => runtime.setFreezeFood(runtime.randomFreeCell(), now + 4200)
      });

      maybeSpawnItem({
        active: runtime.hasPhaseFood(),
        score,
        minScore: 70,
        step: 85,
        spawn: () => runtime.setPhaseFood(runtime.randomFreeCell(), now + 4500)
      });

      maybeSpawnItem({
        active: runtime.hasCrownFood(),
        score,
        minScore: 100,
        step: 110,
        spawn: () => runtime.setCrownFood(runtime.randomFreeCell(), now + 5000)
      });

      maybeSpawnItem({
        active: runtime.hasMagnetFood(),
        score,
        minScore: 90,
        step: 95,
        spawn: () => runtime.setMagnetFood(runtime.randomFreeCell(), now + 4300)
      });

      if (!runtime.hasComboFood() && score >= 70 && runtime.getCombo() >= 4 && score % 75 === 0) {
        runtime.setComboFood(runtime.randomFreeCell(), now + 4200);
      }
    }

    function maybeAddRock() {
      if (!runtime.isObstacleEnabled()) return;
      if (runtime.isChallengeNoRocks()) return;
      if (runtime.hasCustomRocks()) return;
      if (runtime.getScore() < 80) return;
      if (runtime.getScore() % 40 !== 0) return;
      if (runtime.getRocksCount() >= 8) return;
      runtime.addRock(runtime.randomFreeCell());
    }

    return {
      spawnOnFoodEat,
      maybeAddRock
    };
  }

  return { createItemSpawnModule };
})();
