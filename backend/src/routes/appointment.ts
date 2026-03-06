import express from 'express';
import { authorizeRoles } from '../middleware/auth';
import {
    createAppointment,
    getTherapistAppointments,
    updateAppointmentStatus,
    getPatientAppointments,
    createChatConnection,
    cancelAppointment,
    getAppointmentById
} from '../controllers/appointmentController';
import { appointmentValidator, updateAppointmentStatusValidator } from '../middleware/validators';

const router = express.Router();

// Specific Routes (must come before /:id)
router.get('/therapist', authorizeRoles('THERAPIST'), getTherapistAppointments);
router.get('/my-appointments', authorizeRoles('PATIENT'), getPatientAppointments);

// General Paths
router.post('/', authorizeRoles('PATIENT'), appointmentValidator, createAppointment);
router.post('/chat', authorizeRoles('PATIENT'), createChatConnection);

// Parametrized Routes (must come last)
router.get('/:id', authorizeRoles('THERAPIST', 'PATIENT'), getAppointmentById);
router.patch('/:id/status', authorizeRoles('THERAPIST'), updateAppointmentStatusValidator, updateAppointmentStatus);
router.post('/:id/cancel', cancelAppointment);

export default router;
