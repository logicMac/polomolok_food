"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleAvailability = exports.updateDeliveryStatus = exports.updateLocation = exports.getMyDeliveries = exports.assignOrderToRider = exports.deleteRider = exports.updateRider = exports.getAvailableRiders = exports.getAllRiders = exports.createRider = void 0;
const User_1 = __importDefault(require("../models/User"));
const Order_1 = __importDefault(require("../models/Order"));
const socket_1 = require("../config/socket");
// Admin creates a rider account
const createRider = async (req, res) => {
    try {
        const { name, email, password, phoneNumber, vehicleType, vehicleNumber } = req.body;
        // Check if email already exists
        const existingUser = await User_1.default.findOne({ email });
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
        const rider = await User_1.default.create({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create rider',
            error: error.message
        });
    }
};
exports.createRider = createRider;
// Get all riders (Admin)
const getAllRiders = async (req, res) => {
    try {
        const riders = await User_1.default.find({ role: 'rider' }).select('-password');
        res.status(200).json({
            success: true,
            count: riders.length,
            data: riders
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch riders',
            error: error.message
        });
    }
};
exports.getAllRiders = getAllRiders;
// Get available riders (Admin)
const getAvailableRiders = async (req, res) => {
    try {
        const riders = await User_1.default.find({ role: 'rider', isAvailable: true }).select('-password');
        res.status(200).json({
            success: true,
            count: riders.length,
            data: riders
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available riders',
            error: error.message
        });
    }
};
exports.getAvailableRiders = getAvailableRiders;
// Update rider details (Admin)
const updateRider = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phoneNumber, vehicleType, vehicleNumber, isAvailable } = req.body;
        const rider = await User_1.default.findOne({ _id: id, role: 'rider' });
        if (!rider) {
            res.status(404).json({
                success: false,
                message: 'Rider not found'
            });
            return;
        }
        if (name)
            rider.name = name;
        if (phoneNumber)
            rider.phoneNumber = phoneNumber;
        if (vehicleType)
            rider.vehicleType = vehicleType;
        if (vehicleNumber)
            rider.vehicleNumber = vehicleNumber;
        if (isAvailable !== undefined)
            rider.isAvailable = isAvailable;
        if (req.file)
            rider.image = `/uploads/${req.file.filename}`;
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update rider',
            error: error.message
        });
    }
};
exports.updateRider = updateRider;
// Delete rider (Admin)
const deleteRider = async (req, res) => {
    try {
        const { id } = req.params;
        const rider = await User_1.default.findOneAndDelete({ _id: id, role: 'rider' });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete rider',
            error: error.message
        });
    }
};
exports.deleteRider = deleteRider;
// Assign order to rider (Admin)
const assignOrderToRider = async (req, res) => {
    try {
        const { orderId, riderId } = req.body;
        const rider = await User_1.default.findOne({ _id: riderId, role: 'rider' });
        if (!rider) {
            res.status(404).json({
                success: false,
                message: 'Rider not found'
            });
            return;
        }
        const order = await Order_1.default.findById(orderId);
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
        (0, socket_1.emitOrderUpdate)(orderId, order);
        res.status(200).json({
            success: true,
            message: 'Order assigned to rider successfully',
            data: order
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to assign order',
            error: error.message
        });
    }
};
exports.assignOrderToRider = assignOrderToRider;
// Get rider's assigned orders (Rider)
const getMyDeliveries = async (req, res) => {
    try {
        const riderId = req.user?.userId;
        const orders = await Order_1.default.find({ riderId }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch deliveries',
            error: error.message
        });
    }
};
exports.getMyDeliveries = getMyDeliveries;
// Update rider location (Rider)
const updateLocation = async (req, res) => {
    try {
        const riderId = req.user?.userId;
        const { latitude, longitude } = req.body;
        const rider = await User_1.default.findById(riderId);
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
        const activeOrders = await Order_1.default.find({
            riderId,
            status: { $in: ['preparing', 'ready', 'out-for-delivery'] }
        });
        activeOrders.forEach(order => {
            (0, socket_1.emitDriverLocation)(order._id.toString(), { latitude, longitude });
        });
        res.status(200).json({
            success: true,
            message: 'Location updated successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update location',
            error: error.message
        });
    }
};
exports.updateLocation = updateLocation;
// Update delivery status (Rider)
const updateDeliveryStatus = async (req, res) => {
    try {
        const riderId = req.user?.userId;
        const { orderId } = req.params;
        const { status } = req.body;
        const order = await Order_1.default.findOne({ _id: orderId, riderId });
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
        (0, socket_1.emitOrderUpdate)(orderId, order);
        res.status(200).json({
            success: true,
            message: 'Delivery status updated successfully',
            data: order
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update delivery status',
            error: error.message
        });
    }
};
exports.updateDeliveryStatus = updateDeliveryStatus;
// Toggle availability (Rider)
const toggleAvailability = async (req, res) => {
    try {
        const riderId = req.user?.userId;
        const rider = await User_1.default.findById(riderId);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to toggle availability',
            error: error.message
        });
    }
};
exports.toggleAvailability = toggleAvailability;
//# sourceMappingURL=riderController.js.map