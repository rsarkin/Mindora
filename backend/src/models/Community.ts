import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunity extends Document {
    name: string;
    description: string;
    category: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CommunitySchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<ICommunity>('Community', CommunitySchema);
