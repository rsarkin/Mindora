import mongoose, { Schema, Document } from 'mongoose';

export enum ActivityType {
    SESSION_COMPLETED = 'SESSION_COMPLETED',
    SESSION_SCHEDULED = 'SESSION_SCHEDULED',
    MESSAGE_SENT = 'MESSAGE_SENT',
    NOTES_ADDED = 'NOTES_ADDED',
    APPOINTMENT_APPROVED = 'APPOINTMENT_APPROVED',
    APPOINTMENT_REJECTED = 'APPOINTMENT_REJECTED',
    PATIENT_ADDED = 'PATIENT_ADDED'
}

export interface IActivityLog extends Document {
    therapistId: mongoose.Types.ObjectId;

    actionType: ActivityType;
    relatedEntityId?: string;
    metadata?: any;

    createdAt: Date;
    updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
    therapistId: { type: Schema.Types.ObjectId, ref: 'Therapist', required: true },

    actionType: { type: String, enum: Object.values(ActivityType), required: true },
    relatedEntityId: { type: String },
    metadata: { type: Schema.Types.Mixed }
}, {
    timestamps: true
});

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
