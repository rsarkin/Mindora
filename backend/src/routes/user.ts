import express from 'express';
import { authMiddleware } from '../middleware/auth';
import {
    getNotifications,
    markNotificationsRead,
    updateSignInStreak,
    rewardBreathingSession,
    changePassword,
    updatePreferences
} from '../controllers/userController';

const router = express.Router();

router.get('/notifications', authMiddleware, getNotifications);
router.post('/notifications/read', authMiddleware, markNotificationsRead);
router.post('/sign-in-streak', authMiddleware, updateSignInStreak);
router.post('/reward/breathing', authMiddleware, rewardBreathingSession);
router.post('/change-password', authMiddleware, changePassword);
router.patch('/preferences', authMiddleware, updatePreferences);

export default router;
