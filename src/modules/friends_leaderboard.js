/**
 * Friends Leaderboard
 * 好友排行榜
 *
 * Features:
 * - Friend-only leaderboard
 * - Weekly/Monthly toggle
 * - Overtake notifications
 * - Share ranking
 */

window.SnakeFriendsLeaderboard = (() => {
  const STORAGE_KEY = 'snake-friends-leaderboard';

  function loadData(storage) {
    return storage.readJson(STORAGE_KEY, {
      weekly: [],
      monthly: [],
      lastUpdated: 0
    });
  }

  function saveData(storage, data) {
    storage.writeJson(STORAGE_KEY, data);
  }

  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  function getCurrentPeriod(type) {
    const now = new Date();
    if (type === 'weekly') {
      return `${now.getFullYear()}-W${getWeekNumber(now)}`;
    }
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  function generateFriendLeaderboard(friends, currentUser) {
    // Combine friends with current user
    const allPlayers = [
      ...friends,
      {
        id: 'self',
        username: currentUser.username || '我',
        bestScore: currentUser.bestScore || 0,
        isOnline: true,
        isSelf: true
      }
    ];

    // Sort by best score
    return allPlayers
      .sort((a, b) => b.bestScore - a.bestScore)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
        isTop3: index < 3
      }));
  }

  function checkOvertake(storage, oldRanking, newRanking) {
    const overtakeEvents = [];
    
    // Find players who improved their position
    newRanking.forEach((newPlayer, newIndex) => {
      const oldPlayer = oldRanking.find(p => p.id === newPlayer.id);
      if (oldPlayer) {
        const oldIndex = oldRanking.findIndex(p => p.id === newPlayer.id);
        if (newIndex < oldIndex) {
          // Player improved rank
          const overtakenPlayers = oldRanking
            .slice(newIndex, oldIndex)
            .filter(p => p.id !== newPlayer.id)
            .map(p => p.username);
          
          if (overtakenPlayers.length > 0) {
            overtakeEvents.push({
              player: newPlayer.username,
              overtaken: overtakenPlayers,
              newRank: newIndex + 1,
              oldRank: oldIndex + 1
            });
          }
        }
      }
    });

    return overtakeEvents;
  }

  function getLeaderboard(storage, friends, currentUser, type = 'weekly') {
    const data = loadData(storage);
    const currentPeriod = getCurrentPeriod(type);
    
    // Check if we need to reset for new period
    const savedPeriod = type === 'weekly' ? data.currentWeek : data.currentMonth;
    if (savedPeriod !== currentPeriod) {
      // New period, reset leaderboard
      if (type === 'weekly') {
        data.currentWeek = currentPeriod;
        data.weekly = [];
      } else {
        data.currentMonth = currentPeriod;
        data.monthly = [];
      }
    }

    // Generate fresh leaderboard from friends data
    const leaderboard = generateFriendLeaderboard(friends, currentUser);
    
    // Check for overtakes
    const oldLeaderboard = type === 'weekly' ? data.weekly : data.monthly;
    const overtakes = checkOvertake(storage, oldLeaderboard, leaderboard);
    
    // Save new leaderboard
    if (type === 'weekly') {
      data.weekly = leaderboard;
    } else {
      data.monthly = leaderboard;
    }
    data.lastUpdated = Date.now();
    saveData(storage, data);

    return {
      leaderboard,
      overtakes,
      period: currentPeriod,
      type
    };
  }

  function updatePlayerScore(storage, playerId, newScore, friends, currentUser, type = 'weekly') {
    // Update the player's score in the appropriate data source
    if (playerId === 'self') {
      currentUser.bestScore = Math.max(currentUser.bestScore || 0, newScore);
    } else {
      const friend = friends.find(f => f.id === playerId);
      if (friend) {
        friend.bestScore = Math.max(friend.bestScore || 0, newScore);
      }
    }

    // Regenerate leaderboard
    return getLeaderboard(storage, friends, currentUser, type);
  }

  function getTopFriends(storage, friends, currentUser, limit = 5) {
    const { leaderboard } = getLeaderboard(storage, friends, currentUser, 'weekly');
    return leaderboard.slice(0, limit);
  }

  function getPlayerRank(storage, playerId, friends, currentUser, type = 'weekly') {
    const { leaderboard } = getLeaderboard(storage, friends, currentUser, type);
    const player = leaderboard.find(p => p.id === playerId);
    return player ? player.rank : null;
  }

  function createFriendsLeaderboardModule({ storage, friendsRuntime, getCurrentUser }) {
    return {
      getLeaderboard: (type = 'weekly') => {
        const friends = friendsRuntime.getFriends();
        const currentUser = getCurrentUser();
        return getLeaderboard(storage, friends, currentUser, type);
      },
      updatePlayerScore: (playerId, newScore, type = 'weekly') => {
        const friends = friendsRuntime.getFriends();
        const currentUser = getCurrentUser();
        return updatePlayerScore(storage, playerId, newScore, friends, currentUser, type);
      },
      getTopFriends: (limit = 5) => {
        const friends = friendsRuntime.getFriends();
        const currentUser = getCurrentUser();
        return getTopFriends(storage, friends, currentUser, limit);
      },
      getPlayerRank: (playerId, type = 'weekly') => {
        const friends = friendsRuntime.getFriends();
        const currentUser = getCurrentUser();
        return getPlayerRank(storage, playerId, friends, currentUser, type);
      },
      getCurrentPeriod: (type = 'weekly') => getCurrentPeriod(type)
    };
  }

  return { createFriendsLeaderboardModule };
})();