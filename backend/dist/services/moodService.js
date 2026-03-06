"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moodService = void 0;
const Mood_1 = __importDefault(require("../models/Mood"));
class MoodService {
    async saveMood(userId, mood, note) {
        return await Mood_1.default.create({
            userId,
            mood,
            note,
            loggedAt: new Date(),
        });
    }
    async getMoodHistory(userId) {
        return await Mood_1.default.find({ userId })
            .sort({ loggedAt: -1 })
            .lean();
    }
}
exports.moodService = new MoodService();
//# sourceMappingURL=moodService.js.map