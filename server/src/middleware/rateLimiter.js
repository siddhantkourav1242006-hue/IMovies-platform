/**
 * iMovies - Rate Limiter Middleware
 * Prevents abuse by limiting request rates per IP
 */
const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter — 100 requests per 15 minutes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

/**
 * Auth rate limiter — 20 requests per 15 minutes (stricter for login/register)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
});

/**
 * Booking rate limiter — 10 requests per 5 minutes
 */
const bookingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many booking attempts, please try again shortly.',
  },
});

module.exports = { generalLimiter, apiLimiter: generalLimiter, authLimiter, bookingLimiter };
