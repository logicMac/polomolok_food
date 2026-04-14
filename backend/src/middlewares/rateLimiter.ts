import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs (increased for development)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs (increased for development)
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP verification limiter
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 OTP attempts (increased for development)
  message: {
    success: false,
    message: 'Too many OTP verification attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Order creation rate limiter
export const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // Limit each IP to 50 orders per 10 minutes (increased for development)
  message: {
    success: false,
    message: 'Too many orders placed. Please wait before placing another order.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Food creation/update rate limiter (admin)
export const foodManagementLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 food operations per 5 minutes (increased for development)
  message: {
    success: false,
    message: 'Too many food management operations. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // Limit each IP to 50 uploads per 10 minutes (increased for development)
  message: {
    success: false,
    message: 'Too many file uploads. Please wait before uploading again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
