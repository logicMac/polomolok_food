import express from 'express';
import { getAllUsers, getUserById, deleteUser, getStatistics, updateProfile, getMyProfile } from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

// User's own profile routes (must come before /:id routes)
router.get('/profile/me', authenticate, getMyProfile);
router.put('/profile/me', authenticate, updateProfile);

// Admin routes
router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get('/statistics', authenticate, authorize('admin'), getStatistics);
router.get('/:id', authenticate, authorize('admin'), getUserById);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

export default router;
