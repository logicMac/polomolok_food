"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Define log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
// Create logs directory if it doesn't exist
const logsDir = path_1.default.join(process.cwd(), 'logs');
// Create logger instance
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'polomolok-food-api' },
    transports: [
        // Write all logs with level 'error' and below to error.log
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write all logs with level 'info' and below to combined.log
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write security-related logs
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'security.log'),
            level: 'warn',
            maxsize: 5242880, // 5MB
            maxFiles: 10,
        }),
    ],
});
// If not in production, also log to console
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
    }));
}
// Security logger for authentication and authorization events
exports.securityLogger = {
    logFailedLogin: (email, ip, reason) => {
        logger.warn('Failed login attempt', {
            event: 'FAILED_LOGIN',
            email,
            ip,
            reason,
            timestamp: new Date().toISOString()
        });
    },
    logSuccessfulLogin: (userId, email, ip) => {
        logger.info('Successful login', {
            event: 'SUCCESSFUL_LOGIN',
            userId,
            email,
            ip,
            timestamp: new Date().toISOString()
        });
    },
    logRegistration: (userId, email, ip) => {
        logger.info('New user registration', {
            event: 'USER_REGISTRATION',
            userId,
            email,
            ip,
            timestamp: new Date().toISOString()
        });
    },
    logUnauthorizedAccess: (userId, resource, ip) => {
        logger.warn('Unauthorized access attempt', {
            event: 'UNAUTHORIZED_ACCESS',
            userId,
            resource,
            ip,
            timestamp: new Date().toISOString()
        });
    },
    logSuspiciousActivity: (description, details) => {
        logger.warn('Suspicious activity detected', {
            event: 'SUSPICIOUS_ACTIVITY',
            description,
            details,
            timestamp: new Date().toISOString()
        });
    }
};
exports.default = logger;
//# sourceMappingURL=logger.js.map