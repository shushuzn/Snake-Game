/**
 * Friends System
 * 好友系统
 *
 * Features:
 * - Add/remove friends
 * - Friend list with online status
 * - Friend search by username/ID
 * - Friend requests
 */

window.SnakeFriends = (() => {
  const STORAGE_KEY = 'snake-friends';
  const REQUESTS_KEY = 'snake-friend-requests';

  function loadFriends(storage) {
    return storage.readJson(STORAGE_KEY, []);
  }

  function saveFriends(storage, friends) {
    storage.writeJson(STORAGE_KEY, friends);
  }

  function loadRequests(storage) {
    return storage.readJson(REQUESTS_KEY, []);
  }

  function saveRequests(storage, requests) {
    storage.writeJson(REQUESTS_KEY, requests);
  }

  function generateFriendId() {
    return 'F' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  function addFriend(storage, username) {
    if (!username || username.trim().length < 2) {
      return { success: false, message: '用户名至少需要2个字符' };
    }

    const friends = loadFriends(storage);
    const trimmedUsername = username.trim();

    // Check if already friends
    if (friends.some(f => f.username.toLowerCase() === trimmedUsername.toLowerCase())) {
      return { success: false, message: '该用户已在好友列表中' };
    }

    // Check if adding self (in a real app, we'd compare with current user's username)
    // For now, we'll just add the friend

    const newFriend = {
      id: generateFriendId(),
      username: trimmedUsername,
      addedAt: Date.now(),
      lastActive: Date.now(),
      isOnline: false,
      bestScore: 0
    };

    friends.push(newFriend);
    saveFriends(storage, friends);

    return { success: true, friend: newFriend, message: '添加好友成功' };
  }

  function removeFriend(storage, friendId) {
    const friends = loadFriends(storage);
    const index = friends.findIndex(f => f.id === friendId);

    if (index === -1) {
      return { success: false, message: '好友不存在' };
    }

    const removed = friends.splice(index, 1)[0];
    saveFriends(storage, friends);

    return { success: true, friend: removed, message: '删除好友成功' };
  }

  function getFriends(storage) {
    return loadFriends(storage);
  }

  function searchFriends(storage, query) {
    const friends = loadFriends(storage);
    const trimmedQuery = query.trim().toLowerCase();

    if (!trimmedQuery) return friends;

    return friends.filter(f =>
      f.username.toLowerCase().includes(trimmedQuery) ||
      f.id.toLowerCase().includes(trimmedQuery)
    );
  }

  function updateFriendActivity(storage, friendId, score) {
    const friends = loadFriends(storage);
    const friend = friends.find(f => f.id === friendId);

    if (!friend) return false;

    friend.lastActive = Date.now();
    friend.isOnline = true;
    if (score > friend.bestScore) {
      friend.bestScore = score;
    }

    saveFriends(storage, friends);
    return true;
  }

  function setFriendOffline(storage, friendId) {
    const friends = loadFriends(storage);
    const friend = friends.find(f => f.id === friendId);

    if (!friend) return false;

    friend.isOnline = false;
    saveFriends(storage, friends);
    return true;
  }

  function getOnlineFriends(storage) {
    const friends = loadFriends(storage);
    return friends.filter(f => f.isOnline);
  }

  function getRecentFriends(storage, limit = 5) {
    const friends = loadFriends(storage);
    return friends
      .sort((a, b) => b.lastActive - a.lastActive)
      .slice(0, limit);
  }

  function sendFriendRequest(storage, targetUsername) {
    // In a real app, this would send a request to another user
    // For this local implementation, we'll just add them directly
    return addFriend(storage, targetUsername);
  }

  function createFriendsModule({ storage }) {
    return {
      addFriend: (username) => addFriend(storage, username),
      removeFriend: (friendId) => removeFriend(storage, friendId),
      getFriends: () => getFriends(storage),
      searchFriends: (query) => searchFriends(storage, query),
      updateFriendActivity: (friendId, score) => updateFriendActivity(storage, friendId, score),
      setFriendOffline: (friendId) => setFriendOffline(storage, friendId),
      getOnlineFriends: () => getOnlineFriends(storage),
      getRecentFriends: (limit) => getRecentFriends(storage, limit),
      sendFriendRequest: (username) => sendFriendRequest(storage, username)
    };
  }

  return { createFriendsModule };
})();