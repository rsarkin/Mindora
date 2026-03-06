"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const slotController_1 = require("../controllers/slotController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Therapist routes
router.post('/', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('THERAPIST'), slotController_1.createSlot);
router.post('/toggle', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('THERAPIST'), slotController_1.toggleSlot);
router.get('/my-slots', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('THERAPIST'), slotController_1.getMySlots);
router.delete('/:id', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('THERAPIST'), slotController_1.deleteSlot);
// Public / Patient routes (requires auth to book, but maybe anyone can view slots?)
router.get('/therapist/:therapistId', auth_1.authMiddleware, slotController_1.getTherapistAvailableSlots);
exports.default = router;
//# sourceMappingURL=slots.js.map