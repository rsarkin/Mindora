import mongoose, { Schema, Document } from 'mongoose';

export enum AnonymousSessionStatus {
    ACTIVE = 'ACTIVE',
    CONVERTED_TO_USER = 'CONVERTED_TO_USER',
    EXPIRED = 'EXPIRED'
}

export interface IAnonymousSession extends Document {
    deviceFingerprint: string;
    temporaryName?: string;
    messageCount: number;
    maxFreeMessages: number;

    status: AnonymousSessionStatus;
    convertedUserId?: mongoose.Types.ObjectId;
    convertedAt?: Date;

    initialMessage?: string;
    detectedLanguage?: string;
    detectedEmotion?: string;

    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AnonymousSessionSchema = new Schema<IAnonymousSession>({
    deviceFingerprint: { type: String, required: true, unique: true },
    temporaryName: { type: String },
    messageCount: { type: Number, default: 0 },
    maxFreeMessages: { type: Number, default: 5 },

    status: { type: String, enum: Object.values(AnonymousSessionStatus), default: AnonymousSessionStatus.ACTIVE },
    convertedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    convertedAt: { type: Date },

    initialMessage: { type: String },
    detectedLanguage: { type: String },
    detectedEmotion: { type: String },

    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
}, {
    timestamps: true
});

export default mongoose.models.AnonymousSession || mongoose.model<IAnonymousSession>('AnonymousSession', AnonymousSessionSchema);
