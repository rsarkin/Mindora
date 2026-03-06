import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
    name: string;
    description: string;
    category: 'mental_health' | 'career' | 'couples' | 'test' | 'other';
    durationMinutes: number;
    price: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ServiceSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['mental_health', 'career', 'couples', 'test', 'other'], required: true },
    durationMinutes: { type: Number, required: true },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IService>('Service', ServiceSchema);
