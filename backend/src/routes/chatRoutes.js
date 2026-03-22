"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const chatController_1 = require("../controllers/chatController");
const router = express_1.default.Router();
router.post('/messages', auth_1.authenticate, chatController_1.sendMessage);
router.get('/messages', auth_1.authenticate, chatController_1.getMessages);
router.put('/messages/read', auth_1.authenticate, chatController_1.markAsRead);
router.get('/messages/unread-count', auth_1.authenticate, chatController_1.getUnreadCount);
exports.default = router;
//# sourceMappingURL=chatRoutes.js.map