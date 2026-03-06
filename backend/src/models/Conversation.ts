import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
    participants: string[];
    adminId?: string;
    isGroupChat: boolean;
    groupName?: string;
    lastMessage?: string;
    lastMessageAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema: Schema = new Schema({
    participants: [{ type: String, required: true }], // UUIDs from Postgres
    isGroupChat: { type: Boolean, default: false },
    adminId: { type: String }, // UUID
    groupName: { type: String },
    lastMessage: { type: String },
    lastMessageAt: { type: Date }
}, { timestamps: true });

export default (mongoose.models.Conversation as mongoose.Model<IConversation>) || mongoose.model<IConversation>('Conversation', ConversationSchema);
