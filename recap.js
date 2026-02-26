window.SnakeRecap = (() => {
  function createRecapModule({ storage, key, summaryEl, listEl, timelineListEl, getModeLabel, onPersist }) {
    let recap = null;

    function render() {
      if (!recap) {
        summaryEl.textContent = '暂无复盘数据';
        listEl.innerHTML = '<li>完成一局后将生成复盘摘要</li>';
        timelineListEl.innerHTML = '<li>暂无关键帧</li>';
        return;
      }
      const modeLabel = getModeLabel(recap.mode).replace('模式', '');
      summaryEl.textContent = `${modeLabel}｜${recap.score} 分｜原因：${recap.reason}`;
      listEl.innerHTML = [
        `最高连击：x${recap.maxCombo}`,
        `本局进食：${recap.roundFoods} 个`,
        `终局关卡：${recap.levelLabel}`,
        `剩余时间：${recap.remainingTimeLabel}`,
        `DLC：${recap.dlcText}`
      ].map(item => `<li>${item}</li>`).join('');

      const timeline = Array.isArray(recap.timeline) ? recap.timeline : [];
      timelineListEl.innerHTML = timeline.length
        ? timeline.map((item) => `<li>${item.label}：${item.detail}</li>`).join('')
        : '<li>暂无关键帧</li>';
    }

    function load() {
      const raw = storage.readJson(key, null);
      recap = raw && typeof raw === 'object' ? raw : null;
      render();
    }

    function save() {
      storage.writeJson(key, recap);
      onPersist();
    }

    function record(data) {
      recap = {
        score: Number(data.score || 0),
        mode: String(data.mode || 'classic'),
        reason: String(data.reason || '--'),
        maxCombo: Number(data.maxCombo || 1),
        roundFoods: Number(data.roundFoods || 0),
        levelLabel: String(data.levelLabel || '--'),
        remainingTimeLabel: String(data.remainingTimeLabel || '--'),
        dlcText: String(data.dlcText || '关闭'),
        timeline: Array.isArray(data.timeline) ? data.timeline.slice(-8) : [],
        ts: Date.now()
      };
      save();
      render();
    }

    function clear() {
      recap = null;
      render();
    }

    return { load, record, clear };
  }

  return { createRecapModule };
})();
