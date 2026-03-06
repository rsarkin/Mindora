import Mood, { IMoodLog } from '../models/Mood';
import { logger } from '../utils/logger';

class MoodService {
    public async saveMood(userId: string, mood: string, note?: string): Promise<IMoodLog> {
        return await Mood.create({
            userId,
            mood,
            note,
            loggedAt: new Date(),
        });
    }

    public async getMoodHistory(userId: string): Promise<IMoodLog[]> {
        return await Mood.find({ userId })
            .sort({ loggedAt: -1 })
            .lean();
    }
}

export const moodService = new MoodService();
