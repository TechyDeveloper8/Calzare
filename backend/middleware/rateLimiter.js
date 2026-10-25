import rateLimit from 'express-rate-limit';

// Strict limiter for authentication endpoints (prevent brute-force password attempts)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40, // Up to 40 attempts per 15 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// Dedicated limiter for checkout & payment initiation (prevent payment gateway spam / card testing)
export const checkoutLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'High checkout traffic detected. Please wait a moment before trying again.',
  },
});

// Form spam limiter (newsletter & contact inquiries)
export const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Submission limit reached. Please try again later.',
  },
});

// High-capacity storefront API limiter: allows high concurrency for legitimate browsing
export const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3000, // 3,000 requests per 5 minutes per IP (10 req/sec per user)
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for internal health checks
    return req.path === '/health' || req.path === '/api/health';
  },
  message: {
    success: false,
    message: 'Rate limit exceeded. Please slow down your requests.',
  },
});
