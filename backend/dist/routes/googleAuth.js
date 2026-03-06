"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleAuthController_1 = require("../controllers/googleAuthController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/google', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('THERAPIST'), googleAuthController_1.initiateGoogleOAuth);
router.get('/google/callback', googleAuthController_1.googleOAuthCallback);
exports.default = router;
//# sourceMappingURL=googleAuth.js.map