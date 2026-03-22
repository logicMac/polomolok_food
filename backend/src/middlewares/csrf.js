"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCsrfToken = exports.verifyCsrfToken = exports.generateCsrfToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
// Store for CSRF tokens (in production, use Redis or database)
const csrfTokens = new Map();
// Clean up expired tokens every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of csrfTokens.entries()) {
        if (value.expires < now) {
            csrfTokens.delete(key);
        }
    }
}, 10 * 60 * 1000);
const generateCsrfToken = (req, res) => {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const sessionId = req.headers['x-session-id'] || crypto_1.default.randomBytes(16).toString('hex');
    // Store token with 1 hour expiration
    csrfTokens.set(sessionId, {
        token,
        expires: Date.now() + 60 * 60 * 1000 // 1 hour
    });
    // Set session ID in cookie
    res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000 // 1 hour
    });
    return token;
};
exports.generateCsrfToken = generateCsrfToken;
const verifyCsrfToken = (req, res, next) => {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    const sessionId = req.cookies.sessionId;
    const csrfToken = req.headers['x-csrf-token'];
    if (!sessionId || !csrfToken) {
        res.status(403).json({
            success: false,
            message: 'CSRF token missing'
        });
        return;
    }
    const storedToken = csrfTokens.get(sessionId);
    if (!storedToken) {
        res.status(403).json({
            success: false,
            message: 'Invalid session'
        });
        return;
    }
    if (storedToken.expires < Date.now()) {
        csrfTokens.delete(sessionId);
        res.status(403).json({
            success: false,
            message: 'CSRF token expired'
        });
        return;
    }
    if (storedToken.token !== csrfToken) {
        res.status(403).json({
            success: false,
            message: 'Invalid CSRF token'
        });
        return;
    }
    next();
};
exports.verifyCsrfToken = verifyCsrfToken;
const getCsrfToken = (req, res) => {
    const token = (0, exports.generateCsrfToken)(req, res);
    res.status(200).json({
        success: true,
        csrfToken: token
    });
};
exports.getCsrfToken = getCsrfToken;
//# sourceMappingURL=csrf.js.map