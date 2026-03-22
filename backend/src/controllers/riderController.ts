import { Response } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import { AuthRequest } from '../types';
import { emitOrderUpdate, emitDriverLocation } from '../config/socket';

// Admin creates a rider account
export const createRider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, phoneNumber, vehicleType, vehicleNumber } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
      return;
    }

    // Get image path if uploaded
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Create rider
    const rider = await User.create({
      name,
      email,
      password,
      role: 'rider',
      phoneNumber,
      vehicleType,
      vehicleNumber,
      isAvailable: true,
      image
    });

    res.status(201).json({
      success: true,
      message: 'Rider created successfully',
      data: {
        riderId: rider._id,
        name: rider.name,
        email: rider.email,
        phoneNumber: rider.phoneNumber,
        vehicleType: rider.vehicleType,
        vehicleNumber: rider.vehicleNumber,
        image: rider.image
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create rider',
      error: error.message
    });
  }
};

// Get all riders (Admin)
export const getAllRiders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const riders = await User.find({ role: 'rider' }).select('-password');

    res.status(200).json({
      success: true,
      count: riders.length,
      data: riders
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch riders',
      error: error.message
    });
  }
};

// Get available riders (Admin)
export const getAvailableRiders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const riders = await User.find({ role: 'rider', isAvailable: true }).select('-password');

    res.status(200).json({
      success: true,
      count: riders.length,
      data: riders
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available riders',
      error: error.message
    });
  }
};

// Update rider details (Admin)
export const updateRider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, vehicleType, vehicleNumber, isAvailable } = req.body;

    const rider = await User.findOne({ _id: id, role: 'rider' });
    if (!rider) {
      res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
      return;
    }

    if (name) rider.name = name;
    if (phoneNumber) rider.phoneNumber = phoneNumber;
    if (vehicleType) rider.vehicleType = vehicleType;
    if (vehicleNumber) rider.vehicleNumber = vehicleNumber;
    if (isAvailable !== undefined) rider.isAvailable = isAvailable;
    if (req.file) rider.image = `/uploads/${req.file.filename}`;

    await rider.save();

    res.status(200).json({
      success: true,
      message: 'Rider updated successfully',
      data: {
        riderId: rider._id,
        name: rider.name,
        email: rider.email,
        phoneNumber: rider.phoneNumber,
        vehicleType: rider.vehicleType,
        vehicleNumber: rider.vehicleNumber,
        isAvailable: rider.isAvailable,
        image: rider.image
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update rider',
      error: error.message
    });
  }
};

// Delete rider (Admin)
export const deleteRider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const rider = await User.findOneAndDelete({ _id: id, role: 'rider' });
    if (!rider) {
      res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Rider deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete rider',
      error: error.message
    });
  }
};

// Assign order to rider (Admin)
export const assignOrderToRider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId, riderId } = req.body;

    const rider = await User.findOne({ _id: riderId, role: 'rider' });
    if (!rider) {
      res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    order.riderId = riderId;
    if (order.status === 'pending' || order.status === 'confirmed') {
      order.status = 'preparing';
    }
    await order.save();

    // Emit real-time update
    emitOrderUpdate(orderId, order);

    res.status(200).json({
      success: true,
      message: 'Order assigned to rider successfully',
      data: order
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to assign order',
      error: error.message
    });
  }
};

// Get rider's assigned orders (Rider)
export const getMyDeliveries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const riderId = req.user?.userId;

    const orders = await Order.find({ riderId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deliveries',
      error: error.message
    });
  }
};

// Update rider location (Rider)
export const updateLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const riderId = req.user?.userId;
    const { latitude, longitude } = req.body;

    const rider = await User.findById(riderId);
    if (!rider || rider.role !== 'rider') {
      res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
      return;
    }

    rider.currentLocation = {
      latitude,
      longitude,
      lastUpdated: new Date()
    };
    await rider.save();

    // Find active orders for this rider and emit location updates
    const activeOrders = await Order.find({
      riderId,
      status: { $in: ['preparing', 'ready', 'out-for-delivery'] }
    });

    activeOrders.forEach(order => {
      emitDriverLocation(order._id.toString(), { latitude, longitude });
    });

    res.status(200).json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
};

// Update delivery status (Rider)
export const updateDeliveryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const riderId = req.user?.userId;
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({ _id: orderId, riderId });
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you'
      });
      return;
    }

    order.status = status;
    
    // Add to status history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status,
      timestamp: new Date()
    });

    await order.save();

    // Emit real-time update
    emitOrderUpdate(orderId as string, order);

    res.status(200).json({
      success: true,
      message: 'Delivery status updated successfully',
      data: order
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery status',
      error: error.message
    });
  }
};

// Toggle availability (Rider)
export const toggleAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const riderId = req.user?.userId;

    const rider = await User.findById(riderId);
    if (!rider || rider.role !== 'rider') {
      res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
      return;
    }

    rider.isAvailable = !rider.isAvailable;
    await rider.save();

    res.status(200).json({
      success: true,
      message: `You are now ${rider.isAvailable ? 'available' : 'unavailable'}`,
      data: { isAvailable: rider.isAvailable }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle availability',
      error: error.message
    });
  }
};
