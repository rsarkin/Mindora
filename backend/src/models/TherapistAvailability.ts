import mongoose, { Schema, Document } from 'mongoose';

export enum DayOfWeek {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY'
}

export interface ITherapistAvailability extends Document {
    therapistId: mongoose.Types.ObjectId;

    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    timezone: string;

    isRecurring: boolean;
    exceptionDate?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const TherapistAvailabilitySchema = new Schema<ITherapistAvailability>({
    therapistId: { type: Schema.Types.ObjectId, ref: 'Therapist', required: true },

    dayOfWeek: { type: String, enum: Object.values(DayOfWeek), required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    timezone: { type: String, default: 'UTC' },

    isRecurring: { type: Boolean, default: true },
    exceptionDate: { type: Date }
}, {
    timestamps: true
});

export default mongoose.models.TherapistAvailability || mongoose.model<ITherapistAvailability>('TherapistAvailability', TherapistAvailabilitySchema);
