"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const moodController_1 = require("../controllers/moodController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('PATIENT'), moodController_1.saveMood);
router.post('/quick', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('PATIENT'), moodController_1.saveQuickMood);
router.get('/history/:userId?', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('PATIENT'), moodController_1.getMoodHistory); // userId is optional, defaults to current user if not provided
exports.default = router;
//# sourceMappingURL=mood.js.map