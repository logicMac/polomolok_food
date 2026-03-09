import { Response } from 'express';
import Order from '../models/Order';
import Food from '../models/Food';
import { AuthRequest } from '../types';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, deliveryAddress, phoneNumber, location } = req.body;
    const userId = req.user?.userId;

    console.log('Order request:', { phoneNumber, deliveryAddress, itemsCount: items?.length });

    // Validate phone number - accept Philippine formats
    if (!phoneNumber) {
      res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
      return;
    }

    // Remove any non-digit characters for validation
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    console.log('Clean phone:', cleanPhone, 'Length:', cleanPhone.length);
    
    // Accept: 09XXXXXXXXX (11 digits) or 639XXXXXXXXX (12 digits) or +639XXXXXXXXX
    if (cleanPhone.length < 10 || cleanPhone.length > 13) {
      res.status(400).json({
        success: false,
        message: `Please provide a valid Philippine phone number (received ${cleanPhone.length} digits)`
      });
      return;
    }

    // Validate and calculate order
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const food = await Food.findById(item.foodId);
      
      if (!food) {
        res.status(404).json({
          success: false,
          message: `Food item with ID ${item.foodId} not found`
        });
        return;
      }

      if (!food.available) {
        res.status(400).json({
          success: false,
          message: `${food.name} is currently unavailable`
        });
        return;
      }

      orderItems.push({
        foodId: food._id.toString(),
        name: food.name,
        price: food.price,
        quantity: item.quantity
      });

      totalPrice += food.price * item.quantity;
    }

    // Create order
    const orderData: any = {
      userId: userId!,
      items: orderItems,
      totalPrice,
      deliveryAddress,
      phoneNumber,
      status: 'pending'
    };

    // Add location if provided
    if (location && location.latitude && location.longitude) {
      orderData.location = {
        latitude: location.latitude,
        longitude: location.longitude
      };
    }

    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const orders = await Order.find({ userId: userId! }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Check authorization
    if (userRole !== 'admin' && order.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Check authorization
    if (order.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own orders.'
      });
      return;
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
      return;
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};
