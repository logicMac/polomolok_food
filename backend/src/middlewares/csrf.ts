import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Store for CSRF tokens (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Clean up expired tokens every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expires < now) {
      csrfTokens.delete(key);
    }
  }
}, 10 * 60 * 1000);

export const generateCsrfToken = (req: Request, res: Response): string => {
  const token = crypto.randomBytes(32).toString('hex');
  const sessionId = req.headers['x-session-id'] as string || crypto.randomBytes(16).toString('hex');
  
  // Store token with 1 hour expiration
  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + 60 * 60 * 1000 // 1 hour
  });

  // Set session ID in cookie
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000 // 1 hour
  });

  return token;
};

export const verifyCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const sessionId = req.cookies.sessionId;
  const csrfToken = req.headers['x-csrf-token'] as string;

  if (!sessionId || !csrfToken) {
    res.status(403).json({
      success: false,
      message: 'CSRF token missing'
    });
    return;
  }

  const storedToken = csrfTokens.get(sessionId);

  if (!storedToken) {
    res.status(403).json({
      success: false,
      message: 'Invalid session'
    });
    return;
  }

  if (storedToken.expires < Date.now()) {
    csrfTokens.delete(sessionId);
    res.status(403).json({
      success: false,
      message: 'CSRF token expired'
    });
    return;
  }

  if (storedToken.token !== csrfToken) {
    res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
    return;
  }

  next();
};

export const getCsrfToken = (req: Request, res: Response): void => {
  const token = generateCsrfToken(req, res);
  res.status(200).json({
    success: true,
    csrfToken: token
  });
};
