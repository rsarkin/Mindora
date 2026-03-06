import mongoose, { Schema, Document } from 'mongoose';

export interface IPodPost extends Document {
    podId: mongoose.Types.ObjectId;
    authorId: mongoose.Types.ObjectId;
    content: string;
    isFlagged: boolean;
    flaggedReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PodPostSchema = new Schema({
    podId: { type: Schema.Types.ObjectId, ref: 'Pod', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    isFlagged: { type: Boolean, default: false },
    flaggedReason: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<IPodPost>('PodPost', PodPostSchema);
