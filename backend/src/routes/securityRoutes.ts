import express from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getActivityLogs,
  getActivityStats,
  getBlockedIPs,
  blockIP,
  unblockIP,
  getAccessIPs,
  cleanupLogs
} from '../controllers/securityController';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Activity logs routes
router.get('/logs', getActivityLogs);
router.get('/logs/stats', getActivityStats);
router.delete('/logs/cleanup', cleanupLogs);

// IP management routes
router.get('/ips/blocked', getBlockedIPs);
router.get('/ips/access', getAccessIPs);
router.post('/ips/block', blockIP);
router.put('/ips/unblock/:id', unblockIP);

export default router;
