import express from 'express';
import { authMiddleware, authorizeRoles } from '../middleware/auth';
import {
    getTasks,
    createTask,
    updateTaskStatus,
    approveOrRejectTask,
    deleteTask,
    getPatientTasksForTherapist,
    addTherapistNote
} from '../controllers/taskController';

const router = express.Router();

router.get('/patient/tasks', authMiddleware, authorizeRoles('PATIENT'), getTasks);
router.post('/patient/tasks', authMiddleware, authorizeRoles('PATIENT'), createTask);
router.patch('/patient/tasks/:taskId/status', authMiddleware, authorizeRoles('PATIENT'), updateTaskStatus);
router.patch('/patient/tasks/:taskId/approve', authMiddleware, authorizeRoles('PATIENT'), approveOrRejectTask);
router.delete('/patient/tasks/:taskId', authMiddleware, authorizeRoles('PATIENT'), deleteTask);

router.get('/therapist/patients/:patientId/tasks', authMiddleware, authorizeRoles('THERAPIST'), getPatientTasksForTherapist);
router.patch('/therapist/patients/:patientId/tasks/:taskId/note', authMiddleware, authorizeRoles('THERAPIST'), addTherapistNote);

export default router;
