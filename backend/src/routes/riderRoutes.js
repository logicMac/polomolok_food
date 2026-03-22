"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const riderController_1 = require("../controllers/riderController");
const auth_1 = require("../middlewares/auth");
const multer_1 = require("../config/multer");
const router = express_1.default.Router();
// Admin routes
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin'), multer_1.upload.single('image'), riderController_1.createRider);
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('admin'), riderController_1.getAllRiders);
router.get('/available', auth_1.authenticate, (0, auth_1.authorize)('admin'), riderController_1.getAvailableRiders);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), multer_1.upload.single('image'), riderController_1.updateRider);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), riderController_1.deleteRider);
router.post('/assign-order', auth_1.authenticate, (0, auth_1.authorize)('admin'), riderController_1.assignOrderToRider);
// Rider routes
router.get('/my-deliveries', auth_1.authenticate, (0, auth_1.authorize)('rider'), riderController_1.getMyDeliveries);
router.put('/location', auth_1.authenticate, (0, auth_1.authorize)('rider'), riderController_1.updateLocation);
router.put('/delivery/:orderId/status', auth_1.authenticate, (0, auth_1.authorize)('rider'), riderController_1.updateDeliveryStatus);
router.put('/toggle-availability', auth_1.authenticate, (0, auth_1.authorize)('rider'), riderController_1.toggleAvailability);
exports.default = router;
//# sourceMappingURL=riderRoutes.js.map