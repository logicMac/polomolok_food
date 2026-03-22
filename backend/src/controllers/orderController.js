"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderTracking = exports.updateOrderTracking = exports.cancelOrder = exports.updateOrderStatus = exports.getAllOrders = exports.getOrderById = exports.getMyOrders = exports.createOrder = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const Food_1 = __importDefault(require("../models/Food"));
const socket_1 = require("../config/socket");
const createOrder = async (req, res) => {
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
            const food = await Food_1.default.findById(item.foodId);
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
        const orderData = {
            userId: userId,
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
        const order = await Order_1.default.create(orderData);
        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order
        });
    }
    catch (error) {
        console.error('Order creation error:', error);
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
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
exports.createOrder = createOrder;
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const orders = await Order_1.default.find({ userId: userId }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};
exports.getMyOrders = getMyOrders;
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        const order = await Order_1.default.findById(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        });
    }
};
exports.getOrderById = getOrderById;
const getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        const orders = await Order_1.default.find(filter).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};
exports.getAllOrders = getAllOrders;
const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;
        const order = await Order_1.default.findByIdAndUpdate(orderId, { status }, { new: true, runValidators: true });
        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found'
            });
            return;
        }
        // Emit real-time update
        (0, socket_1.emitOrderUpdate)(orderId, order);
        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const order = await Order_1.default.findById(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order',
            error: error.message
        });
    }
};
exports.cancelOrder = cancelOrder;
const updateOrderTracking = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status, driverLocation, estimatedDeliveryTime, note } = req.body;
        const order = await Order_1.default.findById(orderId);
        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found'
            });
            return;
        }
        // Update status if provided
        if (status) {
            order.status = status;
            // Add to status history
            if (!order.statusHistory) {
                order.statusHistory = [];
            }
            order.statusHistory.push({
                status,
                timestamp: new Date(),
                note: note || undefined
            });
        }
        // Update driver location if provided
        if (driverLocation && driverLocation.latitude && driverLocation.longitude) {
            order.driverLocation = {
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
                lastUpdated: new Date()
            };
        }
        // Update estimated delivery time if provided
        if (estimatedDeliveryTime) {
            order.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
        }
        await order.save();
        // Emit real-time update
        (0, socket_1.emitOrderUpdate)(orderId, order);
        res.status(200).json({
            success: true,
            message: 'Order tracking updated successfully',
            data: order
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update order tracking',
            error: error.message
        });
    }
};
exports.updateOrderTracking = updateOrderTracking;
const getOrderTracking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        const order = await Order_1.default.findById(id);
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
                message: 'Access denied'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                orderId: order._id,
                status: order.status,
                statusHistory: order.statusHistory || [],
                driverLocation: order.driverLocation,
                estimatedDeliveryTime: order.estimatedDeliveryTime,
                deliveryAddress: order.deliveryAddress,
                location: order.location
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order tracking',
            error: error.message
        });
    }
};
exports.getOrderTracking = getOrderTracking;
//# sourceMappingURL=orderController.js.map