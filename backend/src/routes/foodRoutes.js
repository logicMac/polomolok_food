"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const foodController_1 = require("../controllers/foodController");
const auth_1 = require("../middlewares/auth");
const multer_1 = require("../config/multer");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = express_1.default.Router();
router.get('/', foodController_1.getAllFoods);
router.get('/:id', foodController_1.getFoodById);
router.post('/', rateLimiter_1.foodManagementLimiter, rateLimiter_1.uploadLimiter, auth_1.authenticate, (0, auth_1.authorize)('admin'), multer_1.upload.single('image'), foodController_1.createFood);
router.put('/:id', rateLimiter_1.foodManagementLimiter, rateLimiter_1.uploadLimiter, auth_1.authenticate, (0, auth_1.authorize)('admin'), multer_1.upload.single('image'), foodController_1.updateFood);
router.delete('/:id', rateLimiter_1.foodManagementLimiter, auth_1.authenticate, (0, auth_1.authorize)('admin'), foodController_1.deleteFood);
exports.default = router;
//# sourceMappingURL=foodRoutes.js.map