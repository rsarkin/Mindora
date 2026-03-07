import express from 'express';
import { authMiddleware, authorizeRoles } from '../middleware/auth';
import { 
    createOrUpdateDescription, 
    getActiveDescription, 
    getDescriptionHistory, 
    getPatientDescriptionForTherapist,
    regenerateAIPlan
} from '../controllers/descriptionController';

const router = express.Router();

router.post('/patient/description', authMiddleware, authorizeRoles('PATIENT'), createOrUpdateDescription);
router.get('/patient/description', authMiddleware, authorizeRoles('PATIENT'), getActiveDescription);
router.get('/patient/description/history', authMiddleware, authorizeRoles('PATIENT'), getDescriptionHistory);
router.post('/patient/description/generate-plan', authMiddleware, authorizeRoles('PATIENT'), regenerateAIPlan);
router.get('/therapist/patients/:patientId/description', authMiddleware, authorizeRoles('THERAPIST'), getPatientDescriptionForTherapist);

export default router;
