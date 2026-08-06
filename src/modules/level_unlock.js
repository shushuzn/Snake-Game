/**
 * 关卡/难度解锁系统 (Level Unlock System)
 *
 * 功能说明：
 * - 定义四个难度等级（简单/普通/困难/地狱）及其段位称号
 * - 简单=青铜（默认解锁），普通=白银（简单≥100解锁），困难=黄金（普通≥200解锁），地狱=钻石（困难≥300解锁）
 * - 存储各难度的最高分与解锁状态到 localStorage
 * - 提供解锁进度条渲染与解锁动画触发
 * - 支持难度选择器 UI 更新
 *
 * localStorage key: 'snake-levels-v1'
 */

window.SnakeLevelUnlock = (() => {
  // ============================================================
  // 难度等级定义
  // ============================================================
  // 每个难度对应一个游戏速度（ms/帧，数值越小越快）
  // unlockThreshold 表示解锁下一个难度需要的前置难度最低分

  const LEVELS = [
    {
      id: 'easy',          // 简单
      label: '简单',
      rank: '青铜',
      rankIcon: '🥉',
      speed: 140,           // 对应悠闲速度
      unlockThreshold: 0,   // 默认解锁，无需前置条件
      requirement: null,
      description: '悠闲模式，适合新手'
    },
    {
      id: 'normal',         // 普通
      label: '普通',
      rank: '白银',
      rankIcon: '🥈',
      speed: 110,           // 对应标准速度
      unlockThreshold: 100, // 需要简单难度分数 ≥ 100
      requirement: { levelId: 'easy', minScore: 100 },
      description: '标准模式，节奏适中'
    },
    {
      id: 'hard',           // 困难
      label: '困难',
      rank: '黄金',
      rankIcon: '🥇',
      speed: 80,            // 对应极速速度
      unlockThreshold: 200, // 需要普通难度分数 ≥ 200
      requirement: { levelId: 'normal', minScore: 200 },
      description: '极速模式，挑战极限'
    },
    {
      id: 'hell',           // 地狱
      label: '地狱',
      rank: '钻石',
      rankIcon: '💎',
      speed: 60,            // 比极速更快
      unlockThreshold: 300, // 需要困难难度分数 ≥ 300
      requirement: { levelId: 'hard', minScore: 300 },
      description: '地狱模式，极限挑战'
    }
  ];

  // localStorage key
  const STORAGE_KEY = 'snake-levels-v1';

  // DOM 元素引用（延迟初始化）
  let containerEl = null;
  let levelSelectEl = null;
  let rankDisplayEl = null;
  let progressBarsEl = null;

  // ============================================================
  // 存储读写
  // ============================================================

  /**
   * 从 localStorage 加载关卡数据
   * @param {Storage} store - localStorage 对象
   * @returns {Object} 关卡数据对象
   */
  function loadLevelData(store) {
    try {
      const raw = store.getItem(STORAGE_KEY);
      if (!raw) return getDefaultLevelData();
      const parsed = JSON.parse(raw);
      return parsed || getDefaultLevelData();
    } catch {
      return getDefaultLevelData();
    }
  }

  /**
   * 保存关卡数据到 localStorage
   * @param {Storage} store - localStorage 对象
   * @param {Object} data - 待保存的数据
   */
  function saveLevelData(store, data) {
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // 忽略存储写入失败
    }
  }

  /**
   * 获取默认关卡数据（首次使用时）
   * @returns {Object}
   */
  function getDefaultLevelData() {
    const unlocked = {};
    LEVELS.forEach((lvl, idx) => {
      // 第一个难度默认解锁，其余根据条件
      unlocked[lvl.id] = {
        unlocked: idx === 0,  // 只有简单默认解锁
        bestScore: 0,
        unlockedAt: idx === 0 ? Date.now() : null
      };
    });
    return { unlocked, selectedLevel: 'easy' };
  }

  // ============================================================
  // 难度查询
  // ============================================================

  /**
   * 根据 ID 获取难度定义
   * @param {string} levelId
   * @returns {Object|undefined}
   */
  function getLevelById(levelId) {
    return LEVELS.find(l => l.id === levelId);
  }

  /**
   * 获取所有难度定义（带解锁状态）
   * @param {Storage} store
   * @returns {Array}
   */
  function getAllLevelsWithStatus(store) {
    const data = loadLevelData(store);
    return LEVELS.map(lvl => ({
      ...lvl,
      unlocked: data.unlocked[lvl.id]?.unlocked || false,
      bestScore: data.unlocked[lvl.id]?.bestScore || 0,
      unlockedAt: data.unlocked[lvl.id]?.unlockedAt || null
    }));
  }

  /**
   * 获取当前选中的难度
   * @param {Storage} store
   * @returns {string} levelId
   */
  function getSelectedLevelId(store) {
    const data = loadLevelData(store);
    return data.selectedLevel || 'easy';
  }

  /**
   * 设置当前选中的难度
   * @param {Storage} store
   * @param {string} levelId
   */
  function setSelectedLevel(store, levelId) {
    const data = loadLevelData(store);
    const lvl = getLevelById(levelId);
    if (!lvl) return;

    const levelData = data.unlocked[levelId];
    if (!levelData || !levelData.unlocked) return; // 只能选择已解锁的难度

    data.selectedLevel = levelId;
    saveLevelData(store, data);
  }

  /**
   * 获取难度对应的游戏速度
   * @param {string} levelId
   * @returns {number} speed 值（ms/帧）
   */
  function getSpeedForLevel(levelId) {
    const lvl = getLevelById(levelId);
    return lvl ? lvl.speed : 110;
  }

  /**
   * 获取难度对应的段位信息
   * @param {string} levelId
   * @returns {{rank: string, rankIcon: string}}
   */
  function getRankForLevel(levelId) {
    const lvl = getLevelById(levelId);
    if (!lvl) return { rank: '??', rankIcon: '❓' };
    return { rank: lvl.rank, rankIcon: lvl.rankIcon };
  }

  // ============================================================
  // 解锁逻辑
  // ============================================================

  /**
   * 游戏结束后检查并更新解锁状态
   * 会在以下情况触发：
   * - 更新各难度的最高分
   * - 检查并解锁满足条件的难度
   *
   * @param {Storage} store - localStorage 对象
   * @param {string} playedLevelId - 本局游戏的难度 ID
   * @param {number} score - 本局得分
   * @returns {Array} 新解锁的难度列表
   */
  function checkAndUnlock(store, playedLevelId, score) {
    const data = loadLevelData(store);
    const newlyUnlocked = [];

    // 1. 更新当前难度的最高分
    const currentLevelData = data.unlocked[playedLevelId];
    if (currentLevelData) {
      if (score > currentLevelData.bestScore) {
        currentLevelData.bestScore = score;
      }
    }

    // 2. 检查并解锁满足条件的下一个难度
    const currentIdx = LEVELS.findIndex(l => l.id === playedLevelId);
    if (currentIdx === -1 || currentIdx >= LEVELS.length - 1) {
      // 没有下一个难度
      saveLevelData(store, data);
      return newlyUnlocked;
    }

    const nextLevel = LEVELS[currentIdx + 1];
    const nextLevelData = data.unlocked[nextLevel.id];

    // 如果下一个难度还未解锁，且满足解锁条件
    if (nextLevelData && !nextLevelData.unlocked) {
      const prevBest = currentLevelData ? currentLevelData.bestScore : 0;
      if (prevBest >= nextLevel.unlockThreshold) {
        nextLevelData.unlocked = true;
        nextLevelData.unlockedAt = Date.now();
        newlyUnlocked.push(nextLevel);
      }
    }

    saveLevelData(store, data);
    return newlyUnlocked;
  }

  /**
   * 获取指定难度的解锁进度（百分比）
   * @param {Storage} store
   * @param {string} levelId - 要解锁的难度 ID
   * @returns {number} 0-100 的百分比，100 表示已解锁
   */
  function getUnlockProgress(store, levelId) {
    const data = loadLevelData(store);
    const lvl = getLevelById(levelId);
    if (!lvl) return 0;

    // 简单难度默认已解锁
    if (lvl.unlockThreshold === 0) {
      return data.unlocked[levelId]?.unlocked ? 100 : 0;
    }

    // 找到前置难度
    const req = lvl.requirement;
    if (!req) return 0;

    const prevBest = data.unlocked[req.levelId]?.bestScore || 0;
    const progress = Math.min(100, Math.floor((prevBest / req.minScore) * 100));
    return progress;
  }

  /**
   * 检查指定难度是否已解锁
   * @param {Storage} store
   * @param {string} levelId
   * @returns {boolean}
   */
  function isLevelUnlocked(store, levelId) {
    const data = loadLevelData(store);
    return data.unlocked[levelId]?.unlocked || false;
  }

  // ============================================================
  // UI 渲染
  // ============================================================

  /**
   * 渲染难度选择下拉框的选项（仅已解锁难度可选）
   * @param {Storage} store
   * @param {HTMLSelectElement} selectEl
   * @param {string} currentLevelId - 当前选中的难度 ID
   */
  function renderLevelSelect(store, selectEl, currentLevelId) {
    if (!selectEl) return;
    selectEl.innerHTML = '';

    const levels = getAllLevelsWithStatus(store);
    levels.forEach(lvl => {
      const opt = document.createElement('option');
      opt.value = lvl.id;
      opt.textContent = `${lvl.rankIcon} ${lvl.label} ${lvl.unlocked ? '' : '🔒'}`;
      if (!lvl.unlocked) {
        opt.disabled = true;
      }
      if (lvl.id === currentLevelId) {
        opt.selected = true;
      }
      selectEl.appendChild(opt);
    });
  }

  /**
   * 渲染段位展示信息
   * @param {string} levelId
   * @param {HTMLElement} containerEl
   */
  function renderRankDisplay(levelId, containerEl) {
    if (!containerEl) return;
    const { rank, rankIcon } = getRankForLevel(levelId);
    containerEl.innerHTML = `段位 <b id="currentRank">${rankIcon} ${rank}</b>`;
  }

  /**
   * 渲染所有难度的解锁进度条（适合放在设置面板附近）
   * @param {Storage} store
   * @param {HTMLElement} containerEl
   * @returns {Array} 进度条 DOM 元素列表
   */
  function renderProgressBars(store, containerEl) {
    if (!containerEl) return [];
    containerEl.innerHTML = '';

    const levels = getAllLevelsWithStatus(store);
    const bars = [];

    levels.forEach((lvl, idx) => {
      const progress = lvl.unlocked ? 100 : getUnlockProgress(store, lvl.id);
      const prevLevel = idx > 0 ? levels[idx - 1] : null;
      const reqText = prevLevel
        ? `需 ${prevLevel.label} ≥ ${lvl.unlockThreshold} 分（当前 ${prevLevel.bestScore}）`
        : '默认解锁';

      const barWrapper = document.createElement('div');
      barWrapper.className = `level-progress-item ${lvl.unlocked ? 'unlocked' : 'locked'}`;
      barWrapper.dataset.levelId = lvl.id;

      barWrapper.innerHTML = `
        <div class="level-progress-header">
          <span class="level-name">${lvl.rankIcon} ${lvl.label}</span>
          <span class="level-rank">${lvl.rank}</span>
          <span class="level-best">最高 ${lvl.bestScore}</span>
        </div>
        <div class="level-progress-bar-wrap">
          <div class="level-progress-bar-fill" style="width: ${progress}%"></div>
        </div>
        <div class="level-progress-footer">
          <span class="level-req">${reqText}</span>
          ${lvl.unlocked ? '<span class="level-status unlocked">已解锁</span>' : '<span class="level-status locked">未解锁</span>'}
        </div>
      `;

      containerEl.appendChild(barWrapper);
      bars.push(barWrapper);
    });

    return bars;
  }

  /**
   * 播放解锁动画（DOM 中的 .level-unlock-anim 元素）
   * 动画结束后自动移除
   */
  function playUnlockAnimation() {
    // 查找或创建动画容器
    let animEl = document.getElementById('levelUnlockAnim');
    if (!animEl) {
      animEl = document.createElement('div');
      animEl.id = 'levelUnlockAnim';
      animEl.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 24px 48px;
        border-radius: 16px;
        font-size: 20px;
        font-weight: bold;
        z-index: 9999;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        text-align: center;
        box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
      `;
      document.body.appendChild(animEl);
    }

    animEl.innerHTML = '🎉 难度解锁！<br><span style="font-size:14px">点击确定继续</span>';
    animEl.style.opacity = '1';

    // 点击关闭
    const dismiss = () => {
      animEl.style.opacity = '0';
      setTimeout(() => {
        if (animEl.parentNode) animEl.parentNode.removeChild(animEl);
      }, 300);
    };

    // 3秒后自动消失
    const timer = setTimeout(dismiss, 3000);

    // 点击也消失
    const clickHandler = () => {
      clearTimeout(timer);
      dismiss();
      document.removeEventListener('click', clickHandler);
    };
    setTimeout(() => document.addEventListener('click', clickHandler), 100);
  }

  /**
   * 更新难度选择器的选中状态（UI 同步）
   * @param {Storage} store
   * @param {HTMLSelectElement} selectEl
   */
  function syncSelectWithData(store, selectEl) {
    const selectedId = getSelectedLevelId(store);
    const data = loadLevelData(store);

    if (!selectEl) return;
    const options = selectEl.options;

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const lvl = getLevelById(opt.value);
      const levelData = data.unlocked[opt.value];

      // 更新解锁状态
      if (lvl && levelData) {
        opt.disabled = !levelData.unlocked;
        const lockIcon = levelData.unlocked ? '' : ' 🔒';
        opt.text = `${lvl.rankIcon} ${lvl.label}${lockIcon}`;
      }

      // 更新选中状态
      if (opt.value === selectedId) {
        opt.selected = true;
      }
    }
  }

  // ============================================================
  // 初始化与事件绑定
  // ============================================================

  /**
   * 初始化关卡解锁系统
   * 在 game.js 启动时调用一次
   * @param {Object} options
   * @param {Storage} options.store - localStorage 对象
   * @param {HTMLSelectElement} options.levelSelect - 难度选择器 select 元素
   * @param {HTMLElement} options.rankDisplay - 段位显示容器元素
   * @param {HTMLElement} options.progressContainer - 进度条容器元素
   */
  function init(options = {}) {
    const { store, levelSelect, rankDisplay, progressContainer } = options;

    containerEl = progressContainer || document.getElementById('levelProgressContainer');
    levelSelectEl = levelSelect || document.getElementById('levelSelect');
    rankDisplayEl = rankDisplay || document.getElementById('levelRankDisplay');
    progressBarsEl = containerEl;

    const selectedId = getSelectedLevelId(store);

    // 渲染初始状态
    if (levelSelectEl) {
      renderLevelSelect(store, levelSelectEl, selectedId);
      levelSelectEl.addEventListener('change', () => {
        const newLevelId = levelSelectEl.value;
        if (isLevelUnlocked(store, newLevelId)) {
          setSelectedLevel(store, newLevelId);
          syncSelectWithData(store, levelSelectEl);
          // 同步到游戏速度设置
          syncDifficultyToGame(store, newLevelId);
        }
      });
    }

    if (rankDisplayEl) {
      renderRankDisplay(selectedId, rankDisplayEl);
    }

    if (containerEl) {
      renderProgressBars(store, containerEl);
    }
  }

  /**
   * 将选中的难度同步到游戏的难度选择器（difficultySelect）
   * @param {Storage} store
   * @param {string} levelId
   */
  function syncDifficultyToGame(store, levelId) {
    const speed = getSpeedForLevel(levelId);
    const diffSelect = document.getElementById('difficulty');
    if (diffSelect) {
      // 找到匹配 speed 的 option 并选中
      for (let i = 0; i < diffSelect.options.length; i++) {
        if (Number(diffSelect.options[i].value) === speed) {
          diffSelect.selectedIndex = i;
          diffSelect.dispatchEvent(new Event('change'));
          break;
        }
      }
    }
  }

  /**
   * 刷新进度条显示（游戏结束后调用）
   * @param {Storage} store
   */
  function refreshProgressBars(store) {
    if (!progressBarsEl) return;
    renderProgressBars(store, progressBarsEl);
  }

  /**
   * 刷新段位显示
   * @param {Storage} store
   */
  function refreshRankDisplay(store) {
    if (!rankDisplayEl) return;
    const selectedId = getSelectedLevelId(store);
    renderRankDisplay(selectedId, rankDisplayEl);
  }

  /**
   * 刷新整个 UI（进度条 + 段位 + 选择器）
   * @param {Storage} store
   */
  function refreshAll(store) {
    const selectedId = getSelectedLevelId(store);
    if (levelSelectEl) syncSelectWithData(store, levelSelectEl);
    if (rankDisplayEl) renderRankDisplay(selectedId, rankDisplayEl);
    if (progressBarsEl) renderProgressBars(store, progressBarsEl);
  }

  // ============================================================
  // 对外接口
  // ============================================================

  return {
    init,
    loadLevelData,
    saveLevelData,
    getLevelById,
    getAllLevelsWithStatus,
    getSelectedLevelId,
    setSelectedLevel,
    getSpeedForLevel,
    getRankForLevel,
    checkAndUnlock,
    getUnlockProgress,
    isLevelUnlocked,
    renderLevelSelect,
    renderRankDisplay,
    renderProgressBars,
    playUnlockAnimation,
    syncSelectWithData,
    syncDifficultyToGame,
    refreshProgressBars,
    refreshRankDisplay,
    refreshAll
  };
})();

const SnakeLevelUnlock = window.SnakeLevelUnlock;
export { SnakeLevelUnlock };
