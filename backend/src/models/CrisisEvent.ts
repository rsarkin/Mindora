import mongoose, { Schema, Document } from 'mongoose';

export enum CrisisStatus {
    PENDING = 'PENDING',
    ESCALATED = 'ESCALATED',
    RESOLVED = 'RESOLVED',
    FALSE_POSITIVE = 'FALSE_POSITIVE',
    IGNORED = 'IGNORED'
}

export interface ICrisisEvent extends Document {
    userId: mongoose.Types.ObjectId;
    conversationId?: string;

    crisisLevel: number;
    sentimentScore?: number;
    keywordsDetected: string[];

    urgency: string;
    requiresEscalation: boolean;

    status: CrisisStatus;
    actionTaken?: string;

    resolutionNotes?: string;
    resolvedAt?: Date;
    resolvedBy?: string;

    createdAt: Date;
    updatedAt: Date;
}

const CrisisEventSchema = new Schema<ICrisisEvent>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    conversationId: { type: String },

    crisisLevel: { type: Number, required: true },
    sentimentScore: { type: Number },
    keywordsDetected: [{ type: String }],

    urgency: { type: String, required: true },
    requiresEscalation: { type: Boolean, default: false },

    status: { type: String, enum: Object.values(CrisisStatus), default: CrisisStatus.PENDING },
    actionTaken: { type: String },

    resolutionNotes: { type: String },
    resolvedAt: { type: Date },
    resolvedBy: { type: String }
}, {
    timestamps: true
});

export default mongoose.models.CrisisEvent || mongoose.model<ICrisisEvent>('CrisisEvent', CrisisEventSchema);
