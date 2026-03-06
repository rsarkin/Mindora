import express from 'express';
import { authMiddleware, authorizeRoles } from '../middleware/auth';
import {
    getTherapists,
    requestTherapist,
    getDashboardStats,
    getPatients,
    getPatientDetailsForTherapist,
    updateProfile,
    getTherapistProfile,
    getTherapistById,
    getEarningsStats,
    getTherapistSettings,
    updateTherapistSettings
} from '../controllers/therapistController';

const router = express.Router();

// Dashboard & Management
router.get('/dashboard/stats', authMiddleware, authorizeRoles('THERAPIST'), getDashboardStats);
router.get('/my-patients', authMiddleware, authorizeRoles('THERAPIST'), getPatients);
router.get('/patients/:id', authMiddleware, authorizeRoles('THERAPIST'), getPatientDetailsForTherapist);
router.get('/profile', authMiddleware, authorizeRoles('THERAPIST'), getTherapistProfile);
router.post('/profile', authMiddleware, authorizeRoles('THERAPIST'), updateProfile);
router.get('/earnings-stats', authMiddleware, authorizeRoles('THERAPIST'), getEarningsStats);
router.get('/settings', authMiddleware, authorizeRoles('THERAPIST'), getTherapistSettings);
router.patch('/settings', authMiddleware, authorizeRoles('THERAPIST'), updateTherapistSettings);
router.post('/request', authMiddleware, authorizeRoles('PATIENT'), requestTherapist);

router.get('/', getTherapists);
router.get('/:id', getTherapistById);

export default router;
