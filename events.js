window.SnakeEvents = (() => {
  function createEventsModule({ elements }) {
    const eventPacks = [
      {
        id: 'spring-festival',
        label: '新春冲分周',
        summary: '基础得分 +10%，奖励果刷新更积极',
        scoreFactor: 1.1,
        match: (date) => date.getMonth() === 1
      },
      {
        id: 'summer-sprint',
        label: '夏日冲刺周末',
        summary: '周末额外 +20% 得分，适合冲榜',
        scoreFactor: 1.2,
        match: (date) => (date.getMonth() >= 5 && date.getMonth() <= 7 && (date.getDay() === 0 || date.getDay() === 6))
      }
    ];

    let activePack = { id: 'none', label: '无活动', summary: '当前无活动加成', scoreFactor: 1 };

    function resolvePack(date = new Date()) {
      const found = eventPacks.find((pack) => pack.match(date));
      activePack = found || { id: 'none', label: '无活动', summary: '当前无活动加成', scoreFactor: 1 };
      return activePack;
    }

    function render() {
      elements.eventLabelEl.textContent = activePack.label;
      elements.eventSummaryEl.textContent = activePack.summary;
    }

    function refresh(date = new Date()) {
      resolvePack(date);
      render();
    }

    function getScoreFactor() {
      return Number(activePack.scoreFactor || 1);
    }

    function getLabel() {
      return activePack.label;
    }

    return { refresh, getScoreFactor, getLabel };
  }

  return { createEventsModule };
})();
