"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
router.get('/notifications', auth_1.authMiddleware, userController_1.getNotifications);
router.post('/notifications/read', auth_1.authMiddleware, userController_1.markNotificationsRead);
router.post('/sign-in-streak', auth_1.authMiddleware, userController_1.updateSignInStreak);
exports.default = router;
//# sourceMappingURL=user.js.map