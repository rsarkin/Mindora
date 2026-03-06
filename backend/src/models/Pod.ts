import mongoose, { Schema, Document } from 'mongoose';

export interface IPod extends Document {
    communityId: mongoose.Types.ObjectId;
    name: string;
    currentMemberCount: number;
    weeklySessionDay: number; // 0 (Sunday) to 6 (Saturday)
    weeklySessionTime: string; // e.g., '18:00' (24-hour format)
    createdAt: Date;
    updatedAt: Date;
}

const PodSchema = new Schema({
    communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    name: { type: String, required: true },
    currentMemberCount: { type: Number, default: 0, max: 15 },
    weeklySessionDay: { type: Number, required: true, min: 0, max: 6 },
    weeklySessionTime: { type: String, required: true }
}, {
    timestamps: true
});

export default mongoose.model<IPod>('Pod', PodSchema);
