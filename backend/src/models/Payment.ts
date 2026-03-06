import mongoose, { Schema, Document } from 'mongoose';

export enum PaymentStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED'
}

export enum PaymentProvider {
    RAZORPAY = 'RAZORPAY',
    STRIPE = 'STRIPE',
    MANUAL = 'MANUAL'
}

export interface IPayment extends Document {
    userId: mongoose.Types.ObjectId;
    appointmentId?: mongoose.Types.ObjectId;

    amountUSD: number;
    amountINR?: number;
    currency: string;
    status: PaymentStatus;
    provider: PaymentProvider;

    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    stripePaymentIntent?: string;

    paidAt?: Date;
    refundedAt?: Date;

    description?: string;
    receiptUrl?: string;

    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', unique: true, sparse: true },

    amountUSD: { type: Number, required: true },
    amountINR: { type: Number },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
    provider: { type: String, enum: Object.values(PaymentProvider), default: PaymentProvider.RAZORPAY },

    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    stripePaymentIntent: { type: String, unique: true, sparse: true },

    paidAt: { type: Date },
    refundedAt: { type: Date },

    description: { type: String },
    receiptUrl: { type: String }
}, {
    timestamps: true
});

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
