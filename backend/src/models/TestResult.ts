import mongoose, { Schema, Document } from 'mongoose';

export interface ITestResult extends Document {
    userId: mongoose.Types.ObjectId;
    testType: 'iq' | 'eq' | 'personality' | 'stress' | 'anxiety';
    score: number;
    details: any;
    interpretation: string;
    completedAt: Date;
}

const TestResultSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    testType: { type: String, enum: ['iq', 'eq', 'personality', 'stress', 'anxiety'], required: true },
    score: { type: Number, required: true },
    details: { type: Schema.Types.Mixed },
    interpretation: { type: String },
    completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<ITestResult>('TestResult', TestResultSchema);
