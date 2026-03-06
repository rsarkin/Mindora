"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const validators_1 = require("../middleware/validators");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    dest: 'uploads/',
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});
const router = express_1.default.Router();
router.post('/register', upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'documents', maxCount: 2 }
]), validators_1.registerValidator, authController_1.register);
router.post('/login', validators_1.loginValidator, authController_1.login);
router.post('/anonymous', authController_1.createAnonymousSession);
router.get('/session-status/:sessionId', authController_1.getSessionStatus);
exports.default = router;
//# sourceMappingURL=auth.js.map