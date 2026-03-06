"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const therapistController_1 = require("../controllers/therapistController");
const router = express_1.default.Router();
// Dashboard & Management
router.get('/dashboard/stats', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('THERAPIST'), therapistController_1.getDashboardStats);
router.get('/my-patients', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('THERAPIST'), therapistController_1.getPatients);
router.get('/profile', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('THERAPIST'), therapistController_1.getTherapistProfile);
router.post('/profile', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('THERAPIST'), therapistController_1.updateProfile);
router.post('/request', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('PATIENT'), therapistController_1.requestTherapist);
router.get('/', therapistController_1.getTherapists);
router.get('/:id', therapistController_1.getTherapistById);
exports.default = router;
//# sourceMappingURL=therapist.js.map