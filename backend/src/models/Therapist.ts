import mongoose, { Schema, Document } from 'mongoose';

export enum TherapistVerificationStatus {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED'
}

export interface ITherapist extends Document {
    userId: mongoose.Types.ObjectId;

    licenseNumber: string;
    licenseState: string;
    licenseExpiryDate: Date;
    specializations: string[];
    certifications: string[];
    bio: string;
    experienceYears: number;
    languages: string[];

    verificationStatus: TherapistVerificationStatus;
    verificationDocuments: string[];
    verifiedAt?: Date;
    verifiedBy?: string;

    hourlyRateUSD: number;
    hourlyRateINR?: number;
    currency: string;
    feeStructure?: any;
    stripeAccountId?: string;
    razorpayAccountId?: string;

    isAcceptingPatients: boolean;
    maxPatientsPerWeek: number;

    averageRating?: number;
    totalReviews: number;

    totalEarningsUSD: number;
    totalSessionsCompleted: number;

    professionalTitle?: string;
    timezone?: string;
    emergencyRequests: boolean;
    publicProfile: boolean;
    notificationPreferences: {
        email: boolean;
        sms: boolean;
        push: boolean;
    };
    bankAccount?: {
        holderName: string;
        accountNumber: string;
        bankName: string;
        ifscCode: string;
    };

    googleAccessToken?: string;
    googleRefreshToken?: string;

    createdAt: Date;
    updatedAt: Date;
}

const TherapistSchema = new Schema<ITherapist>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    licenseNumber: { type: String, required: true, unique: true },
    licenseState: { type: String, required: true },
    licenseExpiryDate: { type: Date, required: true },
    specializations: [{ type: String }],
    certifications: [{ type: String }],
    bio: { type: String, required: true },
    experienceYears: { type: Number, default: 0 },
    languages: [{ type: String }],

    verificationStatus: { type: String, enum: Object.values(TherapistVerificationStatus), default: TherapistVerificationStatus.PENDING },
    verificationDocuments: [{ type: String }],
    verifiedAt: { type: Date },
    verifiedBy: { type: String },

    hourlyRateUSD: { type: Number, required: true },
    hourlyRateINR: { type: Number },
    currency: { type: String, default: 'INR' },
    feeStructure: { type: Schema.Types.Mixed },
    stripeAccountId: { type: String },
    razorpayAccountId: { type: String },

    isAcceptingPatients: { type: Boolean, default: true },
    maxPatientsPerWeek: { type: Number, default: 20 },

    averageRating: { type: Number },
    totalReviews: { type: Number, default: 0 },

    totalEarningsUSD: { type: Number, default: 0 },
    totalSessionsCompleted: { type: Number, default: 0 },

    professionalTitle: { type: String },
    timezone: { type: String, default: 'UTC+05:30' },
    emergencyRequests: { type: Boolean, default: false },
    publicProfile: { type: Boolean, default: true },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true }
    },
    bankAccount: {
        holderName: { type: String },
        accountNumber: { type: String },
        bankName: { type: String },
        ifscCode: { type: String }
    },

    googleAccessToken: { type: String },
    googleRefreshToken: { type: String }
}, {
    timestamps: true
});

export default mongoose.models.Therapist || mongoose.model<ITherapist>('Therapist', TherapistSchema);
