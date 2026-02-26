window.SnakeEvents = (() => {
  const defaultPack = { id: 'none', label: '无活动', summary: '当前无活动加成', scoreFactor: 1 };

  function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  function betweenMonthDay(date, start, end) {
    const value = (date.getMonth() + 1) * 100 + date.getDate();
    return value >= start && value <= end;
  }

  function createEventsModule({ elements }) {
    const eventPacks = [
      {
        id: 'new-year-sprint',
        label: '新年冲榜季',
        summary: '元旦活动：得分 +30%，适合赛季冲分',
        scoreFactor: 1.3,
        match: (date) => betweenMonthDay(date, 101, 107)
      },
      {
        id: 'spring-festival',
        label: '新春冲分周',
        summary: '春节窗口：基础得分 +20%，奖励更集中',
        scoreFactor: 1.2,
        match: (date) => betweenMonthDay(date, 201, 216)
      },
      {
        id: 'summer-sprint-weekend',
        label: '夏日周末冲刺',
        summary: '暑期周末：额外 +25% 得分，适合冲榜',
        scoreFactor: 1.25,
        match: (date) => date.getMonth() >= 5 && date.getMonth() <= 7 && isWeekend(date)
      },
      {
        id: 'golden-week',
        label: '黄金周加速赛',
        summary: '国庆周：得分 +20%，更适合挑战高分路线',
        scoreFactor: 1.2,
        match: (date) => betweenMonthDay(date, 1001, 1007)
      },
      {
        id: 'weekend-rush',
        label: '周末双倍冲分',
        summary: '周末常驻活动：得分 +15%，建议搭配每日挑战',
        scoreFactor: 1.15,
        match: (date) => isWeekend(date)
      }
    ];

    let activePack = defaultPack;

    function resolvePack(date = new Date()) {
      const found = eventPacks.find((pack) => pack.match(date));
      activePack = found || defaultPack;
      return activePack;
    }

    function render() {
      if (!elements?.eventLabelEl || !elements?.eventSummaryEl) return;
      elements.eventLabelEl.textContent = activePack.label;
      elements.eventSummaryEl.textContent = activePack.summary;
    }

    function refresh(date = new Date()) {
      resolvePack(date);
      render();
      return activePack;
    }

    function getScoreFactor() {
      const factor = Number(activePack.scoreFactor);
      return Number.isFinite(factor) && factor > 0 ? factor : 1;
    }

    function getLabel() {
      return activePack.label;
    }

    return { refresh, getScoreFactor, getLabel };
  }

  return { createEventsModule };
})();
