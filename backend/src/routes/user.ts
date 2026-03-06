import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { getNotifications, markNotificationsRead, updateSignInStreak } from '../controllers/userController';

const router = express.Router();

router.get('/notifications', authMiddleware, getNotifications);
router.post('/notifications/read', authMiddleware, markNotificationsRead);
router.post('/sign-in-streak', authMiddleware, updateSignInStreak);

export default router;
