"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = async (req, res, next) => {
    try {
        // Try to get token from cookie first (more secure)
        let token = req.cookies.accessToken;
        // Fallback to Authorization header for backward compatibility
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
            return;
        }
        try {
            const decoded = (0, jwt_1.verifyToken)(token);
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };
            next();
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token. Please login again.'
            });
            return;
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map