import winston from 'winston';
import path from 'path';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'polomolok-food-api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write security-related logs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
});

// If not in production, also log to console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Security logger for authentication and authorization events
export const securityLogger = {
  logFailedLogin: (email: string, ip: string, reason: string) => {
    logger.warn('Failed login attempt', {
      event: 'FAILED_LOGIN',
      email,
      ip,
      reason,
      timestamp: new Date().toISOString()
    });
  },
  
  logSuccessfulLogin: (userId: string, email: string, ip: string) => {
    logger.info('Successful login', {
      event: 'SUCCESSFUL_LOGIN',
      userId,
      email,
      ip,
      timestamp: new Date().toISOString()
    });
  },
  
  logRegistration: (userId: string, email: string, ip: string) => {
    logger.info('New user registration', {
      event: 'USER_REGISTRATION',
      userId,
      email,
      ip,
      timestamp: new Date().toISOString()
    });
  },
  
  logUnauthorizedAccess: (userId: string | undefined, resource: string, ip: string) => {
    logger.warn('Unauthorized access attempt', {
      event: 'UNAUTHORIZED_ACCESS',
      userId,
      resource,
      ip,
      timestamp: new Date().toISOString()
    });
  },
  
  logSuspiciousActivity: (description: string, details: any) => {
    logger.warn('Suspicious activity detected', {
      event: 'SUSPICIOUS_ACTIVITY',
      description,
      details,
      timestamp: new Date().toISOString()
    });
  }
};

export default logger;
