import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthRequest } from '../types';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from cookie first (more secure)
    let token = req.cookies.accessToken;

    // Fallback to Authorization header for backward compatibility
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
      return;
    }

    try {
      const decoded = verifyToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
      next();
    } catch (error) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token. Please login again.' 
      });
      return;
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
      return;
    }

    next();
  };
};
