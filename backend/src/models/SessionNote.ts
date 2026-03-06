import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';
import logger from '../utils/logger';

// Needs to be 32 bytes (64 hex characters)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '1234567890123456789012345678901234567890123456789012345678901234';
const IV_LENGTH = 16;

export enum NoteStatus {
    DRAFT = 'DRAFT',
    FINAL = 'FINAL'
}

export interface ISessionNote extends Document {
    appointmentId: mongoose.Types.ObjectId;
    therapistId: mongoose.Types.ObjectId;
    patientId: mongoose.Types.ObjectId;
    content: string;
    status: NoteStatus;
    createdAt: Date;
    updatedAt: Date;
}

const SessionNoteSchema = new Schema({
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'Therapist', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    status: { type: String, enum: Object.values(NoteStatus), default: NoteStatus.DRAFT }
}, {
    timestamps: true
});

function encrypt(text: string) {
    if (!text) return text;
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
        logger.error('SessionNote decryption failed, returning unencrypted format as fallback');
        return text;
    }
}

SessionNoteSchema.pre<ISessionNote>('save', function (next) {
    if (this.isModified('content') && this.content) {
        this.content = encrypt(this.content);
    }
    next();
});

SessionNoteSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate() as any;
    if (update.content) {
        update.content = encrypt(update.content);
    } else if (update.$set && update.$set.content) {
        update.$set.content = encrypt(update.$set.content);
    }
    next();
});

SessionNoteSchema.post('find', function (docs) {
    if (Array.isArray(docs)) {
        docs.forEach((doc: any) => {
            if (doc.content) {
                doc.content = decrypt(doc.content);
            }
        });
    }
});

SessionNoteSchema.post('findOne', function (doc: any) {
    if (doc && doc.content) {
        doc.content = decrypt(doc.content);
    }
});

// Also decrypt on findOneAndUpdate
SessionNoteSchema.post('findOneAndUpdate', function(doc: any) {
    if (doc && doc.content) {
        doc.content = decrypt(doc.content);
    }
});

export default mongoose.model<ISessionNote>('SessionNote', SessionNoteSchema);
