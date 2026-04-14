import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import fs from 'fs';
import { createServer } from 'http';
import connectDB from './db';
import { apiLimiter } from './src/middlewares/rateLimiter';
import { getCsrfToken, verifyCsrfToken } from './src/middlewares/csrf';
import { checkBlockedIP } from './src/middlewares/ipBlocker';
import logger from './src/config/logger';
import { initializeSocket } from './src/config/socket';

// Routes
import authRoutes from './src/routes/authRoutes';
import foodRoutes from './src/routes/foodRoutes';
import orderRoutes from './src/routes/orderRoutes';
import userRoutes from './src/routes/userRoutes';
import chatRoutes from './src/routes/chatRoutes';
import riderRoutes from './src/routes/riderRoutes';
import analyticsRoutes from './src/routes/analyticsRoutes';
import securityRoutes from './src/routes/securityRoutes';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO
initializeSocket(server);

// Connect to MongoDB
connectDB();

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// HTTP request logging
app.use(morgan('combined', { stream: accessLogStream })); // Log to file
app.use(morgan('dev')); // Log to console in development

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google.com", "https://www.gstatic.com"],
      frameSrc: ["'self'", "https://www.google.com"],
      connectSrc: ["'self'", "https://www.google.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Cookie parser for CSRF
app.use(cookieParser());

// Body parsers MUST come first
app.use(express.json({ limit: '10kb' })); // Body parser with size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serve static files from uploads directory BEFORE other routes
const uploadsPath = path.join(process.cwd(), 'uploads');
console.log('📁 Serving uploads from:', uploadsPath);

app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsPath));

// Test uploads directory - BEFORE rate limiter
app.get('/test-uploads', (req, res) => {
  const fs = require('fs');
  
  try {
    const files = fs.readdirSync(uploadsPath);
    res.json({
      success: true,
      uploadsPath,
      files,
      cwd: process.cwd(),
      exists: fs.existsSync(uploadsPath)
    });
  } catch (error: any) {
    res.json({
      success: false,
      error: error.message,
      uploadsPath,
      cwd: process.cwd()
    });
  }
});

// Health check - BEFORE rate limiter
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Custom NoSQL injection prevention middleware
// Note: In Express v5, req.query and req.params are read-only, so we only sanitize req.body
// Skip sanitization for multipart/form-data (file uploads)
app.use((req, res, next) => {
  // Skip sanitization for file uploads
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return next();
  }

  const sanitize = (obj: any): any => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          obj[key] = sanitize(obj[key]);
        } else if (typeof obj[key] === 'string') {
          // Basic XSS prevention - remove script tags and dangerous attributes
          obj[key] = obj[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
        }
      }
    }
    return obj;
  };

  // Only sanitize req.body (writable in Express v5)
  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }
  
  next();
});

// IP blocking check (before rate limiting)
app.use(checkBlockedIP);

// Rate limiting
app.use('/api', apiLimiter);

// CSRF token endpoint (must be before CSRF verification)
app.get('/api/csrf-token', getCsrfToken);

// CSRF protection for state-changing operations
app.use('/api', verifyCsrfToken);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/security', securityRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(process.cwd(), '..', 'client', 'dist');
  console.log('📦 Serving client from:', clientBuildPath);
  console.log('📦 Client build exists:', fs.existsSync(clientBuildPath));
  
  app.use(express.static(clientBuildPath));
  
  // Handle React routing - return all requests to React app
  app.use((req, res) => {
    const indexPath = path.join(clientBuildPath, 'index.html');
    console.log('📄 Serving index.html from:', indexPath);
    res.sendFile(indexPath);
  });
} else {
  // 404 handler for development
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  });
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }

  // Handle other errors
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Socket.IO enabled for real-time features`);
});
