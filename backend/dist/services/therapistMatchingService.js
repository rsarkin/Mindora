"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TherapistMatchingService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class TherapistMatchingService {
    async requestTherapist(userId, preferences) {
        // Return dummy data if DB is not connected or just for demo
        return {
            therapistId: 'mock_therapist_1',
            name: 'Dr. Sarah Wilson',
            specialization: 'Anxiety & Depression',
            rating: 4.9,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            availability: 'Available Now'
        };
    }
    async assignEmergencyTherapist(userId, crisisLevel) {
        return {
            therapistId: 'mock_emergency_1',
            name: 'Dr. Robert Chen',
            specialization: 'Crisis Intervention',
            rating: 5.0,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
            priority: 'IMMEDIATE'
        };
    }
    async getAllTherapists() {
        const Therapist = mongoose_1.default.model('Therapist');
        const therapists = await Therapist.find({
        // Optionally we can only show verified therapists:
        // verificationStatus: 'VERIFIED'
        })
            .populate('userId', 'name avatar location email')
            .lean();
        return therapists;
    }
}
exports.TherapistMatchingService = TherapistMatchingService;
//# sourceMappingURL=therapistMatchingService.js.map