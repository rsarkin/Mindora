import mongoose, { Schema, Document } from 'mongoose';

export enum ConsentType {
    TERMS_OF_SERVICE = 'TERMS_OF_SERVICE',
    PRIVACY_POLICY = 'PRIVACY_POLICY',
    DATA_SHARING = 'DATA_SHARING',
    CRISIS_INTERVENTION = 'CRISIS_INTERVENTION',
    RECORDING_CONSENT = 'RECORDING_CONSENT'
}

export interface IConsentLog extends Document {
    userId: mongoose.Types.ObjectId;

    consentType: ConsentType;
    granted: boolean;

    ipAddress?: string;
    userAgent?: string;
    grantedAt: Date;

    policyVersion: string;

    createdAt: Date;
    updatedAt: Date;
}

const ConsentLogSchema = new Schema<IConsentLog>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    consentType: { type: String, enum: Object.values(ConsentType), required: true },
    granted: { type: Boolean, default: true },

    ipAddress: { type: String },
    userAgent: { type: String },
    grantedAt: { type: Date, default: Date.now },

    policyVersion: { type: String, default: '1.0' }
}, {
    timestamps: true
});

export default mongoose.models.ConsentLog || mongoose.model<IConsentLog>('ConsentLog', ConsentLogSchema);
