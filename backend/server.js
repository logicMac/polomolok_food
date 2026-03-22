"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const fs_1 = __importDefault(require("fs"));
const http_1 = require("http");
const db_1 = __importDefault(require("./db"));
const rateLimiter_1 = require("./src/middlewares/rateLimiter");
const csrf_1 = require("./src/middlewares/csrf");
const socket_1 = require("./src/config/socket");
// Routes
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const foodRoutes_1 = __importDefault(require("./src/routes/foodRoutes"));
const orderRoutes_1 = __importDefault(require("./src/routes/orderRoutes"));
const userRoutes_1 = __importDefault(require("./src/routes/userRoutes"));
const chatRoutes_1 = __importDefault(require("./src/routes/chatRoutes"));
const riderRoutes_1 = __importDefault(require("./src/routes/riderRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 5000;
// Initialize Socket.IO
(0, socket_1.initializeSocket)(server);
// Connect to MongoDB
(0, db_1.default)();
// Create logs directory if it doesn't exist
const logsDir = path_1.default.join(process.cwd(), 'logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
// Create a write stream for access logs
const accessLogStream = fs_1.default.createWriteStream(path_1.default.join(logsDir, 'access.log'), { flags: 'a' });
// HTTP request logging
app.use((0, morgan_1.default)('combined', { stream: accessLogStream })); // Log to file
app.use((0, morgan_1.default)('dev')); // Log to console in development
// Security Middlewares
app.use((0, helmet_1.default)()); // Set security HTTP headers
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
// Cookie parser for CSRF
app.use((0, cookie_parser_1.default)());
// Body parsers MUST come first
app.use(express_1.default.json({ limit: '10kb' })); // Body parser with size limit
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
// Serve static files from uploads directory BEFORE other routes
const uploadsPath = path_1.default.join(process.cwd(), 'uploads');
console.log('📁 Serving uploads from:', uploadsPath);
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express_1.default.static(uploadsPath));
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
    }
    catch (error) {
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
    const sanitize = (obj) => {
        if (obj && typeof obj === 'object') {
            for (const key in obj) {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                }
                else if (typeof obj[key] === 'object') {
                    obj[key] = sanitize(obj[key]);
                }
                else if (typeof obj[key] === 'string') {
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
// Rate limiting
app.use('/api', rateLimiter_1.apiLimiter);
// CSRF token endpoint (must be before CSRF verification)
app.get('/api/csrf-token', csrf_1.getCsrfToken);
// CSRF protection for state-changing operations
app.use('/api', csrf_1.verifyCsrfToken);
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/foods', foodRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/chat', chatRoutes_1.default);
app.use('/api/riders', riderRoutes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
// Global error handler
app.use((err, req, res, next) => {
    // Handle Multer errors
    if (err instanceof multer_1.default.MulterError) {
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
//# sourceMappingURL=server.js.map