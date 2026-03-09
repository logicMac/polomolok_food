import express from 'express';
import { getAllUsers, getUserById, deleteUser, getStatistics } from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get('/statistics', authenticate, authorize('admin'), getStatistics);
router.get('/:id', authenticate, authorize('admin'), getUserById);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

export default router;
