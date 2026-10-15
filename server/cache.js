class MemoryCache {
  constructor(ttlSeconds = 300) {
    this.cache = new Map();
    this.ttl = ttlSeconds * 1000;
    this.interval = setInterval(() => this.cleanup(), 60000);
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttl) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttl || this.ttl),
    });
  }

  delete(key) {
    this.cache.delete(key);
  }

  flush() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expiry) this.cache.delete(key);
    }
  }

  destroy() {
    clearInterval(this.interval);
    this.cache.clear();
  }
}

module.exports = { MemoryCache };
