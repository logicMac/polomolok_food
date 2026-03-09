import express from 'express';
import { getAllFoods, getFoodById, createFood, updateFood, deleteFood } from '../controllers/foodController';
import { authenticate, authorize } from '../middlewares/auth';
import { upload } from '../config/multer';
import { foodManagementLimiter, uploadLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

router.get('/', getAllFoods);
router.get('/:id', getFoodById);
router.post('/', foodManagementLimiter, uploadLimiter, authenticate, authorize('admin'), upload.single('image'), createFood);
router.put('/:id', foodManagementLimiter, uploadLimiter, authenticate, authorize('admin'), upload.single('image'), updateFood);
router.delete('/:id', foodManagementLimiter, authenticate, authorize('admin'), deleteFood);

export default router;
