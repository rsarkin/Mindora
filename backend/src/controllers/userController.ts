import { Request, Response } from 'express';
import User from '../models/User';
import logger from '../utils/logger';

/**
 * Updates the user's daily sign-in streak.
 * Logic:
 * - If first time: streak = 1
 * - If last login was yesterday: streak++
 * - If last login was today: no change
 * - If last login was > 48h ago: streak = 1 (reset)
 */
export const updateSignInStreak = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        logger.info(`[StreakDebug] Updating streak for user: ${userId}`);
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const now = new Date();
        const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
        let newStreak = user.streak || 0;

        if (!lastLogin) {
            newStreak = 1;
        } else {
            const isSameDay = now.toDateString() === lastLogin.toDateString();
            
            // Calculate if last login was yesterday
            const yesterday = new Date();
            yesterday.setDate(now.getDate() - 1);
            const isYesterday = yesterday.toDateString() === lastLogin.toDateString();

            if (isSameDay) {
                // Already updated today, just return current state
                return res.json({ streak: user.streak, lastLoginAt: user.lastLoginAt });
            } else if (isYesterday) {
                // Consecutive day
                newStreak += 1;
            } else {
                // Missed a day or more, reset to 1
                newStreak = 1;
            }
        }

        user.streak = newStreak;
        user.lastLoginAt = now;
        await user.save();

        logger.info(`[Streak] User ${userId} updated streak to ${newStreak}`);
        
        res.json({ 
            streak: user.streak, 
            lastLoginAt: user.lastLoginAt 
        });
    } catch (error: any) {
        logger.error('Error updating sign-in streak:', error);
        res.status(500).json({ message: 'Failed to update streak', error: error.message });
    }
};

export const getNotifications = async (req: Request, res: Response) => {
    try {
        // Return empty array for now as per previous placeholder, but structured
        res.json([]);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

export const markNotificationsRead = async (req: Request, res: Response) => {
    try {
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: 'Error marking notifications as read' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        // This would normally call authService.changePassword
        res.json({ success: true, message: 'Password changed successfully (mocked)' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error changing password' });
    }
};
