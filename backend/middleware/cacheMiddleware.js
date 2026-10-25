import { cacheService } from '../services/cacheService.js';

/**
 * Cache middleware with CDN edge headers for high-concurrency read operations
 * @param {number} ttlSeconds - Duration to cache in memory
 * @param {number} cdnMaxAge - Browser max-age in seconds
 * @param {number} cdnSMaxAge - CDN/Proxy s-maxage in seconds
 */
export const cacheResponse = (ttlSeconds = 60, cdnMaxAge = 30, cdnSMaxAge = 120) => {
  return (req, res, next) => {
    // Only cache safe idempotent GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Bypass cache if user is an admin/staff or explicitly requested bypass
    if (req.headers['x-bypass-cache'] === 'true' || req.user?.role === 'admin' || req.user?.role === 'superadmin') {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      return next();
    }

    const cacheKey = `${req.baseUrl}${req.path}:${JSON.stringify(req.query)}`;
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', `public, max-age=${cdnMaxAge}, s-maxage=${cdnSMaxAge}, stale-while-revalidate=300`);
      return res.json(cachedData);
    }

    // Cache MISS: intercept res.json
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', `public, max-age=${cdnMaxAge}, s-maxage=${cdnSMaxAge}, stale-while-revalidate=300`);

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache successful 200 responses
      if (res.statusCode === 200 && body && body.success !== false) {
        cacheService.set(cacheKey, body, ttlSeconds);
      }
      return originalJson(body);
    };

    next();
  };
};

/**
 * Invalidate cache tags/prefixes when mutations occur
 */
export const invalidateCache = (...prefixes) => {
  prefixes.forEach((prefix) => cacheService.invalidate(prefix));
};
