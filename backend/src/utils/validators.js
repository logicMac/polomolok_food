"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusSchema = exports.orderSchema = exports.foodSchema = exports.verifyOTPSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).trim().required(),
    email: joi_1.default.string().email().lowercase().trim().required(),
    password: joi_1.default.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }),
    recaptchaToken: joi_1.default.string().required().messages({
        'any.required': 'reCAPTCHA verification is required'
    })
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().lowercase().trim().required(),
    password: joi_1.default.string().required()
});
exports.verifyOTPSchema = joi_1.default.object({
    email: joi_1.default.string().email().lowercase().trim().required(),
    otp: joi_1.default.string().length(6).pattern(/^\d+$/).required()
});
exports.foodSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).trim().required(),
    description: joi_1.default.string().max(500).trim().required(),
    category: joi_1.default.string().valid('Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Snack').required(),
    price: joi_1.default.number().min(0).required(),
    image: joi_1.default.string().uri().required(),
    available: joi_1.default.boolean()
});
exports.orderSchema = joi_1.default.object({
    items: joi_1.default.array().items(joi_1.default.object({
        foodId: joi_1.default.string().required(),
        quantity: joi_1.default.number().min(1).required()
    })).min(1).required(),
    deliveryAddress: joi_1.default.string().min(10).max(200).trim().required(),
    phoneNumber: joi_1.default.string()
        .trim()
        .pattern(/^(\+?63|0)9\d{9}$/)
        .required()
        .messages({
        'string.pattern.base': 'Please provide a valid Philippine mobile number (e.g., 09123456789 or +639123456789)',
        'any.required': 'Phone number is required for delivery coordination'
    }),
    location: joi_1.default.object({
        latitude: joi_1.default.number().min(-90).max(90).required(),
        longitude: joi_1.default.number().min(-180).max(180).required()
    }).optional()
});
exports.updateOrderStatusSchema = joi_1.default.object({
    status: joi_1.default.string().valid('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled').required()
});
//# sourceMappingURL=validators.js.map