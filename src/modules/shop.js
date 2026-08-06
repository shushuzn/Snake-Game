window.SnakeShop = (() => {
  const SKIN_CATEGORIES = {
    classic: { name: '经典', icon: '🎨' },
    special: { name: '特殊', icon: '✨' },
    seasonal: { name: '节日', icon: '🎉' },
    limited: { name: '限定', icon: '💎' }
  };

  const SKINS = [
    // 经典皮肤（默认已拥有）
    {
      id: 'classic-green',
      name: '经典绿',
      description: '传统贪吃蛇风格',
      color: '#00FF00',
      headColor: '#00CC00',
      category: 'classic',
      price: 0,
      owned: true,
      unlocked: true
    },
    {
      id: 'classic-blue',
      name: '深海蓝',
      description: '沉稳的蓝色调',
      color: '#0088FF',
      headColor: '#0066CC',
      category: 'classic',
      price: 100,
      owned: false,
      unlocked: true
    },
    {
      id: 'classic-red',
      name: '烈焰红',
      description: '热情的红色',
      color: '#FF4444',
      headColor: '#CC3333',
      category: 'classic',
      price: 100,
      owned: false,
      unlocked: true
    },
    // 特殊皮肤
    {
      id: 'neon-purple',
      name: '霓虹紫',
      description: '赛博朋克风格',
      color: '#FF00FF',
      headColor: '#CC00CC',
      category: 'special',
      price: 300,
      owned: false,
      unlocked: true,
      effect: 'glow'
    },
    {
      id: 'golden',
      name: '黄金蛇',
      description: '奢华金色外观',
      color: '#FFD700',
      headColor: '#FFA500',
      category: 'special',
      price: 500,
      owned: false,
      unlocked: true,
      effect: 'shine'
    },
    {
      id: 'rainbow',
      name: '彩虹蛇',
      description: '七彩渐变效果',
      color: 'rainbow',
      headColor: 'rainbow',
      category: 'special',
      price: 800,
      owned: false,
      unlocked: true,
      effect: 'rainbow'
    },
    // 节日皮肤
    {
      id: 'christmas',
      name: '圣诞蛇',
      description: '红白圣诞配色',
      color: '#FF0000',
      headColor: '#FFFFFF',
      category: 'seasonal',
      price: 400,
      owned: false,
      unlocked: true,
      limited: '12-01:12-31'
    },
    {
      id: 'halloween',
      name: '南瓜蛇',
      description: '万圣节主题',
      color: '#FF8800',
      headColor: '#000000',
      category: 'seasonal',
      price: 400,
      owned: false,
      unlocked: true,
      limited: '10-01:10-31'
    },
    {
      id: 'spring',
      name: '春樱蛇',
      description: '粉色樱花主题',
      color: '#FFB6C1',
      headColor: '#FF69B4',
      category: 'seasonal',
      price: 350,
      owned: false,
      unlocked: true,
      limited: '03-01:05-31'
    },
    // 限定皮肤
    {
      id: 'dragon',
      name: '神龙',
      description: '东方龙主题限定',
      color: '#FF4500',
      headColor: '#FFD700',
      category: 'limited',
      price: 1200,
      owned: false,
      unlocked: false,
      requirement: 'score1000',
      effect: 'fire'
    },
    {
      id: 'phoenix',
      name: '凤凰',
      description: '涅槃重生限定',
      color: '#FF1493',
      headColor: '#FFA500',
      category: 'limited',
      price: 1200,
      owned: false,
      unlocked: false,
      requirement: 'win50',
      effect: 'flame'
    }
  ];

  const shopKey = 'snake-shop-data-v1';
  const equippedSkinKey = 'snake-equipped-skin-v1';

  function createShopModule(storage) {
    let shopData = loadShopData();
    let equippedSkin = storage.readText(equippedSkinKey, 'classic-green');
    let roguePoints = 0;

    function loadShopData() {
      const data = storage.readJson(shopKey, null);
      if (data) return data;

      // 初始化默认数据
      const defaultData = {};
      SKINS.forEach(skin => {
        defaultData[skin.id] = {
          owned: skin.owned,
          unlocked: skin.unlocked
        };
      });
      return defaultData;
    }

    function saveShopData() {
      storage.writeJson(shopKey, shopData);
    }

    function getAllSkins() {
      return SKINS.map(skin => ({
        ...skin,
        owned: shopData[skin.id]?.owned || false,
        unlocked: shopData[skin.id]?.unlocked || false
      }));
    }

    function getSkinsByCategory(category) {
      return getAllSkins().filter(skin => skin.category === category);
    }

    function getOwnedSkins() {
      return getAllSkins().filter(skin => skin.owned);
    }

    function getEquippedSkin() {
      return SKINS.find(s => s.id === equippedSkin) || SKINS[0];
    }

    function equipSkin(skinId) {
      if (!shopData[skinId]?.owned) return false;
      equippedSkin = skinId;
      storage.writeText(equippedSkinKey, skinId);
      return true;
    }

    function canPurchase(skinId) {
      const skin = SKINS.find(s => s.id === skinId);
      if (!skin || skin.owned || !shopData[skinId]?.unlocked) return false;
      return roguePoints >= skin.price;
    }

    function purchaseSkin(skinId) {
      const skin = SKINS.find(s => s.id === skinId);
      if (!skin) return { success: false, message: '皮肤不存在' };
      if (shopData[skinId]?.owned) return { success: false, message: '已拥有该皮肤' };
      if (!shopData[skinId]?.unlocked) return { success: false, message: '该皮肤尚未解锁' };
      if (roguePoints < skin.price) return { success: false, message: '肉鸽点不足' };

      // 扣除肉鸽点
      roguePoints -= skin.price;
      shopData[skinId].owned = true;
      saveShopData();

      return { success: true, message: '购买成功！' };
    }

    function checkUnlockRequirements(stats) {
      let newUnlocks = [];

      SKINS.forEach(skin => {
        if (skin.requirement && !shopData[skin.id].unlocked) {
          let unlocked = false;

          switch (skin.requirement) {
            case 'score1000':
              unlocked = stats.bestScore >= 1000;
              break;
            case 'win50':
              unlocked = stats.totalWins >= 50;
              break;
            case 'play100':
              unlocked = stats.totalGames >= 100;
              break;
            case 'combo10':
              unlocked = stats.maxCombo >= 10;
              break;
          }

          if (unlocked) {
            shopData[skin.id].unlocked = true;
            newUnlocks.push(skin);
          }
        }
      });

      if (newUnlocks.length > 0) {
        saveShopData();
      }

      return newUnlocks;
    }

    function getRoguePoints() {
      return roguePoints;
    }

    function setRoguePoints(points) {
      roguePoints = Math.max(0, points);
    }

    function addRoguePoints(points) {
      roguePoints += points;
      return roguePoints;
    }

    function getSkinColors(skinId) {
      const skin = SKINS.find(s => s.id === skinId);
      if (!skin) return { color: '#00FF00', headColor: '#00CC00' };

      if (skin.effect === 'rainbow') {
        // 彩虹效果返回动态颜色
        const hue = (Date.now() / 20) % 360;
        const color = `hsl(${hue}, 100%, 50%)`;
        return { color, headColor: color, effect: 'rainbow' };
      }

      return {
        color: skin.color,
        headColor: skin.headColor,
        effect: skin.effect
      };
    }

    function getCategories() {
      return Object.entries(SKIN_CATEGORIES).map(([id, info]) => ({
        id,
        ...info
      }));
    }

    function isLimitedAvailable(skin) {
      if (!skin.limited) return true;

      const [start, end] = skin.limited.split(':');
      const now = new Date();
      const currentYear = now.getFullYear();

      const startDate = new Date(`${currentYear}-${start}`);
      const endDate = new Date(`${currentYear}-${end}`);

      // 处理跨年情况
      if (endDate < startDate) {
        endDate.setFullYear(currentYear + 1);
      }

      return now >= startDate && now <= endDate;
    }

    return {
      getAllSkins,
      getSkinsByCategory,
      getOwnedSkins,
      getEquippedSkin,
      equipSkin,
      canPurchase,
      purchaseSkin,
      checkUnlockRequirements,
      getRoguePoints,
      setRoguePoints,
      addRoguePoints,
      getSkinColors,
      getCategories,
      isLimitedAvailable,
      SKINS
    };
  }

  return { createShopModule };
})();

const SnakeShop = window.SnakeShop;
export { SnakeShop };
