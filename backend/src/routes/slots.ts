import express from 'express';
import { createSlot, getMySlots, deleteSlot, getTherapistAvailableSlots, toggleSlot } from '../controllers/slotController';
import { authMiddleware, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Therapist routes
router.post('/', authMiddleware, authorizeRoles('THERAPIST'), createSlot);
router.post('/toggle', authMiddleware, authorizeRoles('THERAPIST'), toggleSlot);
router.get('/my-slots', authMiddleware, authorizeRoles('THERAPIST'), getMySlots);
router.delete('/:id', authMiddleware, authorizeRoles('THERAPIST'), deleteSlot);

// Public / Patient routes (requires auth to book, but maybe anyone can view slots?)
router.get('/therapist/:therapistId', authMiddleware, getTherapistAvailableSlots);

export default router;
