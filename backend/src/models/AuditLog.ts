import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    adminId: mongoose.Types.ObjectId;
    action: string;
    targetId?: string;
    targetType?: string;
    details: string;
    ipAddress?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetId: { type: String },
    targetType: { type: String },
    details: { type: String, required: true },
    ipAddress: { type: String }
}, {
    timestamps: true
});

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
