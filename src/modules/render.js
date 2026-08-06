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

    // 吃食检测：跟踪上一帧食物集合与蛇长
    let prevFoods = null;
    let prevSnakeLen = 0;

    function collectFoods(state) {
      const m = {};
      const items = [
        ['food', state.food, '#f472b6'],
        ['bonus', state.bonusFood, '#facc15'],
        ['shield', state.shieldFood, '#38bdf8'],
        ['boost', state.boostFood, '#f59e0b'],
        ['time', state.timeFood, '#a78bfa'],
        ['freeze', state.freezeFood, '#22d3ee'],
        ['phase', state.phaseFood, '#c084fc'],
        ['crown', state.crownFood, '#fde047'],
        ['magnet', state.magnetFood, '#60a5fa'],
        ['combo', state.comboFood, '#fb7185'],
        ['ghost', state.ghostFood, '#e2e8f0']
      ];
      for (const [k, v, c] of items) {
        if (v) m[k] = { pos: `${v.x},${v.y}`, color: c };
      }
      return m;
    }

    function detectEatAndBurst(state) {
      const foods = collectFoods(state);
      const snakeLen = state.snake.length;
      const grew = prevSnakeLen > 0 && snakeLen > prevSnakeLen;
      if (grew && prevFoods) {
        for (const k in prevFoods) {
          if (!foods[k]) {
            const [x, y] = prevFoods[k].pos.split(',').map(Number);
            spawnBurst(x, y, prevFoods[k].color, 12);
          }
        }
      }
      prevFoods = foods;
      prevSnakeLen = snakeLen;
    }

    // 轻量粒子系统（独立 rAF 驱动）
    const particles = [];
    let rafId = 0;
    let rafActive = false;
    let lastParticleTime = 0;

    function spawnBurst(cellX, cellY, color, count, spread = 1) {
      const cx = cellX * gridSize + gridSize / 2;
      const cy = cellY * gridSize + gridSize / 2;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.6 + Math.random() * 1.4) * gridSize * 0.09 * spread;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 380 + Math.random() * 320,
          size: 1.6 + Math.random() * 2.2,
          color
        });
      }
      ensureParticleLoop();
    }

    function updateParticles(now) {
      // 用实际帧间隔推进，适配高刷屏
      const dt = lastParticleTime ? Math.min(now - lastParticleTime, 50) : 16;
      lastParticleTime = now;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);
        p.vx *= Math.pow(0.94, dt / 16);
        p.vy *= Math.pow(0.94, dt / 16);
        if (p.life >= p.maxLife) particles.splice(i, 1);
      }
    }

    function drawParticles(now) {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const t = p.life / p.maxLife;
        ctx.globalAlpha = 1 - t * t;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - t * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function ensureParticleLoop() {
      if (rafActive) return;
      rafActive = true;
      const loop = (now) => {
        updateParticles(now);
        drawFull();
        drawParticles(now);
        if (particles.length > 0) {
          rafId = requestAnimationFrame(loop);
        } else {
          rafActive = false;
          drawFull(); // 清理粒子残留，恢复干净画面
        }
      };
      rafId = requestAnimationFrame(loop);
    }

    function cancelParticleLoop() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      rafActive = false;
    }

    // ---------- 网格：细线 + 交叉点微光 ----------
    function drawGrid() {
      const skinThemes = getSkinThemes();
      const currentSkin = getCurrentSkin();

      if (gridCanvas && lastTileCount === tileCount && lastGridSize === gridSize && lastSkin === currentSkin) {
        ctx.drawImage(gridCanvas, 0, 0);
        return;
      }

      gridCanvas = document.createElement('canvas');
      gridCanvas.width = canvas.width;
      gridCanvas.height = canvas.height;
      const gridCtx = gridCanvas.getContext('2d');

      const gridColor = skinThemes[currentSkin].grid;
      // 主网格线
      gridCtx.strokeStyle = gridColor;
      gridCtx.lineWidth = 1;
      for (let i = 0; i <= tileCount; i++) {
        const line = i * gridSize;
        gridCtx.beginPath(); gridCtx.moveTo(line, 0); gridCtx.lineTo(line, canvas.height); gridCtx.stroke();
        gridCtx.beginPath(); gridCtx.moveTo(0, line); gridCtx.lineTo(canvas.width, line); gridCtx.stroke();
      }
      // 交叉点微光：每隔一格，用半透明小点强化网格节奏
      const dotColor = gridColor;
      gridCtx.fillStyle = dotColor;
      for (let i = 0; i <= tileCount; i += 2) {
        for (let j = 0; j <= tileCount; j += 2) {
          gridCtx.beginPath();
          gridCtx.arc(i * gridSize, j * gridSize, 0.8, 0, Math.PI * 2);
          gridCtx.fill();
        }
      }

      lastTileCount = tileCount;
      lastGridSize = gridSize;
      lastSkin = currentSkin;

      ctx.drawImage(gridCanvas, 0, 0);
    }

    // 绘制单个圆角格子
    function drawCell({ x, y }, color, radius = 4, opts = {}) {
      const px = x * gridSize;
      const py = y * gridSize;
      ctx.fillStyle = color;
      if (opts.glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = opts.glow;
      }
      ctx.beginPath();
      ctx.roundRect(px + 1, py + 1, gridSize - 2, gridSize - 2, radius);
      ctx.fill();
      if (opts.glow) {
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      }
    }

    // 蛇头：圆角 + 朝向眼睛 + 发光
    function drawHead(head, dir, color) {
      const px = head.x * gridSize;
      const py = head.y * gridSize;
      const pad = 1;

      // 主体发光
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(px + pad, py + pad, gridSize - pad * 2, gridSize - pad * 2, 6);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // 高光（左上角）
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.roundRect(px + pad + 2, py + pad + 2, gridSize * 0.42, gridSize * 0.28, 4);
      ctx.fill();

      // 眼睛：朝运动方向
      const dx = dir ? dir.x : 0;
      const dy = dir ? dir.y : 0;
      const ex = px + gridSize / 2;
      const ey = py + gridSize / 2;
      const eo = gridSize * 0.22; // 眼距中心偏移
      const ef = gridSize * 0.16; // 眼距朝向偏移
      const er = gridSize * 0.14;
      const eyeOffsets = [
        { ox: -eo + dx * ef, oy: -eo + dy * ef },
        { ox: eo + dx * ef, oy: eo + dy * ef }
      ];
      // 默认无方向时斜向放置
      if (!dir) {
        eyeOffsets[0] = { ox: -eo, oy: -eo };
        eyeOffsets[1] = { ox: eo, oy: eo };
      }
      for (let i = 0; i < 2; i++) {
        const o = eyeOffsets[i];
        ctx.fillStyle = 'rgba(10,14,30,0.95)';
        ctx.beginPath();
        ctx.arc(ex + o.ox, ey + o.oy, er, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath();
        ctx.arc(ex + o.ox + dx * er * 0.35, ey + o.oy + dy * er * 0.35, er * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 蛇身：沿长度渐变 + 圆角
    function drawBody(snake, headColor, bodyColor) {
      const len = snake.length;
      for (let i = 1; i < len; i++) {
        const seg = snake[i];
        const t = len <= 1 ? 1 : i / (len - 1);
        const px = seg.x * gridSize;
        const py = seg.y * gridSize;
        // 头部向尾部：headColor → bodyColor
        ctx.fillStyle = i === 1 ? headColor : mixColor(headColor, bodyColor, t);
        ctx.beginPath();
        ctx.roundRect(px + 1, py + 1, gridSize - 2, gridSize - 2, 5);
        ctx.fill();
        // 每节内部高光
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.roundRect(px + 3, py + 3, gridSize * 0.4, gridSize * 0.24, 3);
        ctx.fill();
      }
    }

    // 在两色之间线性插值（hex → rgb）
    function mixColor(a, b, t) {
      const ca = parseHex(a);
      const cb = parseHex(b);
      const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
      const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
      const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
      return `rgb(${r},${g},${bl})`;
    }

    function parseHex(hex) {
      if (Array.isArray(hex)) return hex;
      const s = String(hex).replace('#', '');
      if (s.length === 3) {
        return [parseInt(s[0] + s[0], 16), parseInt(s[1] + s[1], 16), parseInt(s[2] + s[2], 16)];
      }
      return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
    }

    // 食物：径向渐变 + 光晕脉冲
    function drawFoodCell(food, color, radius = 6, pulseSpeed = 1) {
      if (!food) return;
      const now = performance.now();
      const pulse = 0.5 + 0.5 * Math.sin(now / 300 * pulseSpeed);
      const glow = 6 + pulse * 8;
      const px = food.x * gridSize;
      const py = food.y * gridSize;
      const cx = px + gridSize / 2;
      const cy = py + gridSize / 2;

      ctx.shadowColor = color;
      ctx.shadowBlur = glow;
      const grad = ctx.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, gridSize * 0.55);
      grad.addColorStop(0, lighten(color, 55));
      grad.addColorStop(1, color);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, gridSize * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }

    function lighten(hex, amt) {
      const c = parseHex(hex);
      const f = (v) => Math.min(255, Math.round(v + (255 - v) * amt / 100));
      return `rgb(${f(c[0])},${f(c[1])},${f(c[2])})`;
    }

    // 完整画面绘制（主循环调用；粒子循环也复用）
    function drawFull() {
      const skinThemes = getSkinThemes();
      const currentSkin = getCurrentSkin();
      const skin = skinThemes[currentSkin];
      const now = performance.now();
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
        ghostFood,
        rocks,
        snake,
        phaseUntil,
        ghostUntil
      } = getState();
      const isPhaseActive = now < phaseUntil;
      const isGhostActive = now < ghostUntil;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 板底：微渐变（深空感）
      const boardGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      boardGrad.addColorStop(0, skin.board);
      boardGrad.addColorStop(1, shade(skin.board, -6));
      ctx.fillStyle = boardGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGrid();

      // 食物与道具（发光绘制）
      drawFoodCell(food, '#f472b6', 6, 1);
      if (bonusFood) drawFoodCell(bonusFood, '#facc15', 7, 1.2);
      if (shieldFood) drawFoodCell(shieldFood, '#38bdf8', 7, 0.9);
      if (boostFood) drawFoodCell(boostFood, '#f59e0b', 7, 1.1);
      if (timeFood) drawFoodCell(timeFood, '#a78bfa', 7, 1);
      if (freezeFood) drawFoodCell(freezeFood, '#22d3ee', 7, 0.85);
      if (phaseFood) drawFoodCell(phaseFood, '#c084fc', 7, 1.15);
      if (crownFood) drawFoodCell(crownFood, '#fde047', 7, 1.2);
      if (magnetFood) drawFoodCell(magnetFood, '#60a5fa', 7, 0.95);
      if (comboFood) drawFoodCell(comboFood, '#fb7185', 7, 1.1);
      if (ghostFood) drawFoodCell(ghostFood, '#e2e8f0', 7, 0.9);

      // 岩石：主体 + 顶部高光（立体感）
      rocks.forEach((rock) => {
        drawCell(rock, '#475569', 5);
        const rpx = rock.x * gridSize;
        const rpy = rock.y * gridSize;
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.beginPath();
        ctx.roundRect(rpx + 3, rpy + 3, gridSize * 0.4, gridSize * 0.22, 2);
        ctx.fill();
      });

      // 蛇
      const headColor = isPhaseActive ? skin.phaseHead : skin.head;
      if (snake.length > 0) {
        const head = snake[0];
        // 根据头与第二节推断朝向（有方向时）
        let dir = null;
        if (snake.length > 1) {
          dir = { x: head.x - snake[1].x, y: head.y - snake[1].y };
        }
        if (isGhostActive) ctx.globalAlpha = 0.55;
        drawBody(snake, headColor, skin.body);
        drawHead(head, dir, headColor);
        if (isGhostActive) ctx.globalAlpha = 1;
      }
    }

    function shade(hex, amt) {
      const c = parseHex(hex);
      const f = (v) => Math.max(0, Math.min(255, Math.round(v + amt)));
      return `rgb(${f(c[0])},${f(c[1])},${f(c[2])})`;
    }

    function draw() {
      // 吃食检测 → 粒子爆发
      const state = getState();
      detectEatAndBurst(state);
      drawFull();
      // 粒子位置更新由独立 rAF 驱动，此处仅绘制当前状态，避免双重加速
      if (particles.length > 0) {
        drawParticles(performance.now());
      }
    }

    return {
      draw,
      burst: spawnBurst,
      cancelEffects: cancelParticleLoop
    };
  }

  global.SnakeRender = {
    createRenderer
  };
})(window);

const SnakeRender = window.SnakeRender;
export { SnakeRender };
