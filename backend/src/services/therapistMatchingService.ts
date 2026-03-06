import mongoose from 'mongoose';

export class TherapistMatchingService {
    async requestTherapist(userId: string, preferences: any): Promise<any> {
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

    async assignEmergencyTherapist(userId: string, crisisLevel: number): Promise<any> {
        return {
            therapistId: 'mock_emergency_1',
            name: 'Dr. Robert Chen',
            specialization: 'Crisis Intervention',
            rating: 5.0,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
            priority: 'IMMEDIATE'
        };
    }

    async getAllTherapists(): Promise<any[]> {
        const Therapist = mongoose.model('Therapist');
        const therapists = await Therapist.find({
            // Optionally we can only show verified therapists:
            // verificationStatus: 'VERIFIED'
        })
            .populate('userId', 'name avatar location email')
            .lean();

        return therapists;
    }
}
