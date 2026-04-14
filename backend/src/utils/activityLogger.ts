import { Request } from 'express';
import ActivityLog from '../models/ActivityLog';
import { AuthRequest } from '../types';

// Parse user agent to extract device and browser info
const parseUserAgent = (userAgent: string): { device: string; browser: string } => {
  let device = 'Unknown';
  let browser = 'Unknown';

  if (!userAgent) {
    return { device, browser };
  }

  // Detect device
  if (/mobile/i.test(userAgent)) {
    device = 'Mobile';
  } else if (/tablet/i.test(userAgent)) {
    device = 'Tablet';
  } else {
    device = 'Desktop';
  }

  // Detect browser
  if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/firefox/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/edg/i.test(userAgent)) {
    browser = 'Edge';
  } else if (/opera|opr/i.test(userAgent)) {
    browser = 'Opera';
  }

  return { device, browser };
};

// Get client IP address
export const getClientIp = (req: Request): string => {
  // Try multiple headers in order of preference
  const forwarded = req.headers['x-forwarded-for'] as string | undefined;
  const realIp = req.headers['x-real-ip'] as string | undefined;
  const cfConnectingIp = req.headers['cf-connecting-ip'] as string | undefined; // Cloudflare
  const trueClientIp = req.headers['true-client-ip'] as string | undefined; // Akamai/Cloudflare
  
  // X-Forwarded-For can contain multiple IPs, get the first one (client IP)
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    if (ips[0]) return ips[0];
  }
  
  // Try other headers
  if (cfConnectingIp) return cfConnectingIp;
  if (trueClientIp) return trueClientIp;
  if (realIp) return realIp;
  
  // Fallback to socket remote address
  const socketIp = req.socket.remoteAddress || (req as any).connection?.remoteAddress || '';
  
  // Clean up IPv6 localhost to IPv4
  if (socketIp === '::1' || socketIp === '::ffff:127.0.0.1') {
    return '127.0.0.1';
  }
  
  // Remove IPv6 prefix if present
  if (socketIp && socketIp.startsWith('::ffff:')) {
    return socketIp.substring(7);
  }
  
  return socketIp || 'unknown';
};

interface LogActivityParams {
  req: Request | AuthRequest;
  action: string;
  actionType: 'auth' | 'crud' | 'system' | 'security' | 'permission';
  status: 'success' | 'failure' | 'warning';
  resource?: string;
  resourceId?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export const logActivity = async (params: LogActivityParams): Promise<void> => {
  try {
    const { req, action, actionType, status, resource, resourceId, errorMessage, metadata } = params;
    
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const { device, browser } = parseUserAgent(userAgent);
    
    const authReq = req as AuthRequest;
    
    const logEntry = new ActivityLog({
      userId: authReq.user?.userId,
      username: authReq.user?.email?.split('@')[0],
      email: authReq.user?.email,
      ipAddress,
      userAgent,
      device,
      browser,
      action,
      actionType,
      resource,
      resourceId,
      status,
      method: req.method,
      endpoint: req.originalUrl || req.url,
      statusCode: (req as any).statusCode,
      errorMessage,
      metadata,
      timestamp: new Date()
    });

    await logEntry.save();
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw error to prevent disrupting main application flow
  }
};

// Specific logging functions for common actions
export const logAuth = {
  login: (req: Request, email: string, status: 'success' | 'failure', errorMessage?: string) =>
    logActivity({
      req,
      action: `User login ${status}`,
      actionType: 'auth',
      status,
      metadata: { email },
      errorMessage
    }),

  logout: (req: AuthRequest) =>
    logActivity({
      req,
      action: 'User logout',
      actionType: 'auth',
      status: 'success'
    }),

  register: (req: Request, email: string, status: 'success' | 'failure', errorMessage?: string) =>
    logActivity({
      req,
      action: `User registration ${status}`,
      actionType: 'auth',
      status,
      metadata: { email },
      errorMessage
    }),

  otpSent: (req: Request, email: string) =>
    logActivity({
      req,
      action: 'OTP sent',
      actionType: 'auth',
      status: 'success',
      metadata: { email }
    }),

  otpVerified: (req: Request, email: string, status: 'success' | 'failure') =>
    logActivity({
      req,
      action: `OTP verification ${status}`,
      actionType: 'auth',
      status,
      metadata: { email }
    }),

  accountLocked: (req: Request, email: string) =>
    logActivity({
      req,
      action: 'Account locked due to failed attempts',
      actionType: 'security',
      status: 'warning',
      metadata: { email }
    })
};

export const logCRUD = {
  create: (req: AuthRequest, resource: string, resourceId: string, status: 'success' | 'failure', errorMessage?: string) =>
    logActivity({
      req,
      action: `Created ${resource}`,
      actionType: 'crud',
      status,
      resource,
      resourceId,
      errorMessage
    }),

  update: (req: AuthRequest, resource: string, resourceId: string, status: 'success' | 'failure', errorMessage?: string) =>
    logActivity({
      req,
      action: `Updated ${resource}`,
      actionType: 'crud',
      status,
      resource,
      resourceId,
      errorMessage
    }),

  delete: (req: AuthRequest, resource: string, resourceId: string, status: 'success' | 'failure', errorMessage?: string) =>
    logActivity({
      req,
      action: `Deleted ${resource}`,
      actionType: 'crud',
      status,
      resource,
      resourceId,
      errorMessage
    }),

  read: (req: AuthRequest, resource: string, resourceId?: string) =>
    logActivity({
      req,
      action: `Viewed ${resource}`,
      actionType: 'crud',
      status: 'success',
      resource,
      resourceId
    })
};

export const logSecurity = {
  suspiciousActivity: (req: Request, description: string, metadata?: Record<string, any>) =>
    logActivity({
      req,
      action: `Suspicious activity: ${description}`,
      actionType: 'security',
      status: 'warning',
      metadata
    }),

  ipBlocked: (req: AuthRequest, ipAddress: string, reason: string) =>
    logActivity({
      req,
      action: `IP address blocked: ${ipAddress}`,
      actionType: 'security',
      status: 'success',
      metadata: { blockedIp: ipAddress, reason }
    }),

  ipUnblocked: (req: AuthRequest, ipAddress: string) =>
    logActivity({
      req,
      action: `IP address unblocked: ${ipAddress}`,
      actionType: 'security',
      status: 'success',
      metadata: { unblockedIp: ipAddress }
    }),

  unauthorizedAccess: (req: Request, resource: string) =>
    logActivity({
      req,
      action: `Unauthorized access attempt to ${resource}`,
      actionType: 'security',
      status: 'failure',
      resource
    })
};

export const logPermission = {
  roleChanged: (req: AuthRequest, targetUserId: string, oldRole: string, newRole: string) =>
    logActivity({
      req,
      action: `User role changed from ${oldRole} to ${newRole}`,
      actionType: 'permission',
      status: 'success',
      resource: 'user',
      resourceId: targetUserId,
      metadata: { oldRole, newRole }
    })
};
