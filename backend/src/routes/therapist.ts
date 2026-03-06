import express from 'express';
import { authMiddleware, authorizeRoles } from '../middleware/auth';
import {
    getTherapists,
    requestTherapist,
    getDashboardStats,
    getPatients,
    updateProfile,
    getTherapistProfile,
    getTherapistById
} from '../controllers/therapistController';

const router = express.Router();

// Dashboard & Management
router.get('/dashboard/stats', authMiddleware, authorizeRoles('THERAPIST'), getDashboardStats);
router.get('/my-patients', authMiddleware, authorizeRoles('THERAPIST'), getPatients);
router.get('/profile', authMiddleware, authorizeRoles('THERAPIST'), getTherapistProfile);
router.post('/profile', authMiddleware, authorizeRoles('THERAPIST'), updateProfile);
router.post('/request', authMiddleware, authorizeRoles('PATIENT'), requestTherapist);

router.get('/', getTherapists);
router.get('/:id', getTherapistById);

export default router;
