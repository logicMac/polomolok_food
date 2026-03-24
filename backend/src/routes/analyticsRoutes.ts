import express from 'express';
import { getDashboardStats, getInventoryStats } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

router.get('/dashboard', authenticate, authorize('admin'), getDashboardStats);
router.get('/inventory', authenticate, authorize('admin'), getInventoryStats);

export default router;
