import { Response } from 'express';
import ActivityLog from '../models/ActivityLog';
import BlockedIP from '../models/BlockedIP';
import { AuthRequest } from '../types';
import { logSecurity } from '../utils/activityLogger';
import { getClientIp } from '../utils/activityLogger';

// Get all activity logs with filtering and pagination
export const getActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 50,
      userId,
      username,
      ipAddress,
      actionType,
      status,
      startDate,
      endDate,
      search
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = {};

    if (userId) filter.userId = userId;
    if (username) filter.username = new RegExp(username as string, 'i');
    if (ipAddress) filter.ipAddress = ipAddress;
    if (actionType) filter.actionType = actionType;
    if (status) filter.status = status;

    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate as string);
      if (endDate) filter.timestamp.$lte = new Date(endDate as string);
    }

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { action: new RegExp(search as string, 'i') },
        { username: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') },
        { ipAddress: new RegExp(search as string, 'i') }
      ];
    }

    // Get logs with pagination
    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ActivityLog.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error: any) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs'
    });
  }
};

// Get activity log statistics
export const getActivityStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate as string);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate as string);
    }

    const [
      totalLogs,
      successCount,
      failureCount,
      warningCount,
      authLogs,
      crudLogs,
      securityLogs,
      recentLogs,
      topUsers,
      topIPs
    ] = await Promise.all([
      ActivityLog.countDocuments(dateFilter),
      ActivityLog.countDocuments({ ...dateFilter, status: 'success' }),
      ActivityLog.countDocuments({ ...dateFilter, status: 'failure' }),
      ActivityLog.countDocuments({ ...dateFilter, status: 'warning' }),
      ActivityLog.countDocuments({ ...dateFilter, actionType: 'auth' }),
      ActivityLog.countDocuments({ ...dateFilter, actionType: 'crud' }),
      ActivityLog.countDocuments({ ...dateFilter, actionType: 'security' }),
      ActivityLog.find(dateFilter).sort({ timestamp: -1 }).limit(10).lean(),
      ActivityLog.aggregate([
        { $match: { ...dateFilter, userId: { $exists: true } } },
        { $group: { _id: '$username', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      ActivityLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$ipAddress', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total: totalLogs,
          success: successCount,
          failure: failureCount,
          warning: warningCount
        },
        byType: {
          auth: authLogs,
          crud: crudLogs,
          security: securityLogs
        },
        recentLogs,
        topUsers,
        topIPs
      }
    });
  } catch (error: any) {
    console.error('Get activity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity statistics'
    });
  }
};

// Get all blocked IPs
export const getBlockedIPs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 50, isActive, search } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.ipAddress = new RegExp(search as string, 'i');

    const [blockedIPs, total] = await Promise.all([
      BlockedIP.find(filter)
        .populate('blockedBy', 'name email')
        .sort({ blockedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BlockedIP.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        blockedIPs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error: any) {
    console.error('Get blocked IPs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blocked IPs'
    });
  }
};

// Block an IP address
export const blockIP = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ipAddress, reason, duration } = req.body;

    if (!ipAddress || !reason) {
      res.status(400).json({
        success: false,
        message: 'IP address and reason are required'
      });
      return;
    }

    // Check if IP is already blocked
    const existingBlock = await BlockedIP.findOne({ ipAddress, isActive: true });
    if (existingBlock) {
      res.status(400).json({
        success: false,
        message: 'IP address is already blocked'
      });
      return;
    }

    // Calculate expiration if duration provided (in hours)
    let expiresAt;
    if (duration && duration > 0) {
      expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);
    }

    const blockedIP = await BlockedIP.create({
      ipAddress,
      reason,
      blockedBy: req.user!.userId,
      blockedByUsername: req.user!.email.split('@')[0],
      autoBlocked: false,
      isActive: true,
      expiresAt
    });

    // Log the action
    await logSecurity.ipBlocked(req, ipAddress, reason);

    res.status(201).json({
      success: true,
      message: 'IP address blocked successfully',
      data: blockedIP
    });
  } catch (error: any) {
    console.error('Block IP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block IP address'
    });
  }
};

// Unblock an IP address
export const unblockIP = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const blockedIP = await BlockedIP.findById(id);
    if (!blockedIP) {
      res.status(404).json({
        success: false,
        message: 'Blocked IP not found'
      });
      return;
    }

    blockedIP.isActive = false;
    await blockedIP.save();

    // Log the action
    await logSecurity.ipUnblocked(req, blockedIP.ipAddress);

    res.status(200).json({
      success: true,
      message: 'IP address unblocked successfully'
    });
  } catch (error: any) {
    console.error('Unblock IP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock IP address'
    });
  }
};

// Get unique IP addresses that accessed the system
export const getAccessIPs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate as string);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate as string);
    }

    const ipStats = await ActivityLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$ipAddress',
          totalRequests: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          failureCount: {
            $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] }
          },
          lastAccess: { $max: '$timestamp' },
          firstAccess: { $min: '$timestamp' },
          users: { $addToSet: '$username' }
        }
      },
      { $sort: { totalRequests: -1 } },
      { $limit: parseInt(limit as string) }
    ]);

    // Check which IPs are blocked
    const ipAddresses = ipStats.map(stat => stat._id);
    const blockedIPs = await BlockedIP.find({
      ipAddress: { $in: ipAddresses },
      isActive: true
    }).select('ipAddress');

    const blockedSet = new Set(blockedIPs.map(ip => ip.ipAddress));

    const enrichedStats = ipStats.map(stat => ({
      ...stat,
      isBlocked: blockedSet.has(stat._id),
      riskLevel: calculateRiskLevel(stat)
    }));

    res.status(200).json({
      success: true,
      data: enrichedStats
    });
  } catch (error: any) {
    console.error('Get access IPs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch IP statistics'
    });
  }
};

// Calculate risk level based on activity patterns
const calculateRiskLevel = (stat: any): 'low' | 'medium' | 'high' => {
  const failureRate = stat.failureCount / stat.totalRequests;
  
  if (failureRate > 0.5 || stat.failureCount > 20) {
    return 'high';
  } else if (failureRate > 0.3 || stat.failureCount > 10) {
    return 'medium';
  }
  return 'low';
};

// Delete old activity logs (admin maintenance)
export const cleanupLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { daysOld = 90 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await ActivityLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} old log entries`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error: any) {
    console.error('Cleanup logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup logs'
    });
  }
};
