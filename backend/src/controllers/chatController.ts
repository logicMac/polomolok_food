import { Response } from 'express';
import ChatMessage from '../models/ChatMessage';
import { AuthRequest } from '../types';

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const chatMessage = await ChatMessage.create({
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.query;
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'admin';

    const filter: any = {};
    
    if (orderId) {
      filter.orderId = orderId;
    } else if (!isAdmin) {
      filter.userId = userId;
    }

    const messages = await ChatMessage.find(filter)
      .sort({ createdAt: 1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messageIds } = req.body;

    await ChatMessage.updateMany(
      { _id: { $in: messageIds } },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'admin';

    const filter: any = { isRead: false };
    
    if (!isAdmin) {
      filter.userId = userId;
      filter.sender = 'admin';
    } else {
      filter.sender = 'user';
    }

    const count = await ChatMessage.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};
