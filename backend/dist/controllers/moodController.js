"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMoodHistory = exports.saveQuickMood = exports.saveMood = void 0;
const moodService_1 = require("../services/moodService");
const saveMood = async (req, res) => {
    try {
        const { mood, note } = req.body;
        const userId = req.user?.id; // Extracted from auth middleware
        if (!mood) {
            return res.status(400).json({ message: 'Mood is required' });
        }
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const savedMood = await moodService_1.moodService.saveMood(userId, mood, note);
        res.status(201).json(savedMood);
    }
    catch (error) {
        res.status(500).json({ message: 'Error saving mood', error });
    }
};
exports.saveMood = saveMood;
const saveQuickMood = async (req, res) => {
    try {
        const { mood } = req.body;
        const userId = req.user?.id;
        if (!mood) {
            return res.status(400).json({ message: 'Mood is required' });
        }
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const savedMood = await moodService_1.moodService.saveMood(userId, mood, 'Quick Log');
        res.status(201).json(savedMood);
    }
    catch (error) {
        res.status(500).json({ message: 'Error saving quick mood', error });
    }
};
exports.saveQuickMood = saveQuickMood;
const getMoodHistory = async (req, res) => {
    try {
        const userId = req.params.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Allow therapists to view other users' mood, or users to view their own
        // For now, we'll assume if a userId param is provided, it's a therapist viewing a patient
        const history = await moodService_1.moodService.getMoodHistory(userId);
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching mood history', error });
    }
};
exports.getMoodHistory = getMoodHistory;
//# sourceMappingURL=moodController.js.map