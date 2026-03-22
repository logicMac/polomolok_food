"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('admin'), userController_1.getAllUsers);
router.get('/statistics', auth_1.authenticate, (0, auth_1.authorize)('admin'), userController_1.getStatistics);
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), userController_1.getUserById);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), userController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map