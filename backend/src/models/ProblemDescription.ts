import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';
import logger from '../utils/logger';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '1234567890123456789012345678901234567890123456789012345678901234';
const IV_LENGTH = 16;

export interface IProblemDescription extends Document {
    patientId: mongoose.Types.ObjectId;
    content: string;
    version: number;
    crisisFlag: boolean;
    crisisEventId?: mongoose.Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProblemDescriptionSchema = new Schema<IProblemDescription>({
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    version: { type: Number, required: true },
    crisisFlag: { type: Boolean, default: false },
    crisisEventId: { type: Schema.Types.ObjectId, ref: 'CrisisEvent' },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

function encrypt(text: string) {
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const keyBuffer = Buffer.from(ENCRYPTION_KEY.substring(0, 64), 'hex');
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
        logger.error('ProblemDescription decryption failed');
        return text;
    }
}

ProblemDescriptionSchema.pre<IProblemDescription>('save', function (next) {
    if (this.isModified('content') && this.content) {
        this.content = encrypt(this.content);
    }
    next();
});

ProblemDescriptionSchema.post('find', function (docs) {
    if (Array.isArray(docs)) {
        docs.forEach((doc: any) => {
            if (doc.content) doc.content = decrypt(doc.content);
        });
    }
});

ProblemDescriptionSchema.post('findOne', function (doc: any) {
    if (doc && doc.content) doc.content = decrypt(doc.content);
});

export default mongoose.model<IProblemDescription>('ProblemDescription', ProblemDescriptionSchema);
