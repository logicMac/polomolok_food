import { Response } from 'express';
import { AuthRequest } from '../types';
import Order from '../models/Order';
import Food from '../models/Food';
import User from '../models/User';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Total revenue
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['delivered', 'completed'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const revenue = revenueData[0] || { total: 0, count: 0 };

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top selling foods
    const topFoods = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['delivered', 'completed'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.food',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'foods',
          localField: '_id',
          foreignField: '_id',
          as: 'foodDetails'
        }
      },
      { $unwind: '$foodDetails' },
      {
        $project: {
          name: '$foodDetails.name',
          image: '$foodDetails.image',
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);

    // Revenue by day
    const revenueByDay = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['delivered', 'completed'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Customer stats
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const newCustomers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startDate }
    });

    // Average order value
    const avgOrderValue = revenue.count > 0 ? revenue.total / revenue.count : 0;

    // Peak hours
    const peakHours = await Order.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        revenue: {
          total: revenue.total,
          orderCount: revenue.count,
          average: avgOrderValue
        },
        ordersByStatus,
        topFoods,
        revenueByDay,
        customers: {
          total: totalCustomers,
          new: newCustomers
        },
        peakHours
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

export const getInventoryStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Low stock items - need to use $expr for field comparison
    const lowStockItems = await Food.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      available: true
    }).select('name stock lowStockThreshold category');

    // Out of stock items
    const outOfStockItems = await Food.find({
      stock: 0
    }).select('name category');

    // Stock by category
    const stockByCategory = await Food.aggregate([
      {
        $group: {
          _id: '$category',
          totalStock: { $sum: '$stock' },
          itemCount: { $sum: 1 },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ['$stock', '$lowStockThreshold'] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        lowStockItems,
        outOfStockItems,
        stockByCategory
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory stats',
      error: error.message
    });
  }
};
