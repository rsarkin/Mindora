import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Validation Error:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const registerValidator = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['PATIENT', 'THERAPIST', 'ADMIN', 'patient', 'therapist', 'admin']).withMessage('Invalid role'),
    // Therapist extended validations (optional for patients, required logic handled in service if needed)
    body('licenseNumber').optional().isString(),
    body('licenseState').optional().isString(),
    body('specializations').optional(),
    body('experienceYears').optional().isNumeric(),
    body('hourlyRate').optional().isNumeric(),
    body('bio').optional().isString(),
    body('phone').optional().isString(),
    body('location').optional().isString(),
    validateRequest
];

export const loginValidator = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
];

export const appointmentValidator = [
    body('therapistId').isMongoId().withMessage('Valid therapist ID is required'),
    body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Valid date is required (YYYY-MM-DD)'),
    body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required (HH:MM)'),
    body('type').optional().isIn(['VIDEO_CALL', 'AUDIO_CALL', 'CHAT_ONLY', 'IN_PERSON']).withMessage('Invalid appointment type'),
    validateRequest
];

export const updateAppointmentStatusValidator = [
    body('status').isIn(['CONFIRMED', 'COMPLETED', 'CANCELLED_BY_PATIENT', 'CANCELLED_BY_THERAPIST', 'NO_SHOW']).withMessage('Invalid status'),
    body('meetingLink').optional().isString().withMessage('Invalid meeting link string'),
    validateRequest
];
