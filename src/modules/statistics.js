/**
 * Game Statistics Panel
 * 游戏统计面板
 *
 * Features:
 * - Detailed game data analysis
 * - Win rate, average score, highest combo
 * - Mode preference analysis
 * - Time period analysis
 * - Trend charts
 */

window.SnakeStatistics = (() => {
  const STORAGE_KEY = 'snake-game-statistics';

  function loadStats(storage) {
    return storage.readJson(STORAGE_KEY, {
      totalGames: 0,
      wins: 0,
      losses: 0,
      totalScore: 0,
      bestScore: 0,
      highestCombo: 0,
      totalPlayTime: 0, // in seconds
      modeStats: {},
      dailyStats: {},
      hourlyStats: {},
      recentGames: []
    });
  }

  function saveStats(storage, stats) {
    storage.writeJson(STORAGE_KEY, stats);
  }

  function recordGame(storage, gameData) {
    const stats = loadStats(storage);
    
    // Update basic stats
    stats.totalGames++;
    stats.totalScore += gameData.score || 0;
    stats.totalPlayTime += gameData.duration || 0;
    
    if (gameData.score > stats.bestScore) {
      stats.bestScore = gameData.score;
    }
    
    if (gameData.combo > stats.highestCombo) {
      stats.highestCombo = gameData.combo;
    }
    
    // Update mode stats
    const mode = gameData.mode || 'classic';
    if (!stats.modeStats[mode]) {
      stats.modeStats[mode] = {
        games: 0,
        wins: 0,
        totalScore: 0,
        bestScore: 0
      };
    }
    stats.modeStats[mode].games++;
    stats.modeStats[mode].totalScore += gameData.score || 0;
    if (gameData.score > stats.modeStats[mode].bestScore) {
      stats.modeStats[mode].bestScore = gameData.score;
    }
    
    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    if (!stats.dailyStats[today]) {
      stats.dailyStats[today] = { games: 0, score: 0 };
    }
    stats.dailyStats[today].games++;
    stats.dailyStats[today].score += gameData.score || 0;
    
    // Update hourly stats
    const hour = new Date().getHours();
    if (!stats.hourlyStats[hour]) {
      stats.hourlyStats[hour] = { games: 0, score: 0 };
    }
    stats.hourlyStats[hour].games++;
    stats.hourlyStats[hour].score += gameData.score || 0;
    
    // Add to recent games (keep last 50)
    stats.recentGames.unshift({
      date: Date.now(),
      mode: gameData.mode,
      score: gameData.score,
      duration: gameData.duration,
      combo: gameData.combo,
      result: gameData.result
    });
    stats.recentGames = stats.recentGames.slice(0, 50);
    
    saveStats(storage, stats);
    return stats;
  }

  function getOverallStats(storage) {
    const stats = loadStats(storage);
    return {
      totalGames: stats.totalGames,
      winRate: stats.totalGames > 0 ? (stats.wins / stats.totalGames * 100).toFixed(1) : 0,
      averageScore: stats.totalGames > 0 ? Math.round(stats.totalScore / stats.totalGames) : 0,
      bestScore: stats.bestScore,
      highestCombo: stats.highestCombo,
      totalPlayTime: formatDuration(stats.totalPlayTime),
      averagePlayTime: stats.totalGames > 0 ? formatDuration(Math.round(stats.totalPlayTime / stats.totalGames)) : '0:00'
    };
  }

  function getModeStats(storage) {
    const stats = loadStats(storage);
    return Object.entries(stats.modeStats)
      .map(([mode, data]) => ({
        mode,
        games: data.games,
        percentage: stats.totalGames > 0 ? (data.games / stats.totalGames * 100).toFixed(1) : 0,
        averageScore: data.games > 0 ? Math.round(data.totalScore / data.games) : 0,
        bestScore: data.bestScore
      }))
      .sort((a, b) => b.games - a.games);
  }

  function getBestTimeOfDay(storage) {
    const stats = loadStats(storage);
    const hourlyData = Object.entries(stats.hourlyStats)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        games: data.games,
        averageScore: data.games > 0 ? Math.round(data.score / data.games) : 0
      }))
      .sort((a, b) => b.averageScore - a.averageScore);
    
    return hourlyData[0] || null;
  }

  function getScoreTrend(storage, days = 7) {
    const stats = loadStats(storage);
    const today = new Date();
    const trend = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayStats = stats.dailyStats[dateStr];
      
      trend.push({
        date: dateStr,
        games: dayStats?.games || 0,
        score: dayStats?.score || 0,
        average: dayStats?.games > 0 ? Math.round(dayStats.score / dayStats.games) : 0
      });
    }
    
    return trend;
  }

  function getRecentGames(storage, limit = 10) {
    const stats = loadStats(storage);
    return stats.recentGames.slice(0, limit);
  }

  function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}:${String(mins).padStart(2, '0')}`;
    }
    return `${mins}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function clearStats(storage) {
    saveStats(storage, {
      totalGames: 0,
      wins: 0,
      losses: 0,
      totalScore: 0,
      bestScore: 0,
      highestCombo: 0,
      totalPlayTime: 0,
      modeStats: {},
      dailyStats: {},
      hourlyStats: {},
      recentGames: []
    });
  }

  function createStatisticsModule({ storage }) {
    return {
      recordGame: (gameData) => recordGame(storage, gameData),
      getOverallStats: () => getOverallStats(storage),
      getModeStats: () => getModeStats(storage),
      getBestTimeOfDay: () => getBestTimeOfDay(storage),
      getScoreTrend: (days) => getScoreTrend(storage, days),
      getRecentGames: (limit) => getRecentGames(storage, limit),
      clearStats: () => clearStats(storage)
    };
  }

  return { createStatisticsModule };
})();