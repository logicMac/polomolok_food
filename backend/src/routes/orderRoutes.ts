import express from 'express';
import { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, cancelOrder } from '../controllers/orderController';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validator';
import { orderSchema, updateOrderStatusSchema } from '../utils/validators';
import { orderLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

router.post('/', orderLimiter, authenticate, authorize('customer'), validate(orderSchema), createOrder);
router.get('/my-orders', authenticate, authorize('customer'), getMyOrders);
router.get('/all', authenticate, authorize('admin'), getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/status', authenticate, authorize('admin'), validate(updateOrderStatusSchema), updateOrderStatus);
router.put('/:id/cancel', authenticate, authorize('customer'), cancelOrder);

export default router;
