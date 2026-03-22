"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatistics = exports.deleteUser = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Order_1 = __importDefault(require("../models/Order"));
const Food_1 = __importDefault(require("../models/Food"));
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.default.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_1.default.findById(id).select('-password');
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
};
exports.getUserById = getUserById;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_1.default.findByIdAndDelete(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};
exports.deleteUser = deleteUser;
const getStatistics = async (req, res) => {
    try {
        const totalUsers = await User_1.default.countDocuments();
        const totalCustomers = await User_1.default.countDocuments({ role: 'customer' });
        const totalAdmins = await User_1.default.countDocuments({ role: 'admin' });
        const totalOrders = await Order_1.default.countDocuments();
        const totalFoods = await Food_1.default.countDocuments();
        const pendingOrders = await Order_1.default.countDocuments({ status: 'pending' });
        const confirmedOrders = await Order_1.default.countDocuments({ status: 'confirmed' });
        const deliveredOrders = await Order_1.default.countDocuments({ status: 'delivered' });
        // Calculate total revenue
        const revenueResult = await Order_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};
exports.getStatistics = getStatistics;
//# sourceMappingURL=userController.js.map