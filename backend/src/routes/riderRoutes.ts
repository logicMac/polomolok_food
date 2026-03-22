import express from 'express';
import {
  createRider,
  getAllRiders,
  getAvailableRiders,
  updateRider,
  deleteRider,
  assignOrderToRider,
  getMyDeliveries,
  updateLocation,
  updateDeliveryStatus,
  toggleAvailability
} from '../controllers/riderController';
import { authenticate, authorize } from '../middlewares/auth';
import { upload } from '../config/multer';

const router = express.Router();

// Admin routes
router.post('/', authenticate, authorize('admin'), upload.single('image'), createRider);
router.get('/', authenticate, authorize('admin'), getAllRiders);
router.get('/available', authenticate, authorize('admin'), getAvailableRiders);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), updateRider);
router.delete('/:id', authenticate, authorize('admin'), deleteRider);
router.post('/assign-order', authenticate, authorize('admin'), assignOrderToRider);

// Rider routes
router.get('/my-deliveries', authenticate, authorize('rider'), getMyDeliveries);
router.put('/location', authenticate, authorize('rider'), updateLocation);
router.put('/delivery/:orderId/status', authenticate, authorize('rider'), updateDeliveryStatus);
router.put('/toggle-availability', authenticate, authorize('rider'), toggleAvailability);

export default router;
