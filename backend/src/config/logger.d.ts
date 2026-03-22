import winston from 'winston';
declare const logger: winston.Logger;
export declare const securityLogger: {
    logFailedLogin: (email: string, ip: string, reason: string) => void;
    logSuccessfulLogin: (userId: string, email: string, ip: string) => void;
    logRegistration: (userId: string, email: string, ip: string) => void;
    logUnauthorizedAccess: (userId: string | undefined, resource: string, ip: string) => void;
    logSuspiciousActivity: (description: string, details: any) => void;
};
export default logger;
//# sourceMappingURL=logger.d.ts.map