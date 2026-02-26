(function initSnakeInput(global) {
  const DEFAULT_DIR_MAP = {
    ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 }
  };

  function createInputController(config) {
    const {
      documentEl,
      canvas,
      mobilePad,
      dirMap = DEFAULT_DIR_MAP,
      shouldIgnoreHotkeys,
      onTogglePause,
      onRestart,
      onToggleMute,
      onToggleHelp,
      onDirection,
      getSwipeThreshold
    } = config;

    let touchStart = null;

    documentEl.addEventListener('keydown', (event) => {
      if (shouldIgnoreHotkeys?.(event)) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (event.code === 'Space' || key === 'p') {
        event.preventDefault();
        onTogglePause?.();
        return;
      }

      if (key === 'r') {
        event.preventDefault();
        onRestart?.();
        return;
      }

      if (key === 'm') {
        event.preventDefault();
        onToggleMute?.();
        return;
      }

      if (key === 'h') {
        event.preventDefault();
        onToggleHelp?.();
        return;
      }

      const next = dirMap[key];
      if (!next) return;
      event.preventDefault();
      onDirection?.(next);
    });

    mobilePad?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-dir]');
      if (!button) return;
      onDirection?.(dirMap[button.dataset.dir]);
    });

    canvas?.addEventListener('touchstart', (event) => {
      const touch = event.changedTouches[0];
      touchStart = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });

    canvas?.addEventListener('touchend', (event) => {
      if (!touchStart) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const swipeThreshold = Number(getSwipeThreshold?.() || 18);
      const threshold = Number.isFinite(swipeThreshold) ? Math.min(40, Math.max(8, swipeThreshold)) : 18;
      if (absX < threshold && absY < threshold) {
        touchStart = null;
        return;
      }
      if (absX > absY) onDirection?.(dx > 0 ? dirMap.ArrowRight : dirMap.ArrowLeft);
      else onDirection?.(dy > 0 ? dirMap.ArrowDown : dirMap.ArrowUp);
      touchStart = null;
    }, { passive: true });
  }

  global.SnakeInput = {
    DEFAULT_DIR_MAP,
    createInputController
  };
})(window);
