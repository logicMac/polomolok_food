import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types';

let io: SocketIOServer;

export const initializeSocket = (server: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(server, {
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
      socket.data.user = decoded;
      next();
    } catch (error) {
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
    socket.on('join-order', (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`User ${userId} joined order room: ${orderId}`);
    });

    // Leave order room
    socket.on('leave-order', (orderId: string) => {
      socket.leave(`order:${orderId}`);
      console.log(`User ${userId} left order room: ${orderId}`);
    });

    // Chat message
    socket.on('chat-message', (data: { message: string; orderId?: string }) => {
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
      } else {
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

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit order status update
export const emitOrderUpdate = (orderId: string, orderData: any) => {
  if (io) {
    io.to(`order:${orderId}`).emit('order-update', orderData);
    io.to('admin').emit('order-update', orderData);
  }
};

// Emit driver location update
export const emitDriverLocation = (orderId: string, location: { latitude: number; longitude: number }) => {
  if (io) {
    io.to(`order:${orderId}`).emit('driver-location', { orderId, location, timestamp: new Date() });
  }
};
