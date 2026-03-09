import express from 'express';
import { register, login, verifyOTP, refreshToken, getProfile, logout } from '../controllers/authController';
import { validate } from '../middlewares/validator';
import { registerSchema, loginSchema, verifyOTPSchema } from '../utils/validators';
import { authLimiter, otpLimiter } from '../middlewares/rateLimiter';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/verify-otp', otpLimiter, validate(verifyOTPSchema), verifyOTP);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/profile', authenticate, getProfile);

export default router;
