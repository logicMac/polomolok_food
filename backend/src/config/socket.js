"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitDriverLocation = exports.emitOrderUpdate = exports.getIO = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let io;
const initializeSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            credentials: true
        }
    });
    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.data.user = decoded;
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.data.user.userId;
        const userRole = socket.data.user.role;
        console.log(`User connected: ${userId} (${userRole})`);
        // Join user-specific room
        socket.join(`user:${userId}`);
        // Admins join admin room
        if (userRole === 'admin') {
            socket.join('admin');
        }
        // Join order-specific room
        socket.on('join-order', (orderId) => {
            socket.join(`order:${orderId}`);
            console.log(`User ${userId} joined order room: ${orderId}`);
        });
        // Leave order room
        socket.on('leave-order', (orderId) => {
            socket.leave(`order:${orderId}`);
            console.log(`User ${userId} left order room: ${orderId}`);
        });
        // Chat message
        socket.on('chat-message', (data) => {
            const messageData = {
                userId,
                userName: socket.data.user.email,
                message: data.message,
                sender: userRole === 'admin' ? 'admin' : 'user',
                orderId: data.orderId,
                timestamp: new Date()
            };
            // Emit to order room or user room
            if (data.orderId) {
                io.to(`order:${data.orderId}`).emit('new-message', messageData);
            }
            else {
                io.to(`user:${userId}`).emit('new-message', messageData);
                io.to('admin').emit('new-message', messageData);
            }
        });
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userId}`);
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
exports.getIO = getIO;
// Emit order status update
const emitOrderUpdate = (orderId, orderData) => {
    if (io) {
        io.to(`order:${orderId}`).emit('order-update', orderData);
        io.to('admin').emit('order-update', orderData);
    }
};
exports.emitOrderUpdate = emitOrderUpdate;
// Emit driver location update
const emitDriverLocation = (orderId, location) => {
    if (io) {
        io.to(`order:${orderId}`).emit('driver-location', { orderId, location, timestamp: new Date() });
    }
};
exports.emitDriverLocation = emitDriverLocation;
//# sourceMappingURL=socket.js.map