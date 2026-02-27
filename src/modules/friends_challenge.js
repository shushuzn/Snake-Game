/**
 * Friends Challenge Mode
 * 好友挑战模式
 *
 * Features:
 * - Challenge friends to beat your score
 * - Accept/reject challenges
 * - Challenge history and win rate tracking
 * - Challenge rewards (exp bonus)
 */

window.SnakeFriendsChallenge = (() => {
  const STORAGE_KEY = 'snake-friends-challenges';
  const CHALLENGE_REWARD_EXP = 50;

  function loadChallenges(storage) {
    return storage.readJson(STORAGE_KEY, {
      active: [],
      history: [],
      stats: {
        totalChallenges: 0,
        wins: 0,
        losses: 0
      }
    });
  }

  function saveChallenges(storage, data) {
    storage.writeJson(STORAGE_KEY, data);
  }

  function generateChallengeId() {
    return 'C' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  function createChallenge(storage, challengerId, targetId, mode, challengerScore) {
    const challenges = loadChallenges(storage);
    
    // Check if there's already an active challenge between these players
    const existingActive = challenges.active.find(c => 
      (c.challengerId === challengerId && c.targetId === targetId) ||
      (c.challengerId === targetId && c.targetId === challengerId)
    );
    
    if (existingActive) {
      return { success: false, message: '已有进行中的挑战' };
    }

    const challenge = {
      id: generateChallengeId(),
      challengerId,
      targetId,
      mode: mode || 'classic',
      challengerScore: challengerScore || 0,
      targetScore: null,
      status: 'pending', // pending, accepted, completed, declined
      createdAt: Date.now(),
      completedAt: null,
      winnerId: null
    };

    challenges.active.push(challenge);
    challenges.stats.totalChallenges++;
    saveChallenges(storage, challenges);

    return { success: true, challenge, message: '挑战发起成功' };
  }

  function acceptChallenge(storage, challengeId) {
    const challenges = loadChallenges(storage);
    const challenge = challenges.active.find(c => c.id === challengeId);

    if (!challenge) {
      return { success: false, message: '挑战不存在' };
    }

    if (challenge.status !== 'pending') {
      return { success: false, message: '挑战已处理' };
    }

    challenge.status = 'accepted';
    challenge.acceptedAt = Date.now();
    saveChallenges(storage, challenges);

    return { success: true, challenge, message: '已接受挑战' };
  }

  function declineChallenge(storage, challengeId) {
    const challenges = loadChallenges(storage);
    const index = challenges.active.findIndex(c => c.id === challengeId);

    if (index === -1) {
      return { success: false, message: '挑战不存在' };
    }

    const challenge = challenges.active[index];
    challenge.status = 'declined';
    challenge.completedAt = Date.now();

    // Move to history
    challenges.history.push(challenge);
    challenges.active.splice(index, 1);
    saveChallenges(storage, challenges);

    return { success: true, message: '已拒绝挑战' };
  }

  function completeChallenge(storage, challengeId, targetScore) {
    const challenges = loadChallenges(storage);
    const index = challenges.active.findIndex(c => c.id === challengeId);

    if (index === -1) {
      return { success: false, message: '挑战不存在' };
    }

    const challenge = challenges.active[index];
    challenge.targetScore = targetScore;
    challenge.status = 'completed';
    challenge.completedAt = Date.now();

    // Determine winner
    if (targetScore > challenge.challengerScore) {
      challenge.winnerId = challenge.targetId;
      challenges.stats.losses++; // Challenger lost
    } else if (targetScore < challenge.challengerScore) {
      challenge.winnerId = challenge.challengerId;
      challenges.stats.wins++; // Challenger won
    } else {
      // Tie - no winner
      challenge.winnerId = null;
    }

    // Move to history
    challenges.history.push(challenge);
    challenges.active.splice(index, 1);
    saveChallenges(storage, challenges);

    const result = {
      success: true,
      challenge,
      isWinner: challenge.winnerId === challenge.targetId,
      isTie: challenge.winnerId === null,
      message: challenge.winnerId === challenge.targetId ? '恭喜！你赢得了挑战！' : 
               challenge.winnerId === null ? '平局！' : '很遗憾，你输了挑战'
    };

    return result;
  }

  function getActiveChallenges(storage, playerId) {
    const challenges = loadChallenges(storage);
    return challenges.active.filter(c => 
      c.challengerId === playerId || c.targetId === playerId
    );
  }

  function getPendingChallengesForPlayer(storage, playerId) {
    const challenges = loadChallenges(storage);
    return challenges.active.filter(c => 
      c.targetId === playerId && c.status === 'pending'
    );
  }

  function getChallengeHistory(storage, playerId, limit = 10) {
    const challenges = loadChallenges(storage);
    return challenges.history
      .filter(c => c.challengerId === playerId || c.targetId === playerId)
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, limit);
  }

  function getChallengeStats(storage) {
    const challenges = loadChallenges(storage);
    const stats = challenges.stats;
    return {
      ...stats,
      winRate: stats.totalChallenges > 0 ? (stats.wins / stats.totalChallenges * 100).toFixed(1) : 0
    };
  }

  function claimChallengeReward(storage, challengeId) {
    const challenges = loadChallenges(storage);
    const challenge = challenges.history.find(c => c.id === challengeId);

    if (!challenge) {
      return { success: false, message: '挑战不存在' };
    }

    if (challenge.rewardClaimed) {
      return { success: false, message: '奖励已领取' };
    }

    if (challenge.winnerId !== challenge.targetId) {
      return { success: false, message: '未赢得挑战，无法领取奖励' };
    }

    challenge.rewardClaimed = true;
    saveChallenges(storage, challenges);

    return {
      success: true,
      reward: {
        exp: CHALLENGE_REWARD_EXP
      },
      message: `获得 ${CHALLENGE_REWARD_EXP} 经验值奖励！`
    };
  }

  function createFriendsChallengeModule({ storage, getCurrentPlayerId }) {
    return {
      createChallenge: (targetId, mode, score) => createChallenge(storage, getCurrentPlayerId(), targetId, mode, score),
      acceptChallenge: (challengeId) => acceptChallenge(storage, challengeId),
      declineChallenge: (challengeId) => declineChallenge(storage, challengeId),
      completeChallenge: (challengeId, score) => completeChallenge(storage, challengeId, score),
      getActiveChallenges: () => getActiveChallenges(storage, getCurrentPlayerId()),
      getPendingChallenges: () => getPendingChallengesForPlayer(storage, getCurrentPlayerId()),
      getChallengeHistory: (limit) => getChallengeHistory(storage, getCurrentPlayerId(), limit),
      getChallengeStats: () => getChallengeStats(storage),
      claimReward: (challengeId) => claimChallengeReward(storage, challengeId),
      CHALLENGE_REWARD_EXP
    };
  }

  return { createFriendsChallengeModule };
})();