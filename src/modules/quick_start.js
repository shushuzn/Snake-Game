/**
 * 快速开始优化 v1.9.0
 * 一键开始游戏，提升用户体验
 */
(function() {
  'use strict';

  function createQuickStartModule({ storage }) {
    if (!storage) return null;

    // 获取上次游戏的模式
    function getLastPlayedMode() {
      return storage.get('lastPlayedMode') || 'classic';
    }

    // 获取上次使用的皮肤
    function getLastUsedSkin() {
      return storage.get('lastUsedSkin') || 'default';
    }

    // 获取上次使用的难度
    function getLastDifficulty() {
      return storage.get('lastDifficulty') || 'normal';
    }

    // 保存游戏设置
    function saveGameSettings(mode, skin, difficulty) {
      storage.set('lastPlayedMode', mode);
      storage.set('lastUsedSkin', skin);
      storage.set('lastDifficulty', difficulty);
    }

    // 获取快速开始配置
    function getQuickStartConfig() {
      return {
        mode: getLastPlayedMode(),
        skin: getLastUsedSkin(),
        difficulty: getLastDifficulty(),
        timestamp: storage.get('lastGameTimestamp') || null
      };
    }

    // 一键开始游戏的数据
    function getQuickStartData() {
      const config = getQuickStartConfig();
      const gamesPlayed = storage.get('gamesPlayed') || 0;

      // 如果是新玩家，使用默认设置
      if (gamesPlayed < 3) {
        return {
          mode: 'classic',
          skin: 'default',
          difficulty: 'easy',
          isNewPlayer: true
        };
      }

      return {
        ...config,
        isNewPlayer: false
      };
    }

    // 更新最后游戏时间
    function updateLastGameTimestamp() {
      storage.set('lastGameTimestamp', Date.now());
    }

    // 获取连续游戏天数
    function getConsecutiveDays() {
      const lastGameTimestamp = storage.get('lastGameTimestamp');
      if (!lastGameTimestamp) return 0;

      const lastGameDate = new Date(lastGameTimestamp);
      const today = new Date();

      // 重置时间部分进行比较
      lastGameDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today - lastGameDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // 今天玩过
        return storage.get('consecutiveDays') || 1;
      } else if (diffDays === 1) {
        // 昨天玩过，连续天数+1
        const consecutive = (storage.get('consecutiveDays') || 0) + 1;
        storage.set('consecutiveDays', consecutive);
        return consecutive;
      } else {
        // 中断了
        storage.set('consecutiveDays', 1);
        return 1;
      }
    }

    // 检查是否应该显示快速开始提示
    function shouldShowQuickStartHint() {
      const gamesPlayed = storage.get('gamesPlayed') || 0;
      if (gamesPlayed < 3) return true; // 新玩家显示

      const lastGameTimestamp = storage.get('lastGameTimestamp');
      if (!lastGameTimestamp) return true;

      const hoursSinceLastGame = (Date.now() - lastGameTimestamp) / (1000 * 60 * 60);
      return hoursSinceLastGame > 24; // 超过24小时没玩，显示提示
    }

    // 获取每日首次奖励
    function getDailyFirstReward() {
      const today = new Date().toISOString().split('T')[0];
      const lastClaimDate = storage.get('dailyFirstRewardDate');

      if (lastClaimDate === today) {
        return { canClaim: false, message: '今日已领取' };
      }

      const consecutiveDays = getConsecutiveDays();

      // 连续天数越多，奖励越丰厚
      const baseCoins = 20;
      const bonusCoins = Math.min(consecutiveDays * 5, 50); // 最多+50
      const totalCoins = baseCoins + bonusCoins;

      return {
        canClaim: true,
        coins: totalCoins,
        consecutiveDays,
        message: `连续游戏 ${consecutiveDays} 天，获得 ${totalCoins} 金币`
      };
    }

    // 领取每日首次奖励
    function claimDailyFirstReward() {
      const reward = getDailyFirstReward();
      if (!reward.canClaim) {
        return { success: false, message: reward.message };
      }

      const coins = storage.get('coins') || 0;
      storage.set('coins', coins + reward.coins);
      storage.set('dailyFirstRewardDate', new Date().toISOString().split('T')[0]);

      return {
        success: true,
        coins: reward.coins,
        message: `获得 ${reward.coins} 金币！`
      };
    }

    return {
      getLastPlayedMode,
      getLastUsedSkin,
      getLastDifficulty,
      saveGameSettings,
      getQuickStartConfig,
      getQuickStartData,
      updateLastGameTimestamp,
      getConsecutiveDays,
      shouldShowQuickStartHint,
      getDailyFirstReward,
      claimDailyFirstReward
    };
  }

  // 暴露到全局
  window.SnakeQuickStart = {
    createQuickStartModule
  };
})();

const SnakeQuickStart = window.SnakeQuickStart;
export { SnakeQuickStart };
