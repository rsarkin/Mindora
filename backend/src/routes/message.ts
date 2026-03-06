import express from 'express';
import { getAppointmentMessages } from '../controllers/messageController';

const router = express.Router();

router.get('/:appointmentId', getAppointmentMessages);

export default router;
