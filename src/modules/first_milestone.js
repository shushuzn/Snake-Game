/**
 * 首次里程碑奖励系统 v1.5.0
 *
 * 功能说明：
 * - 里程碑达成首次奖励，激励玩家探索
 * - 首次吃10个食物：+100分数
 * - 首次连击5：+150分数
 * - 首次连击10：+200分数
 * - 首次连击20：+300分数
 * - 首次击败AI：+200分数
 * - 首次通关所有模式：+500分数
 *
 * localStorage key: 'snake-first-milestone-v1'
 */

window.SnakeFirstMilestone = (() => {
  // ============================================================
  // 里程碑定义
  // ============================================================

  /**
   * 里程碑配置
   * id: 唯一标识
   * label: 显示名称
   * description: 描述
   * reward: 奖励分数
   * icon: 图标
   */
  const MILESTONES = [
    {
      id: 'foods10',
      label: '初尝美味',
      description: '首次吃10个食物',
      reward: 100,
      icon: '🍎'
    },
    {
      id: 'combo5',
      label: '连击新秀',
      description: '首次达成5连击',
      reward: 150,
      icon: '🔥'
    },
    {
      id: 'combo10',
      label: '连击高手',
      description: '首次达成10连击',
      reward: 200,
      icon: '💫'
    },
    {
      id: 'combo20',
      label: '连击大师',
      description: '首次达成20连击',
      reward: 300,
      icon: '⚡'
    },
    {
      id: 'beatAI',
      label: '击败AI',
      description: '首次在AI对战中获胜',
      reward: 200,
      icon: '🤖'
    },
    {
      id: 'allModes',
      label: '全能选手',
      description: '首次通关所有模式',
      reward: 500,
      icon: '🏆'
    }
  ];

  // localStorage key
  const STORAGE_KEY = 'snake-first-milestone-v1';

  // 已达成的里程碑集合
  let achievedMilestones = {};

  // 通知面板元素引用
  let notificationPanel = null;
  let notificationTimeout = null;

  // ============================================================
  // 存储读写
  // ============================================================

  /**
   * 从 localStorage 加载里程碑数据
   * @returns {Object} 里程碑数据对象
   */
  function loadMilestoneData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultMilestoneData();
      const parsed = JSON.parse(raw);
      return parsed || getDefaultMilestoneData();
    } catch {
      return getDefaultMilestoneData();
    }
  }

  /**
   * 保存里程碑数据到 localStorage
   * @param {Object} data - 待保存的数据
   */
  function saveMilestoneData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // 忽略存储写入失败
    }
  }

  /**
   * 获取默认里程碑数据
   * @returns {Object}
   */
  function getDefaultMilestoneData() {
    const achieved = {};
    MILESTONES.forEach(m => {
      achieved[m.id] = false;
    });
    return { achieved, totalReward: 0 };
  }

  // ============================================================
  // 里程碑查询
  // ============================================================

  /**
   * 检查里程碑是否已达成
   * @param {string} milestoneId
   * @returns {boolean}
   */
  function isAchieved(milestoneId) {
    return achievedMilestones[milestoneId] === true;
  }

  /**
   * 获取已达成里程碑的数量
   * @returns {number}
   */
  function getAchievedCount() {
    return Object.values(achievedMilestones).filter(v => v === true).length;
  }

  /**
   * 获取里程碑信息
   * @param {string} milestoneId
   * @returns {Object|null}
   */
  function getMilestoneInfo(milestoneId) {
    return MILESTONES.find(m => m.id === milestoneId) || null;
  }

  /**
   * 获取所有里程碑信息（带达成状态）
   * @returns {Array}
   */
  function getAllMilestonesWithStatus() {
    return MILESTONES.map(m => ({
      ...m,
      achieved: isAchieved(m.id)
    }));
  }

  /**
   * 获取已获得的总奖励分数
   * @returns {number}
   */
  function getTotalReward() {
    const data = loadMilestoneData();
    return data.totalReward || 0;
  }

  // ============================================================
  // 里程碑达成检查与奖励发放
  // ============================================================

  /**
   * 尝试达成里程碑
   * @param {string} milestoneId - 里程碑ID
   * @param {Function} addScoreCallback - 添加分数的回调函数
   * @returns {Object} 结果对象 { achieved: boolean, milestone: Object|null, reward: number }
   */
  function tryAchieve(milestoneId, addScoreCallback) {
    // 如果已经达成，直接返回
    if (isAchieved(milestoneId)) {
      return { achieved: false, milestone: null, reward: 0 };
    }

    const milestone = getMilestoneInfo(milestoneId);
    if (!milestone) {
      return { achieved: false, milestone: null, reward: 0 };
    }

    // 标记为已达成
    achievedMilestones[milestoneId] = true;

    // 更新存储数据
    const data = loadMilestoneData();
    data.achieved[milestoneId] = true;
    data.totalReward = (data.totalReward || 0) + milestone.reward;
    saveMilestoneData(data);

    // 发放奖励
    if (addScoreCallback && typeof addScoreCallback === 'function') {
      addScoreCallback(milestone.reward);
    }

    // 显示通知
    showNotification(milestone);

    return { achieved: true, milestone, reward: milestone.reward };
  }

  // ============================================================
  // 食物里程碑检查
  // ============================================================

  /**
   * 检查食物里程碑
   * @param {number} foodsEaten - 已吃食物数量
   * @param {Function} addScoreCallback - 添加分数的回调函数
   * @returns {Object|null} 达成的里程碑或null
   */
  function checkFoodsMilestone(foodsEaten, addScoreCallback) {
    if (foodsEaten >= 10 && !isAchieved('foods10')) {
      return tryAchieve('foods10', addScoreCallback);
    }
    return null;
  }

  // ============================================================
  // 连击里程碑检查
  // ============================================================

  /**
   * 检查连击里程碑
   * @param {number} combo - 当前连击数
   * @param {Function} addScoreCallback - 添加分数的回调函数
   * @returns {Object|null} 达成的里程碑或null
   */
  function checkComboMilestone(combo, addScoreCallback) {
    if (combo >= 20 && !isAchieved('combo20')) {
      return tryAchieve('combo20', addScoreCallback);
    }
    if (combo >= 10 && !isAchieved('combo10')) {
      return tryAchieve('combo10', addScoreCallback);
    }
    if (combo >= 5 && !isAchieved('combo5')) {
      return tryAchieve('combo5', addScoreCallback);
    }
    return null;
  }

  // ============================================================
  // AI对战里程碑检查
  // ============================================================

  /**
   * 检查AI对战胜利里程碑
   * @param {Function} addScoreCallback - 添加分数的回调函数
   * @returns {Object|null} 达成的里程碑或null
   */
  function checkBeatAIMilestone(addScoreCallback) {
    if (!isAchieved('beatAI')) {
      return tryAchieve('beatAI', addScoreCallback);
    }
    return null;
  }

  // ============================================================
  // 全模式通关里程碑检查
  // ============================================================

  /**
   * 检查全模式通关里程碑
   * @param {Array} completedModes - 已通关的模式数组
   * @param {Function} addScoreCallback - 添加分数的回调函数
   * @returns {Object|null} 达成的里程碑或null
   */
  function checkAllModesMilestone(completedModes, addScoreCallback) {
    if (!completedModes || !Array.isArray(completedModes)) return null;

    const allModes = ['classic', 'timed', 'blitz', 'endless', 'roguelike'];
    const allCompleted = allModes.every(m => completedModes.includes(m));

    if (allCompleted && !isAchieved('allModes')) {
      return tryAchieve('allModes', addScoreCallback);
    }
    return null;
  }

  // ============================================================
  // 通知面板
  // ============================================================

  /**
   * 显示里程碑达成通知
   * @param {Object} milestone - 里程碑信息
   */
  function showNotification(milestone) {
    // 如果通知面板不存在，先创建
    if (!notificationPanel) {
      createNotificationPanel();
    }

    // 清除之前的定时器
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }

    // 更新通知内容
    const notificationContent = notificationPanel.querySelector('.milestone-notification-content');
    const notificationIcon = notificationPanel.querySelector('.milestone-notification-icon');
    const notificationLabel = notificationPanel.querySelector('.milestone-notification-label');
    const notificationDesc = notificationPanel.querySelector('.milestone-notification-desc');
    const notificationReward = notificationPanel.querySelector('.milestone-notification-reward');

    if (notificationIcon) notificationIcon.textContent = milestone.icon;
    if (notificationLabel) notificationLabel.textContent = milestone.label;
    if (notificationDesc) notificationDesc.textContent = milestone.description;
    if (notificationReward) notificationReward.textContent = `+${milestone.reward} 分`;

    // 显示面板
    notificationPanel.classList.add('show');
    notificationPanel.classList.remove('hide');

    // 3秒后自动隐藏
    notificationTimeout = setTimeout(() => {
      hideNotification();
    }, 3000);
  }

  /**
   * 隐藏通知面板
   */
  function hideNotification() {
    if (notificationPanel) {
      notificationPanel.classList.remove('show');
      notificationPanel.classList.add('hide');
    }
  }

  /**
   * 创建通知面板DOM元素
   */
  function createNotificationPanel() {
    // 检查是否已存在
    let existingPanel = document.getElementById('milestoneNotification');
    if (existingPanel) {
      notificationPanel = existingPanel;
      return;
    }

    // 创建通知面板
    notificationPanel = document.createElement('div');
    notificationPanel.id = 'milestoneNotification';
    notificationPanel.className = 'milestone-notification';
    notificationPanel.innerHTML = `
      <div class="milestone-notification-content">
        <div class="milestone-notification-icon">🏆</div>
        <div class="milestone-notification-text">
          <div class="milestone-notification-label">里程碑达成</div>
          <div class="milestone-notification-desc">描述</div>
        </div>
        <div class="milestone-notification-reward">+0 分</div>
        <button class="milestone-notification-close" aria-label="关闭">×</button>
      </div>
    `;

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .milestone-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        font-size: 14px;
        box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
        transform: translateX(120%);
        transition: transform 0.3s ease;
        max-width: 320px;
      }
      .milestone-notification.show {
        transform: translateX(0);
      }
      .milestone-notification.hide {
        transform: translateX(120%);
      }
      .milestone-notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .milestone-notification-icon {
        font-size: 32px;
        line-height: 1;
      }
      .milestone-notification-text {
        flex: 1;
      }
      .milestone-notification-label {
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 4px;
      }
      .milestone-notification-desc {
        opacity: 0.9;
        font-size: 12px;
      }
      .milestone-notification-reward {
        font-weight: bold;
        font-size: 18px;
        color: #ffd700;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }
      .milestone-notification-close {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        padding: 0;
        margin-left: 8px;
      }
      .milestone-notification-close:hover {
        background: rgba(255,255,255,0.3);
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(notificationPanel);

    // 绑定关闭按钮事件
    const closeBtn = notificationPanel.querySelector('.milestone-notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', hideNotification);
    }
  }

  // ============================================================
  // 初始化
  // ============================================================

  /**
   * 初始化里程碑系统
   * @param {Object} options - 配置选项
   * @param {Storage} options.storage - 存储对象（可选，用于兼容）
   */
  function init(options = {}) {
    // 加载已保存的数据
    const data = loadMilestoneData();
    achievedMilestones = data.achieved || {};

    // 创建通知面板
    createNotificationPanel();
  }

  // 初始化
  init();

  // ============================================================
  // 公开API
  // ============================================================

  return {
    // 常量
    MILESTONES,
    STORAGE_KEY,

    // 状态查询
    isAchieved,
    getAchievedCount,
    getMilestoneInfo,
    getAllMilestonesWithStatus,
    getTotalReward,

    // 里程碑检查
    tryAchieve,
    checkFoodsMilestone,
    checkComboMilestone,
    checkBeatAIMilestone,
    checkAllModesMilestone,

    // 通知控制
    showNotification,
    hideNotification,

    // 初始化
    init
  };
})();

const SnakeFirstMilestone = window.SnakeFirstMilestone;
export { SnakeFirstMilestone };
