import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
    PATIENT = 'PATIENT',
    THERAPIST = 'THERAPIST',
    ADMIN = 'ADMIN'
}

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    DEACTIVATED = 'DEACTIVATED',
    PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

export interface IUser extends Document {
    email: string;
    passwordHash?: string;
    name: string;
    phone?: string;
    avatar?: string;
    role: UserRole;
    accountStatus: AccountStatus;

    googleId?: string;
    appleId?: string;

    dateOfBirth?: Date;
    gender?: string;
    location?: string;
    occupation?: string;
    diagnosis?: string[];
    medications?: string[];
    emergencyContact?: any; // JSON object

    consentedAt?: Date;
    dataRetentionDays: number;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;

    lastLoginAt?: Date;
    streak?: number;
    points: number;
    badges: string[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    name: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.PATIENT },
    accountStatus: { type: String, enum: Object.values(AccountStatus), default: AccountStatus.ACTIVE },

    googleId: { type: String, unique: true, sparse: true },
    appleId: { type: String, unique: true, sparse: true },

    dateOfBirth: { type: Date },
    gender: { type: String },
    location: { type: String },
    occupation: { type: String },
    diagnosis: [{ type: String }],
    medications: [{ type: String }],
    emergencyContact: { type: Schema.Types.Mixed },

    consentedAt: { type: Date },
    dataRetentionDays: { type: Number, default: 2555 },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },

    lastLoginAt: { type: Date },
    streak: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    badges: [{ type: String, default: [] }]
}, {
    timestamps: true
});

UserSchema.pre('findOneAndDelete', async function (next) {
    const docToDelete = await this.model.findOne(this.getQuery());
    if (docToDelete) {
        if (docToDelete.role === UserRole.THERAPIST) {
            await mongoose.model('Therapist').findOneAndDelete({ userId: docToDelete._id });
        }
        await mongoose.model('Appointment').deleteMany({ patientId: docToDelete._id });
    }
    next();
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
