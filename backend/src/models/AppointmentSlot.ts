import mongoose, { Schema, Document } from 'mongoose';

export enum SlotStatus {
    AVAILABLE = 'available',
    PENDING = 'pending',
    BOOKED = 'booked'
}

export interface IAppointmentSlot extends Document {
    therapistId: mongoose.Types.ObjectId;
    patientId?: mongoose.Types.ObjectId;
    startTime: Date;
    endTime: Date;
    status: SlotStatus;
    paymentOrderId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AppointmentSlotSchema = new Schema<IAppointmentSlot>({
    therapistId: { type: Schema.Types.ObjectId, ref: 'Therapist', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: Object.values(SlotStatus), default: SlotStatus.AVAILABLE },
    paymentOrderId: { type: String }
}, {
    timestamps: true
});

// Index for efficient querying of available slots
AppointmentSlotSchema.index({ therapistId: 1, startTime: 1, status: 1 });

export default mongoose.models.AppointmentSlot || mongoose.model<IAppointmentSlot>('AppointmentSlot', AppointmentSlotSchema);
