import express from 'express';
import { authenticate } from '../middlewares/auth';
import { sendMessage, getMessages, markAsRead, getUnreadCount } from '../controllers/chatController';

const router = express.Router();

router.post('/messages', authenticate, sendMessage);
router.get('/messages', authenticate, getMessages);
router.put('/messages/read', authenticate, markAsRead);
router.get('/messages/unread-count', authenticate, getUnreadCount);

export default router;
