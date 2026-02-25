(function initSnakeRender(global) {
  function createRenderer(config) {
    const {
      ctx,
      canvas,
      gridSize,
      tileCount,
      getSkinThemes,
      getCurrentSkin,
      getState
    } = config;

    function drawGrid() {
      const skinThemes = getSkinThemes();
      const currentSkin = getCurrentSkin();
      ctx.strokeStyle = skinThemes[currentSkin].grid;
      ctx.lineWidth = 1;
      for (let i = 0; i <= tileCount; i++) {
        const line = i * gridSize;
        ctx.beginPath(); ctx.moveTo(line, 0); ctx.lineTo(line, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, line); ctx.lineTo(canvas.width, line); ctx.stroke();
      }
    }

    function drawCell({ x, y }, color, radius = 4) {
      const px = x * gridSize;
      const py = y * gridSize;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(px + 1, py + 1, gridSize - 2, gridSize - 2, radius);
      ctx.fill();
    }

    function draw() {
      const skinThemes = getSkinThemes();
      const currentSkin = getCurrentSkin();
      const {
        food,
        bonusFood,
        shieldFood,
        boostFood,
        timeFood,
        freezeFood,
        phaseFood,
        crownFood,
        magnetFood,
        comboFood,
        rocks,
        snake,
        phaseUntil
      } = getState();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = skinThemes[currentSkin].board;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      drawCell(food, '#f472b6', 6);
      if (bonusFood) drawCell(bonusFood, '#facc15', 8);
      if (shieldFood) drawCell(shieldFood, '#38bdf8', 8);
      if (boostFood) drawCell(boostFood, '#f59e0b', 8);
      if (timeFood) drawCell(timeFood, '#a78bfa', 8);
      if (freezeFood) drawCell(freezeFood, '#22d3ee', 8);
      if (phaseFood) drawCell(phaseFood, '#c084fc', 8);
      if (crownFood) drawCell(crownFood, '#fde047', 8);
      if (magnetFood) drawCell(magnetFood, '#60a5fa', 8);
      if (comboFood) drawCell(comboFood, '#fb7185', 8);
      rocks.forEach((rock) => drawCell(rock, '#64748b', 5));
      const headColor = performance.now() < phaseUntil ? skinThemes[currentSkin].phaseHead : skinThemes[currentSkin].head;
      snake.forEach((segment, index) => drawCell(segment, index === 0 ? headColor : skinThemes[currentSkin].body));
    }

    return { draw };
  }

  global.SnakeRender = {
    createRenderer
  };
})(window);
