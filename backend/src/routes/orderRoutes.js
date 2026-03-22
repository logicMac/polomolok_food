"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middlewares/auth");
const validator_1 = require("../middlewares/validator");
const validators_1 = require("../utils/validators");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = express_1.default.Router();
router.post('/', rateLimiter_1.orderLimiter, auth_1.authenticate, (0, auth_1.authorize)('customer'), (0, validator_1.validate)(validators_1.orderSchema), orderController_1.createOrder);
router.get('/my-orders', auth_1.authenticate, (0, auth_1.authorize)('customer'), orderController_1.getMyOrders);
router.get('/all', auth_1.authenticate, (0, auth_1.authorize)('admin'), orderController_1.getAllOrders);
router.get('/:id/tracking', auth_1.authenticate, orderController_1.getOrderTracking); // More specific route first
router.get('/:id', auth_1.authenticate, orderController_1.getOrderById);
router.put('/:id/status', auth_1.authenticate, (0, auth_1.authorize)('admin'), (0, validator_1.validate)(validators_1.updateOrderStatusSchema), orderController_1.updateOrderStatus);
router.put('/:id/tracking', auth_1.authenticate, (0, auth_1.authorize)('admin'), orderController_1.updateOrderTracking);
router.put('/:id/cancel', auth_1.authenticate, (0, auth_1.authorize)('customer'), orderController_1.cancelOrder);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map