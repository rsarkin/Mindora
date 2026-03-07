import { Request, Response } from 'express';
import { moodService } from '../services/moodService';
import User from '../models/User';
import logger from '../utils/logger';

export const saveMood = async (req: Request, res: Response) => {
    try {
        const { mood, note } = req.body;
        const userId = (req as any).user?.id;

        if (!mood) {
            return res.status(400).json({ message: 'Mood is required' });
        }

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const savedMood = await moodService.saveMood(userId, mood, note);
        let updatedUser = null;

        // Award 5 points for mood log
        const user = await User.findById(userId);
        if (user) {
            user.points = (user.points || 0) + 5;
            updatedUser = await user.save();
            logger.info(`[Gamification] User ${userId} earned 5 points for mood log`);
        }

        res.status(201).json({
            ...savedMood.toObject(),
            points: updatedUser?.points || user?.points,
            badges: updatedUser?.badges || user?.badges
        });
    } catch (error) {
        res.status(500).json({ message: 'Error saving mood', error });
    }
};

export const saveQuickMood = async (req: Request, res: Response) => {
    try {
        const { mood } = req.body;
        const userId = (req as any).user?.id;

        if (!mood) {
            return res.status(400).json({ message: 'Mood is required' });
        }

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const savedMood = await moodService.saveMood(userId, mood, 'Quick Log');
        let updatedUser = null;

        // Award 5 points for quick mood log
        const user = await User.findById(userId);
        if (user) {
            user.points = (user.points || 0) + 5;
            updatedUser = await user.save();
            logger.info(`[Gamification] User ${userId} earned 5 points for quick mood log`);
        }

        res.status(201).json({
            ...savedMood.toObject(),
            points: updatedUser?.points || user?.points,
            badges: updatedUser?.badges || user?.badges
        });
    } catch (error) {
        res.status(500).json({ message: 'Error saving quick mood', error });
    }
};

export const getMoodHistory = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId || (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Allow therapists to view other users' mood, or users to view their own
        // For now, we'll assume if a userId param is provided, it's a therapist viewing a patient

        const history = await moodService.getMoodHistory(userId);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching mood history', error });
    }
};
