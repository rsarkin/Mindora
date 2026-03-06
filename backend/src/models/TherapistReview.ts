import mongoose, { Schema, Document } from 'mongoose';

export interface ITherapistReview extends Document {
    therapistId: mongoose.Types.ObjectId;
    patientId: string; // Keep as string in case it's anonymous

    rating: number; // 1-5
    comment?: string;
    isVisible: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const TherapistReviewSchema = new Schema<ITherapistReview>({
    therapistId: { type: Schema.Types.ObjectId, ref: 'Therapist', required: true },
    patientId: { type: String, required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    isVisible: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.models.TherapistReview || mongoose.model<ITherapistReview>('TherapistReview', TherapistReviewSchema);
