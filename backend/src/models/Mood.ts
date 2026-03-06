import mongoose, { Schema, Document } from 'mongoose';

export enum MoodType {
    VERY_SAD = 'VERY_SAD',
    SAD = 'SAD',
    NEUTRAL = 'NEUTRAL',
    HAPPY = 'HAPPY',
    VERY_HAPPY = 'VERY_HAPPY'
}

export interface IMoodLog extends Document {
    userId: mongoose.Types.ObjectId | string;

    mood: MoodType | string;
    intensity: number;
    note?: string;

    mongoDocId?: string;

    loggedAt: Date;

    createdAt: Date;
    updatedAt: Date;
}

const MoodLogSchema = new Schema<IMoodLog>({
    userId: { type: Schema.Types.Mixed, required: true },

    mood: { type: String, required: true },
    intensity: { type: Number },
    note: { type: String },

    mongoDocId: { type: String },

    loggedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export default mongoose.models.MoodLog || mongoose.model<IMoodLog>('MoodLog', MoodLogSchema);
