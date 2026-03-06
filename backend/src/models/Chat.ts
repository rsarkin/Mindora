import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
    conversationId: mongoose.Types.ObjectId;
    sender: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'system' | 'bot_response';
    readBy: string[];
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}

const ChatSchema: Schema = new Schema({
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: String, required: false }, // UUID or "bot"
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'file', 'system', 'bot_response'], default: 'text' },
    readBy: [{ type: String }],
    metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

export default (mongoose.models.Chat as mongoose.Model<IChat>) || mongoose.model<IChat>('Chat', ChatSchema);
