import express from 'express';
import { saveNote, getNoteHistory, getNote } from '../controllers/noteController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/:appointmentId', authMiddleware, saveNote);
router.get('/:appointmentId', authMiddleware, getNote);
router.get('/history/patient/:patientId', authMiddleware, getNoteHistory);

export default router;
