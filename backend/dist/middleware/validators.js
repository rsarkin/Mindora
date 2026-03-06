"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentStatusValidator = exports.appointmentValidator = exports.loginValidator = exports.registerValidator = exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.error('Validation Error:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validateRequest = validateRequest;
exports.registerValidator = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('role').optional().isIn(['PATIENT', 'THERAPIST', 'ADMIN', 'patient', 'therapist', 'admin']).withMessage('Invalid role'),
    // Therapist extended validations (optional for patients, required logic handled in service if needed)
    (0, express_validator_1.body)('licenseNumber').optional().isString(),
    (0, express_validator_1.body)('licenseState').optional().isString(),
    (0, express_validator_1.body)('specializations').optional(),
    (0, express_validator_1.body)('experienceYears').optional().isNumeric(),
    (0, express_validator_1.body)('hourlyRate').optional().isNumeric(),
    (0, express_validator_1.body)('bio').optional().isString(),
    (0, express_validator_1.body)('phone').optional().isString(),
    (0, express_validator_1.body)('location').optional().isString(),
    exports.validateRequest
];
exports.loginValidator = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email address'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
    exports.validateRequest
];
exports.appointmentValidator = [
    (0, express_validator_1.body)('therapistId').isMongoId().withMessage('Valid therapist ID is required'),
    (0, express_validator_1.body)('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Valid date is required (YYYY-MM-DD)'),
    (0, express_validator_1.body)('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required (HH:MM)'),
    (0, express_validator_1.body)('type').optional().isIn(['VIDEO_CALL', 'AUDIO_CALL', 'CHAT_ONLY', 'IN_PERSON']).withMessage('Invalid appointment type'),
    exports.validateRequest
];
exports.updateAppointmentStatusValidator = [
    (0, express_validator_1.body)('status').isIn(['CONFIRMED', 'COMPLETED', 'CANCELLED_BY_PATIENT', 'CANCELLED_BY_THERAPIST', 'NO_SHOW']).withMessage('Invalid status'),
    (0, express_validator_1.body)('meetingLink').optional().isString().withMessage('Invalid meeting link string'),
    exports.validateRequest
];
//# sourceMappingURL=validators.js.map