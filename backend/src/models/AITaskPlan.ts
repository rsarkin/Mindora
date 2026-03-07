import mongoose, { Schema, Document } from 'mongoose';

export interface IAITaskPlan extends Document {
    patientId: mongoose.Types.ObjectId;
    descriptionId: mongoose.Types.ObjectId;
    taskIds: mongoose.Types.ObjectId[];
    geminiRawResponse?: string;
    generatedAt: Date;
}

const AITaskPlanSchema = new Schema<IAITaskPlan>({
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    descriptionId: { type: Schema.Types.ObjectId, ref: 'ProblemDescription', required: true },
    taskIds: [{ type: Schema.Types.ObjectId, ref: 'WellnessTask' }],
    geminiRawResponse: { type: String },
    generatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAITaskPlan>('AITaskPlan', AITaskPlanSchema);
