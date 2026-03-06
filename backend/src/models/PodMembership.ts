import mongoose, { Schema, Document } from 'mongoose';

export enum PodRole {
    MEMBER = 'MEMBER',
    MODERATOR = 'MODERATOR'
}

export interface IPodMembership extends Document {
    podId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    role: PodRole;
    banned: boolean;
    joinedAt: Date;
}

const PodMembershipSchema = new Schema({
    podId: { type: Schema.Types.ObjectId, ref: 'Pod', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: Object.values(PodRole), default: PodRole.MEMBER },
    banned: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Ensure a user can only have one membership per pod
PodMembershipSchema.index({ podId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IPodMembership>('PodMembership', PodMembershipSchema);
