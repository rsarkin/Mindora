import mongoose, { Schema, Document } from 'mongoose';

export enum TaskSource {
    AI = 'ai',
    MANUAL = 'manual'
}

export enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'inprogress',
    DONE = 'done'
}

export enum TaskCategory {
    MENTAL = 'mental',
    PHYSICAL = 'physical',
    BEHAVIORAL = 'behavioral',
    SOCIAL = 'social'
}

export enum TaskFrequency {
    ONCE = 'once',
    DAILY = 'daily',
    WEEKLY = 'weekly'
}

export enum ApprovalStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export interface IWellnessTask extends Document {
    patientId: mongoose.Types.ObjectId;
    sourceDescriptionId?: mongoose.Types.ObjectId;
    source: TaskSource;
    status: TaskStatus;
    category: TaskCategory;
    title: string;
    description?: string;
    durationMinutes?: number;
    frequency: TaskFrequency;
    dueDate?: Date;
    completedAt?: Date;
    approvalStatus: ApprovalStatus;
    therapistNote?: string;
    createdAt: Date;
    updatedAt: Date;
}

const WellnessTaskSchema = new Schema<IWellnessTask>({
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sourceDescriptionId: { type: Schema.Types.ObjectId, ref: 'ProblemDescription' },
    source: { type: String, enum: Object.values(TaskSource), required: true },
    status: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.TODO },
    category: { type: String, enum: Object.values(TaskCategory), required: true },
    title: { type: String, required: true },
    description: { type: String },
    durationMinutes: { type: Number },
    frequency: { type: String, enum: Object.values(TaskFrequency), required: true },
    dueDate: { type: Date },
    completedAt: { type: Date },
    approvalStatus: { type: String, enum: Object.values(ApprovalStatus), default: ApprovalStatus.APPROVED },
    therapistNote: { type: String }
}, {
    timestamps: true
});

WellnessTaskSchema.pre<IWellnessTask>('save', function (next) {
    if (this.isModified('status') && this.status === TaskStatus.DONE && !this.completedAt) {
        this.completedAt = new Date();
    }
    next();
});

export default mongoose.model<IWellnessTask>('WellnessTask', WellnessTaskSchema);
