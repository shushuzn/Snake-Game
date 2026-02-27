window.SnakeStorage = (() => {
  function createStorageModule(store) {
    function readText(key, fallbackValue = '') {
      const value = store.getItem(key);
      return value === null ? fallbackValue : value;
    }

    function writeText(key, value) {
      store.setItem(key, String(value));
    }

    function readJson(key, fallbackValue) {
      try {
        const raw = store.getItem(key);
        if (!raw) return fallbackValue;
        const parsed = JSON.parse(raw);
        return parsed ?? fallbackValue;
      } catch {
        return fallbackValue;
      }
    }

    function writeJson(key, value) {
      store.setItem(key, JSON.stringify(value));
    }

    function remove(key) {
      store.removeItem(key);
    }

    function removeMany(keys = []) {
      for (const key of keys) store.removeItem(key);
    }

    function captureSnapshot(keys = []) {
      if (!keys.length) return {};
      const snapshot = {};
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = store.getItem(key);
        if (value !== null) snapshot[key] = value;
      }
      return snapshot;
    }

    function applySnapshot(keys = [], snapshot = {}) {
      if (!keys.length || !snapshot) return;
      const keySet = new Set(keys);
      removeMany(keys);
      for (const [key, value] of Object.entries(snapshot)) {
        if (keySet.has(key) && typeof value === 'string') store.setItem(key, value);
      }
    }

    return {
      readText,
      writeText,
      readJson,
      writeJson,
      remove,
      removeMany,
      captureSnapshot,
      applySnapshot
    };
  }

  return { createStorageModule };
})();
