import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';
import logger from '../utils/logger';

// Needs to be 32 bytes (64 hex characters)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '1234567890123456789012345678901234567890123456789012345678901234';
const IV_LENGTH = 16;

export interface IMessage extends Document {
    appointmentId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    content: string;
    readAt?: Date;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema({
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    content: { type: String, required: true },
    readAt: { type: Date },
    isRead: { type: Boolean, default: false }
}, {
    timestamps: true
});

function encrypt(text: string) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const keyBuffer = Buffer.from(ENCRYPTION_KEY.substring(0, 64), 'hex'); // ensure 32 bytes
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string) {
    if (!text || !text.includes(':')) return text;
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift()!, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const keyBuffer = Buffer.from(ENCRYPTION_KEY.substring(0, 64), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        logger.error('Message decryption failed, returning unencrypted format as fallback');
        return text;
    }
}

MessageSchema.pre<IMessage>('save', function (next) {
    if (this.isModified('content')) {
        this.content = encrypt(this.content);
    }
    next();
});

MessageSchema.post('find', function (docs) {
    if (Array.isArray(docs)) {
        docs.forEach((doc: any) => {
            if (doc.content) {
                doc.content = decrypt(doc.content);
            }
        });
    }
});

MessageSchema.post('findOne', function (doc: any) {
    if (doc && doc.content) {
        doc.content = decrypt(doc.content);
    }
});

export default mongoose.model<IMessage>('Message', MessageSchema);
