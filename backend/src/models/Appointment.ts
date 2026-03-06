import mongoose, { Schema, Document } from 'mongoose';

export enum AppointmentStatus {
    SCHEDULED = 'SCHEDULED',
    CONFIRMED = 'CONFIRMED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED_BY_PATIENT = 'CANCELLED_BY_PATIENT',
    CANCELLED_BY_THERAPIST = 'CANCELLED_BY_THERAPIST',
    NO_SHOW = 'NO_SHOW'
}

export enum AppointmentType {
    VIDEO_CALL = 'VIDEO_CALL',
    AUDIO_CALL = 'AUDIO_CALL',
    CHAT_ONLY = 'CHAT_ONLY',
    IN_PERSON = 'IN_PERSON'
}

export interface IAppointment extends Document {
    patientId: mongoose.Types.ObjectId;
    therapistId: mongoose.Types.ObjectId;

    scheduledAt: Date;
    durationMinutes: number;
    timezone: string;

    status: AppointmentStatus;
    type: AppointmentType;

    videoRoomId?: string;
    videoCallStartedAt?: Date;
    videoCallEndedAt?: Date;

    sessionNotesId?: string;

    isCrisisSession: boolean;
    crisisLevel?: number;

    cancelledAt?: Date;
    cancellationReason?: string;

    patientRating?: number;
    therapistRating?: number;
    patientFeedback?: string;

    slotId?: mongoose.Types.ObjectId;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    googleMeetLink?: string;
    cancellationInitiator?: 'patient' | 'therapist';

    createdAt: Date;
    updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'Therapist', required: true },

    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    timezone: { type: String, default: 'UTC' },

    status: { type: String, enum: Object.values(AppointmentStatus), default: AppointmentStatus.SCHEDULED },
    type: { type: String, enum: Object.values(AppointmentType), default: AppointmentType.VIDEO_CALL },

    videoRoomId: { type: String, unique: true, sparse: true },
    videoCallStartedAt: { type: Date },
    videoCallEndedAt: { type: Date },

    sessionNotesId: { type: String },

    isCrisisSession: { type: Boolean, default: false },
    crisisLevel: { type: Number },

    cancelledAt: { type: Date },
    cancellationReason: { type: String },

    patientRating: { type: Number },
    therapistRating: { type: Number },
    patientFeedback: { type: String },

    slotId: { type: Schema.Types.ObjectId, ref: 'AppointmentSlot' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    googleMeetLink: { type: String },
    cancellationInitiator: { type: String, enum: ['patient', 'therapist'] }
}, {
    timestamps: true
});

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
