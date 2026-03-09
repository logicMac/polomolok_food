import { Response } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import Food from '../models/Food';
import { AuthRequest } from '../types';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

export const getStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalOrders = await Order.countDocuments();
    const totalFoods = await Food.countDocuments();
    
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          admins: totalAdmins
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          delivered: deliveredOrders
        },
        foods: {
          total: totalFoods
        },
        revenue: {
          total: totalRevenue
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};
