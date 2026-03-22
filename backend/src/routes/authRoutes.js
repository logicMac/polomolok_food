"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const validator_1 = require("../middlewares/validator");
const validators_1 = require("../utils/validators");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
router.post('/register', rateLimiter_1.authLimiter, (0, validator_1.validate)(validators_1.registerSchema), authController_1.register);
router.post('/login', rateLimiter_1.authLimiter, (0, validator_1.validate)(validators_1.loginSchema), authController_1.login);
router.post('/verify-otp', rateLimiter_1.otpLimiter, (0, validator_1.validate)(validators_1.verifyOTPSchema), authController_1.verifyOTP);
router.post('/refresh-token', authController_1.refreshToken);
router.post('/logout', authController_1.logout);
router.get('/profile', auth_1.authenticate, authController_1.getProfile);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map