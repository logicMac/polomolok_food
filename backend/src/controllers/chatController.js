"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.markAsRead = exports.getMessages = exports.sendMessage = void 0;
const ChatMessage_1 = __importDefault(require("../models/ChatMessage"));
const sendMessage = async (req, res) => {
    try {
        const { message, orderId } = req.body;
        const userId = req.user?.userId;
        const userName = req.user?.email || 'User';
        if (!message || !message.trim()) {
            res.status(400).json({
                success: false,
                message: 'Message cannot be empty'
            });
            return;
        }
        const chatMessage = await ChatMessage_1.default.create({
            userId,
            userName,
            message: message.trim(),
            sender: req.user?.role === 'admin' ? 'admin' : 'user',
            orderId: orderId || undefined,
            isRead: false
        });
        res.status(201).json({
            success: true,
            data: chatMessage
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
};
exports.sendMessage = sendMessage;
const getMessages = async (req, res) => {
    try {
        const { orderId } = req.query;
        const userId = req.user?.userId;
        const isAdmin = req.user?.role === 'admin';
        const filter = {};
        if (orderId) {
            filter.orderId = orderId;
        }
        else if (!isAdmin) {
            filter.userId = userId;
        }
        const messages = await ChatMessage_1.default.find(filter)
            .sort({ createdAt: 1 })
            .limit(100);
        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message
        });
    }
};
exports.getMessages = getMessages;
const markAsRead = async (req, res) => {
    try {
        const { messageIds } = req.body;
        await ChatMessage_1.default.updateMany({ _id: { $in: messageIds } }, { isRead: true });
        res.status(200).json({
            success: true,
            message: 'Messages marked as read'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read',
            error: error.message
        });
    }
};
exports.markAsRead = markAsRead;
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const isAdmin = req.user?.role === 'admin';
        const filter = { isRead: false };
        if (!isAdmin) {
            filter.userId = userId;
            filter.sender = 'admin';
        }
        else {
            filter.sender = 'user';
        }
        const count = await ChatMessage_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: { unreadCount: count }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count',
            error: error.message
        });
    }
};
exports.getUnreadCount = getUnreadCount;
//# sourceMappingURL=chatController.js.map