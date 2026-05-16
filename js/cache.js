const cache = (() => {
  const DEFAULT_TTL = {
    massage_types: 3600,
    clients: 300,
    sessions: 60,
  };

  function _storageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn('[cache] localStorage quota exceeded, clearing stale entries');
        _evictExpired();
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (_) {
          console.error('[cache] localStorage full after eviction, write skipped');
          return false;
        }
      }
      console.error('[cache] localStorage write error:', e);
      return false;
    }
  }

  function _evictExpired() {
    const now = Date.now();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith('crm:')) continue;
      try {
        const entry = JSON.parse(localStorage.getItem(k));
        if (!entry || entry.expires < now) localStorage.removeItem(k);
      } catch (_) {
        localStorage.removeItem(k);
      }
    }
  }

  function get(key) {
    try {
      const raw = localStorage.getItem(`crm:${key}`);
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (Date.now() > entry.expires) {
        localStorage.removeItem(`crm:${key}`);
        return null;
      }
      return entry.data;
    } catch (e) {
      console.error('[cache] get error:', e);
      return null;
    }
  }

  function set(key, data, ttlSeconds) {
    const ttl = (ttlSeconds ?? DEFAULT_TTL[key] ?? 300) * 1000;
    return _storageSet(`crm:${key}`, { data, expires: Date.now() + ttl });
  }

  function invalidate(key) {
    try {
      localStorage.removeItem(`crm:${key}`);
    } catch (e) {
      console.error('[cache] invalidate error:', e);
    }
  }

  function invalidatePattern(prefix) {
    try {
      const fullPrefix = `crm:${prefix}`;
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(fullPrefix)) localStorage.removeItem(k);
      }
    } catch (e) {
      console.error('[cache] invalidatePattern error:', e);
    }
  }

  return { get, set, invalidate, invalidatePattern };
})();
