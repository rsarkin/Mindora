"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const appointmentController_1 = require("../controllers/appointmentController");
const validators_1 = require("../middleware/validators");
const router = express_1.default.Router();
// Specific Routes (must come before /:id)
router.get('/therapist', (0, auth_1.authorizeRoles)('THERAPIST'), appointmentController_1.getTherapistAppointments);
router.get('/my-appointments', (0, auth_1.authorizeRoles)('PATIENT'), appointmentController_1.getPatientAppointments);
// General Paths
router.post('/', (0, auth_1.authorizeRoles)('PATIENT'), validators_1.appointmentValidator, appointmentController_1.createAppointment);
router.post('/chat', (0, auth_1.authorizeRoles)('PATIENT'), appointmentController_1.createChatConnection);
// Parametrized Routes (must come last)
router.get('/:id', (0, auth_1.authorizeRoles)('THERAPIST', 'PATIENT'), appointmentController_1.getAppointmentById);
router.patch('/:id/status', (0, auth_1.authorizeRoles)('THERAPIST'), validators_1.updateAppointmentStatusValidator, appointmentController_1.updateAppointmentStatus);
router.post('/:id/cancel', appointmentController_1.cancelAppointment);
exports.default = router;
//# sourceMappingURL=appointment.js.map