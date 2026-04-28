import { Request, Response, NextFunction } from 'express';
import BlockedIP from '../models/BlockedIP';
import { getClientIp } from '../utils/activityLogger';

// Cache for blocked IPs to reduce database queries
const blockedIPCache = new Map<string, boolean>();
const CACHE_TTL = 60000; // 1 minute

// Refresh cache periodically
setInterval(async () => {
  try {
    const blockedIPs = await BlockedIP.find({ isActive: true }).select('ipAddress');
    blockedIPCache.clear();
    blockedIPs.forEach(ip => blockedIPCache.set(ip.ipAddress, true));
  } catch (error) {
    console.error('Failed to refresh blocked IP cache:', error);
  }
}, CACHE_TTL);

// Whitelist for IPs that should never be blocked (localhost, testing)
const WHITELISTED_IPS = [
  '127.0.0.1',
  '::1',
  '::ffff:127.0.0.1',
  'localhost'
];

export const checkBlockedIP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clientIp = getClientIp(req);

    // Skip blocking for whitelisted IPs (localhost, testing)
    if (WHITELISTED_IPS.includes(clientIp)) {
      return next();
    }

    // Check cache first
    if (blockedIPCache.has(clientIp)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Your IP address has been blocked.'
      });
      return;
    }

    // Check database if not in cache
    const blockedIP = await BlockedIP.findOne({
      ipAddress: clientIp,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    if (blockedIP) {
      // Update last attempt
      blockedIP.lastAttempt = new Date();
      await blockedIP.save();

      // Add to cache
      blockedIPCache.set(clientIp, true);

      res.status(403).json({
        success: false,
        message: 'Access denied. Your IP address has been blocked.'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('IP blocking check error:', error);
    // Don't block on error, allow request to proceed
    next();
  }
};

// Track failed login attempts per IP
const failedAttempts = new Map<string, { count: number; firstAttempt: Date }>();
const MAX_FAILED_ATTEMPTS = 10;
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

export const trackFailedLogin = async (ipAddress: string): Promise<boolean> => {
  try {
    const now = new Date();
    const attempts = failedAttempts.get(ipAddress);

    if (!attempts) {
      failedAttempts.set(ipAddress, { count: 1, firstAttempt: now });
      return false;
    }

    // Reset if outside time window
    if (now.getTime() - attempts.firstAttempt.getTime() > ATTEMPT_WINDOW) {
      failedAttempts.set(ipAddress, { count: 1, firstAttempt: now });
      return false;
    }

    // Increment count
    attempts.count++;

    // Auto-block if threshold exceeded
    if (attempts.count >= MAX_FAILED_ATTEMPTS) {
      const existingBlock = await BlockedIP.findOne({ ipAddress });
      
      if (!existingBlock) {
        await BlockedIP.create({
          ipAddress,
          reason: `Automatically blocked after ${MAX_FAILED_ATTEMPTS} failed login attempts`,
          blockedBy: null as any, // System-generated
          blockedByUsername: 'System',
          failedAttempts: attempts.count,
          autoBlocked: true,
          isActive: true,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });

        // Add to cache
        blockedIPCache.set(ipAddress, true);
        
        // Clear failed attempts
        failedAttempts.delete(ipAddress);
        
        return true; // IP was blocked
      }
    }

    return false;
  } catch (error) {
    console.error('Failed to track login attempt:', error);
    return false;
  }
};

export const clearFailedAttempts = (ipAddress: string): void => {
  failedAttempts.delete(ipAddress);
};

// Clean up old entries periodically
setInterval(() => {
  const now = new Date();
  for (const [ip, data] of failedAttempts.entries()) {
    if (now.getTime() - data.firstAttempt.getTime() > ATTEMPT_WINDOW) {
      failedAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes
