/**
 * CALZARE Footwear Engine — High-Performance In-Memory Micro-Cache Service
 * Optimized for 1000+ RPS read throughput under high-concurrency traffic
 */

class MicroCacheService {
  constructor(maxSize = 2500, defaultTtlSeconds = 60) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtlSeconds * 1000;
    this.stats = { hits: 0, misses: 0 };
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  set(key, data, ttlSeconds) {
    // Prevent unbounded memory growth via LRU eviction of oldest inserted entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    const ttlMs = (ttlSeconds !== undefined ? ttlSeconds : this.defaultTtl / 1000) * 1000;
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  del(key) {
    return this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix or regex pattern (e.g., 'products', 'homepage', 'catalog')
   */
  invalidate(pattern) {
    const isRegex = pattern instanceof RegExp;
    const prefix = typeof pattern === 'string' ? pattern : null;

    let count = 0;
    for (const key of this.cache.keys()) {
      if ((isRegex && pattern.test(key)) || (prefix && key.startsWith(prefix))) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  flush() {
    const count = this.cache.size;
    this.cache.clear();
    return count;
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: this.stats.hits + this.stats.misses > 0
        ? ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(1) + '%'
        : '0%',
    };
  }
}

export const cacheService = new MicroCacheService(3000, 60);
