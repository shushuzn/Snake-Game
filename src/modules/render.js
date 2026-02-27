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

    // 缓存网格以提高性能
    let gridCanvas = null;
    let lastTileCount = 0;
    let lastGridSize = 0;
    let lastSkin = null;

    function drawGrid() {
      const skinThemes = getSkinThemes();
      const currentSkin = getCurrentSkin();
      
      // 如果网格参数没变，使用缓存
      if (gridCanvas && lastTileCount === tileCount && lastGridSize === gridSize && lastSkin === currentSkin) {
        ctx.drawImage(gridCanvas, 0, 0);
        return;
      }

      // 重建网格缓存
      gridCanvas = document.createElement('canvas');
      gridCanvas.width = canvas.width;
      gridCanvas.height = canvas.height;
      const gridCtx = gridCanvas.getContext('2d');
      
      gridCtx.strokeStyle = skinThemes[currentSkin].grid;
      gridCtx.lineWidth = 1;
      for (let i = 0; i <= tileCount; i++) {
        const line = i * gridSize;
        gridCtx.beginPath(); gridCtx.moveTo(line, 0); gridCtx.lineTo(line, canvas.height); gridCtx.stroke();
        gridCtx.beginPath(); gridCtx.moveTo(0, line); gridCtx.lineTo(canvas.width, line); gridCtx.stroke();
      }
      
      lastTileCount = tileCount;
      lastGridSize = gridSize;
      lastSkin = currentSkin;
      
      ctx.drawImage(gridCanvas, 0, 0);
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
      const skin = skinThemes[currentSkin];
      const now = performance.now();
      const isPhaseActive = now < phaseUntil;
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
        snake
      } = getState();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = skin.board;
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
      const headColor = isPhaseActive ? skin.phaseHead : skin.head;
      snake.forEach((segment, index) => drawCell(segment, index === 0 ? headColor : skin.body));
    }

    return { draw };
  }

  global.SnakeRender = {
    createRenderer
  };
})(window);
