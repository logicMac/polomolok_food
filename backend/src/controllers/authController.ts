import { Request, Response } from 'express';
import axios from 'axios';
import User from '../models/User';
import { generateAccessToken, generateRefreshToken, generateOTP, verifyToken } from '../utils/jwt';
import { sendOTPEmail } from '../utils/emailService';
import { AuthRequest } from '../types';
import { securityLogger } from '../config/logger';

// Helper to get client IP
const getClientIp = (req: Request): string => {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
         req.socket.remoteAddress || 
         'unknown';
};

// Verify reCAPTCHA token
const verifyRecaptcha = async (token: string): Promise<boolean> => {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not set in environment variables');
      return false;
    }

    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      `secret=${secretKey}&response=${token}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    if (!response.data.success) {
      console.error('reCAPTCHA verification failed:', response.data['error-codes']);
    }
    
    return response.data.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, recaptchaToken } = req.body;
    const clientIp = getClientIp(req);

    // Verify reCAPTCHA
    if (!recaptchaToken) {
      res.status(400).json({
        success: false,
        message: 'Please complete the verification'
      });
      return;
    }

    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      securityLogger.logSuspiciousActivity('Failed reCAPTCHA verification', { email, ip: clientIp });
      res.status(400).json({
        success: false,
        message: 'Verification failed. Please try again.'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Don't reveal that email exists - generic message
      res.status(400).json({
        success: false,
        message: 'Unable to complete registration. Please try a different email or contact support.'
      });
      return;
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: 'customer'
    });

    // Log successful registration
    securityLogger.logRegistration(user._id.toString(), email, clientIp);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please login to continue.',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    // Generic error message - don't expose internal details
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again later.'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const clientIp = getClientIp(req);

    // Find user with password and login attempts
    const user = await User.findOne({ email })
      .select('+password +loginAttempts +lockUntil');

    if (!user) {
      // Generic message - don't reveal if email exists
      securityLogger.logFailedLogin(email, clientIp, 'User not found');
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.'
      });
      return;
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000 / 60);
      securityLogger.logFailedLogin(email, clientIp, 'Account locked');
      res.status(423).json({
        success: false,
        message: `Account is temporarily locked. Please try again in ${remainingTime} minute(s).`,
        lockedUntil: user.lockUntil
      });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      
      const updatedUser = await User.findById(user._id).select('+loginAttempts +lockUntil');
      const attemptsLeft = 5 - (updatedUser?.loginAttempts || 0);
      
      securityLogger.logFailedLogin(email, clientIp, 'Invalid password');
      
      res.status(401).json({
        success: false,
        message: `Invalid credentials. ${attemptsLeft > 0 ? `${attemptsLeft} attempt(s) remaining.` : 'Account locked for 5 minutes.'}`,
        attemptsLeft: Math.max(0, attemptsLeft)
      });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to database
    await User.findByIdAndUpdate(user._id, {
      $set: { otp, otpExpires }
    });

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to send verification code. Please try again.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email. Please verify to complete login.',
      data: {
        email: user.email,
        otpSent: true
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again later.'
    });
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const clientIp = getClientIp(req);

    // Find user with OTP fields
    const user = await User.findOne({ email })
      .select('+otp +otpExpires +loginAttempts +lockUntil');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if OTP exists
    if (!user.otp || !user.otpExpires) {
      res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new one.'
      });
      return;
    }

    // Check if OTP has expired
    if (user.otpExpires < new Date()) {
      res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
      return;
    }

    // Verify OTP
    if (user.otp !== otp) {
      securityLogger.logFailedLogin(email, clientIp, 'Invalid OTP');
      res.status(401).json({
        success: false,
        message: 'Invalid verification code'
      });
      return;
    }

    // Reset login attempts and clear OTP
    await User.findByIdAndUpdate(user._id, {
      $set: { loginAttempts: 0 },
      $unset: { otp: 1, otpExpires: 1, lockUntil: 1 }
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    // Set tokens as httpOnly cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Log successful login
    securityLogger.logSuccessfulLogin(user._id.toString(), email, clientIp);

    const userData: any = {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Add rider-specific fields if user is a rider
    if (user.role === 'rider') {
      userData.phoneNumber = user.phoneNumber;
      userData.vehicleType = user.vehicleType;
      userData.vehicleNumber = user.vehicleNumber;
      userData.isAvailable = user.isAvailable;
      userData.image = user.image;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData
      }
    });
  } catch (error: any) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again later.'
    });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
      return;
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    });

    // Set new access token as httpOnly cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully'
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const userData: any = {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    // Add rider-specific fields if user is a rider
    if (user.role === 'rider') {
      userData.phoneNumber = user.phoneNumber;
      userData.vehicleType = user.vehicleType;
      userData.vehicleNumber = user.vehicleNumber;
      userData.isAvailable = user.isAvailable;
      userData.image = user.image;
    }

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};
