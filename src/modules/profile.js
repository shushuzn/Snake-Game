/**
 * Profile Page
 * 个人资料页面
 *
 * Features:
 * - Display achievements, stats, game history
 * - Customizable username/avatar
 * - Comprehensive player overview
 */

window.SnakeProfile = (() => {
  const STORAGE_KEY = 'snake-player-profile';

  function loadProfile(storage) {
    return storage.readJson(STORAGE_KEY, {
      username: '',
      bio: '',
      createdAt: Date.now(),
      totalPlayTime: 0,
      favoriteMode: 'classic'
    });
  }

  function saveProfile(storage, profile) {
    storage.writeJson(STORAGE_KEY, profile);
  }

  function updateUsername(storage, username) {
    if (!username || username.trim().length < 2) {
      return { success: false, message: '用户名至少需要2个字符' };
    }
    
    const profile = loadProfile(storage);
    profile.username = username.trim();
    saveProfile(storage, profile);
    
    return { success: true, message: '用户名更新成功' };
  }

  function updateBio(storage, bio) {
    const profile = loadProfile(storage);
    profile.bio = bio.trim().slice(0, 100);
    saveProfile(storage, profile);
    
    return { success: true, message: '个人简介更新成功' };
  }

  function getProfile(storage) {
    return loadProfile(storage);
  }

  function getDisplayName(storage, activeAccount) {
    const profile = loadProfile(storage);
    return profile.username || activeAccount || '玩家';
  }

  function createProfileModule({ storage, getActiveAccount }) {
    return {
      updateUsername: (username) => updateUsername(storage, username),
      updateBio: (bio) => updateBio(storage, bio),
      getProfile: () => getProfile(storage),
      getDisplayName: () => getDisplayName(storage, getActiveAccount())
    };
  }

  return { createProfileModule };
})();