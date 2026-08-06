/**
 * 技能树/天赋系统 v1.5.0
 *
 * 玩家通过积累技能点（每局分数转化）解锁和升级技能
 *
 * 主动技能（3个）:
 * - 闪现（Dash）— 瞬间移动一小段距离，CD 15秒
 * - 护盾（Shield）— 3秒无敌，CD 20秒
 * - 穿墙（Warp）— 允许穿墙一次，CD 10秒
 *
 * 被动技能（3个）:
 * - 双倍分数（DoubleScore）— 永久双倍分数
 * - 减速延长（SlowExtend）— 减速效果+3秒
 * - 加速生成（SpeedSpawn）— 加速道具生成概率+20%
 *
 * localStorage key: 'snake-skilltree-v1'
 */

window.SnakeSkillTree = (() => {
  // 技能类型枚举
  const SKILL_TYPE = {
    ACTIVE: 'active',   // 主动技能
    PASSIVE: 'passive'  // 被动技能
  };

  // 主动技能配置
  const ACTIVE_SKILLS = {
    dash: {
      id: 'dash',
      name: '闪现',
      icon: '⚡',
      description: '瞬间移动一小段距离',
      type: SKILL_TYPE.ACTIVE,
      maxLevel: 3,
      cooldown: 15,      // 冷却时间（秒）
      baseCooldown: 15,
      dashDistance: 2     // 闪现距离（格）
    },
    shield: {
      id: 'shield',
      name: '护盾',
      icon: '🛡️',
      description: '3秒无敌时间',
      type: SKILL_TYPE.ACTIVE,
      maxLevel: 3,
      cooldown: 20,
      baseCooldown: 20,
      invincibilityDuration: 3  // 无敌持续时间（秒）
    },
    warp: {
      id: 'warp',
      name: '穿墙',
      icon: '🌟',
      description: '允许穿墙一次',
      type: SKILL_TYPE.ACTIVE,
      maxLevel: 3,
      cooldown: 10,
      baseCooldown: 10,
      charges: 1         // 穿墙次数
    }
  };

  // 被动技能配置
  const PASSIVE_SKILLS = {
    doubleScore: {
      id: 'doubleScore',
      name: '双倍分数',
      icon: '✌️',
      description: '永久双倍分数',
      type: SKILL_TYPE.PASSIVE,
      maxLevel: 1,
      multiplier: 2       // 分数倍率
    },
    slowExtend: {
      id: 'slowExtend',
      name: '减速延长',
      icon: '❄️',
      description: '减速效果+3秒',
      type: SKILL_TYPE.PASSIVE,
      maxLevel: 3,
      bonusDuration: 3   // 额外持续时间（秒）
    },
    speedSpawn: {
      id: 'speedSpawn',
      name: '加速生成',
      icon: '🚀',
      description: '加速道具生成概率+20%',
      type: SKILL_TYPE.PASSIVE,
      maxLevel: 3,
      bonusChance: 0.2  // 额外生成概率
    }
  };

  // 所有技能配置合并
  const ALL_SKILLS = { ...ACTIVE_SKILLS, ...PASSIVE_SKILLS };

  // 升级消耗配置（每级需要的技能点数）
  const UPGRADE_COSTS = [1, 2, 3];  // 1级->2级需要2点, 2级->3级需要3点

  // 技能点获取比例：1点/100分
  const POINTS_PER_SCORE = 100;

  // localStorage键名
  const STORAGE_KEY = 'snake-skilltree-v1';

  /**
   * 创建技能树模块实例
   * @param {Object} options - 配置选项
   * @param {Object} options.storage - 存储模块实例
   * @returns {Object} 技能树模块API
   */
  function createSkillTreeModule({ storage }) {
    // 默认状态
    const DEFAULT_STATE = {
      skillPoints: 0,           // 当前可用技能点
      totalEarnedPoints: 0,     // 累计获得技能点
      skills: {},               // 技能等级数据 { skillId: level }
      activeCooldowns: {},      // 主动技能冷却状态 { skillId: remainingCooldown }
      lastUpdated: Date.now()
    };

    let treeState = { ...DEFAULT_STATE };

    // 初始化技能等级
    function initSkills() {
      const skills = {};
      Object.keys(ALL_SKILLS).forEach((skillId) => {
        skills[skillId] = 0;  // 初始等级为0（未解锁）
      });
      return skills;
    }

    // 从localStorage加载状态
    function load() {
      try {
        const raw = storage.readJson(STORAGE_KEY, null);
        if (raw && typeof raw === 'object') {
          treeState = {
            skillPoints: Number(raw.skillPoints) || 0,
            totalEarnedPoints: Number(raw.totalEarnedPoints) || 0,
            skills: raw.skills && typeof raw.skills === 'object' ? raw.skills : initSkills(),
            activeCooldowns: raw.activeCooldowns && typeof raw.activeCooldowns === 'object' ? raw.activeCooldowns : {},
            lastUpdated: Number(raw.lastUpdated) || Date.now()
          };
        } else {
          treeState.skills = initSkills();
        }
      } catch {
        treeState.skills = initSkills();
      }
    }

    // 保存状态到localStorage
    function save() {
      treeState.lastUpdated = Date.now();
      storage.writeJson(STORAGE_KEY, treeState);
    }

    // 根据得分计算可获得的技能点
    function calculateSkillPoints(score) {
      return Math.floor(score / POINTS_PER_SCORE);
    }

    // 添加技能点（游戏结束后调用）
    function addSkillPoints(score) {
      const points = calculateSkillPoints(score);
      if (points > 0) {
        treeState.skillPoints += points;
        treeState.totalEarnedPoints += points;
        save();
        return points;
      }
      return 0;
    }

    // 获取当前技能点余额
    function getSkillPoints() {
      return treeState.skillPoints;
    }

    // 获取累计获得的技能点
    function getTotalEarnedPoints() {
      return treeState.totalEarnedPoints;
    }

    // 获取技能等级
    function getSkillLevel(skillId) {
      return treeState.skills[skillId] || 0;
    }

    // 获取技能配置
    function getSkillConfig(skillId) {
      return ALL_SKILLS[skillId] || null;
    }

    // 获取所有技能配置
    function getAllSkillsConfig() {
      return { ...ALL_SKILLS };
    }

    // 获取升级所需点数
    function getUpgradeCost(skillId) {
      const currentLevel = getSkillLevel(skillId);
      if (currentLevel >= getMaxLevel(skillId)) {
        return null;  // 已满级
      }
      return UPGRADE_COSTS[currentLevel] || (currentLevel + 1);
    }

    // 获取技能最大等级
    function getMaxLevel(skillId) {
      const config = ALL_SKILLS[skillId];
      return config ? config.maxLevel : 0;
    }

    // 检查技能是否已解锁
    function isUnlocked(skillId) {
      return getSkillLevel(skillId) > 0;
    }

    // 检查技能是否已满级
    function isMaxLevel(skillId) {
      return getSkillLevel(skillId) >= getMaxLevel(skillId);
    }

    // 升级技能
    function upgradeSkill(skillId) {
      const config = ALL_SKILLS[skillId];
      if (!config) return { success: false, reason: '技能不存在' };

      const currentLevel = getSkillLevel(skillId);
      if (isMaxLevel(skillId)) {
        return { success: false, reason: '技能已满级' };
      }

      const cost = getUpgradeCost(skillId);
      if (treeState.skillPoints < cost) {
        return { success: false, reason: `技能点不足（需要${cost}点，当前${treeState.skillPoints}点）` };
      }

      treeState.skillPoints -= cost;
      treeState.skills[skillId] = currentLevel + 1;
      save();

      return {
        success: true,
        newLevel: treeState.skills[skillId],
        remainingPoints: treeState.skillPoints
      };
    }

    // 解锁技能（首次解锁）
    function unlockSkill(skillId) {
      const config = ALL_SKILLS[skillId];
      if (!config) return { success: false, reason: '技能不存在' };

      if (isUnlocked(skillId)) {
        return { success: false, reason: '技能已解锁' };
      }

      const cost = getUpgradeCost(skillId);
      if (treeState.skillPoints < cost) {
        return { success: false, reason: `技能点不足（需要${cost}点，当前${treeState.skillPoints}点）` };
      }

      treeState.skillPoints -= cost;
      treeState.skills[skillId] = 1;
      save();

      return {
        success: true,
        newLevel: 1,
        remainingPoints: treeState.skillPoints
      };
    }

    // 重置所有技能（消耗道具）
    function resetSkills() {
      treeState.skillPoints = 0;
      treeState.totalEarnedPoints = 0;
      treeState.skills = initSkills();
      treeState.activeCooldowns = {};
      save();
    }

    // 重置所有技能并保留技能点
    function resetSkillsKeepPoints() {
      treeState.skills = initSkills();
      treeState.activeCooldowns = {};
      save();
    }

    // 获取技能当前效果值
    function getSkillEffectValue(skillId) {
      const config = ALL_SKILLS[skillId];
      const level = getSkillLevel(skillId);
      if (!config || level === 0) return null;

      switch (skillId) {
        case 'doubleScore':
          return config.multiplier;
        case 'slowExtend':
          return level * config.bonusDuration;
        case 'speedSpawn':
          return level * config.bonusChance;
        case 'dash':
          return { cooldown: config.baseCooldown, distance: config.dashDistance };
        case 'shield':
          return { cooldown: config.baseCooldown, duration: config.invincibilityDuration };
        case 'warp':
          return { cooldown: config.baseCooldown, charges: config.charges };
        default:
          return null;
      }
    }

    // 使用主动技能（返回是否成功，设置冷却）
    function useActiveSkill(skillId) {
      if (!isActiveSkill(skillId)) {
        return { success: false, reason: '不是主动技能' };
      }

      if (!isUnlocked(skillId)) {
        return { success: false, reason: '技能未解锁' };
      }

      // 检查冷却
      if (isOnCooldown(skillId)) {
        return { success: false, reason: `技能冷却中（${Math.ceil(getCooldownRemaining(skillId))}秒）` };
      }

      const config = ALL_SKILLS[skillId];
      treeState.activeCooldowns[skillId] = config.baseCooldown;
      save();

      return { success: true, effect: getSkillEffectValue(skillId) };
    }

    // 检查是否是主动技能
    function isActiveSkill(skillId) {
      const config = ALL_SKILLS[skillId];
      return config && config.type === SKILL_TYPE.ACTIVE;
    }

    // 检查是否是被动技能
    function isPassiveSkill(skillId) {
      const config = ALL_SKILLS[skillId];
      return config && config.type === SKILL_TYPE.PASSIVE;
    }

    // 检查技能是否在冷却中
    function isOnCooldown(skillId) {
      return (treeState.activeCooldowns[skillId] || 0) > 0;
    }

    // 获取技能剩余冷却时间
    function getCooldownRemaining(skillId) {
      return treeState.activeCooldowns[skillId] || 0;
    }

    // 更新冷却时间（每帧调用）
    function updateCooldowns(deltaTime) {
      let changed = false;
      Object.keys(treeState.activeCooldowns).forEach((skillId) => {
        if (treeState.activeCooldowns[skillId] > 0) {
          treeState.activeCooldowns[skillId] = Math.max(0, treeState.activeCooldowns[skillId] - deltaTime);
          changed = true;
        }
      });
      if (changed) save();
    }

    // 获取被动技能加成
    function getPassiveBonuses() {
      const bonuses = {
        scoreMultiplier: 1,
        slowBonusDuration: 0,
        speedSpawnBonusChance: 0
      };

      if (isUnlocked('doubleScore')) {
        bonuses.scoreMultiplier = getSkillEffectValue('doubleScore');
      }
      if (isUnlocked('slowExtend')) {
        bonuses.slowBonusDuration = getSkillEffectValue('slowExtend');
      }
      if (isUnlocked('speedSpawn')) {
        bonuses.speedSpawnBonusChance = getSkillEffectValue('speedSpawn');
      }

      return bonuses;
    }

    // 获取所有技能状态摘要
    function getSkillsSummary() {
      const summary = {};
      Object.keys(ALL_SKILLS).forEach((skillId) => {
        const config = ALL_SKILLS[skillId];
        summary[skillId] = {
          ...config,
          level: getSkillLevel(skillId),
          isUnlocked: isUnlocked(skillId),
          isMaxLevel: isMaxLevel(skillId),
          upgradeCost: getUpgradeCost(skillId),
          effect: getSkillEffectValue(skillId),
          cooldownRemaining: isActiveSkill(skillId) ? getCooldownRemaining(skillId) : null
        };
      });
      return summary;
    }

    // 生成技能树UI HTML
    function generateSkillTreeUI() {
      const points = treeState.skillPoints;
      const activeSkills = Object.values(ACTIVE_SKILLS);
      const passiveSkills = Object.values(PASSIVE_SKILLS);

      const renderSkill = (skill) => {
        const level = getSkillLevel(skill.id);
        const isUnlocked = level > 0;
        const maxLevel = skill.maxLevel;
        const cost = getUpgradeCost(skill.id);
        const cooldown = isActiveSkill(skill.id) ? getCooldownRemaining(skill.id) : null;
        const isOnCd = cooldown > 0;

        const statusClass = isOnCd ? 'on-cooldown' : isUnlocked ? 'unlocked' : 'locked';
        const levelStars = isUnlocked ? '★'.repeat(level) + '☆'.repeat(maxLevel - level) : '☆'.repeat(maxLevel);
        const actionText = !isUnlocked ? '解锁' : (level < maxLevel ? `升级(${cost}点)` : '已满级');
        const actionDisabled = (!isUnlocked && points < cost) || (isUnlocked && (level >= maxLevel || points < cost)) ? 'disabled' : '';

        return `
          <div class="skill-item ${statusClass}" data-skill-id="${skill.id}">
            <div class="skill-icon">${skill.icon}</div>
            <div class="skill-info">
              <div class="skill-name">${skill.name}</div>
              <div class="skill-desc">${skill.description}</div>
              <div class="skill-level">${levelStars}</div>
              ${isOnCd ? `<div class="skill-cooldown">CD: ${Math.ceil(cooldown)}s</div>` : ''}
            </div>
            <button class="skill-action-btn" data-action="upgrade" data-skill="${skill.id}" ${actionDisabled}>
              ${actionText}
            </button>
          </div>
        `;
      };

      return `
        <div class="skill-tree-panel">
          <div class="skill-tree-header">
            <h3>技能树</h3>
            <div class="skill-points-display">
              <span class="skill-points-icon">💎</span>
              <span class="skill-points-value">${points}</span>
              <span class="skill-points-label">技能点</span>
            </div>
            <button id="toggleSkillTree" class="toggle-btn" title="收起/展开">▼</button>
          </div>
          <div id="skillTreeContent" class="skill-tree-content">
            <div class="skill-section">
              <h4>主动技能</h4>
              <div class="skill-list">
                ${activeSkills.map(renderSkill).join('')}
              </div>
            </div>
            <div class="skill-section">
              <h4>被动技能</h4>
              <div class="skill-list">
                ${passiveSkills.map(renderSkill).join('')}
              </div>
            </div>
            <div class="skill-tree-footer">
              <button id="resetSkillTree" class="reset-btn" title="重置所有技能（保留技能点）">重置技能</button>
              <span class="skill-hint">每100分获得1技能点</span>
            </div>
          </div>
        </div>
      `;
    }

    // 初始化
    load();

    // 返回公开API
    return {
      // 常量
      SKILL_TYPE,
      ACTIVE_SKILLS,
      PASSIVE_SKILLS,
      ALL_SKILLS,
      POINTS_PER_SCORE,

      // 技能点操作
      addSkillPoints,
      getSkillPoints,
      getTotalEarnedPoints,
      calculateSkillPoints,

      // 技能状态查询
      getSkillLevel,
      getSkillConfig,
      getAllSkillsConfig,
      getUpgradeCost,
      getMaxLevel,
      isUnlocked,
      isMaxLevel,
      isActiveSkill,
      isPassiveSkill,
      getSkillEffectValue,
      getPassiveBonuses,
      getSkillsSummary,

      // 技能操作
      unlockSkill,
      upgradeSkill,
      resetSkills,
      resetSkillsKeepPoints,

      // 冷却管理
      useActiveSkill,
      isOnCooldown,
      getCooldownRemaining,
      updateCooldowns,

      // UI辅助
      generateSkillTreeUI,

      // 状态管理
      getState: () => ({ ...treeState }),
      load,
      save
    };
  }

  return {
    createSkillTreeModule,
    SKILL_TYPE,
    ACTIVE_SKILLS,
    PASSIVE_SKILLS,
    ALL_SKILLS
  };
})();

const SnakeSkillTree = window.SnakeSkillTree;
export { SnakeSkillTree };
