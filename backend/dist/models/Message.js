"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = __importDefault(require("../utils/logger"));
// Needs to be 32 bytes (64 hex characters)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '1234567890123456789012345678901234567890123456789012345678901234';
const IV_LENGTH = 16;
const MessageSchema = new mongoose_1.Schema({
    appointmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    senderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: false },
    content: { type: String, required: true },
    readAt: { type: Date },
    isRead: { type: Boolean, default: false }
}, {
    timestamps: true
});
function encrypt(text) {
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const keyBuffer = Buffer.from(ENCRYPTION_KEY.substring(0, 64), 'hex'); // ensure 32 bytes
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', keyBuffer, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}
function decrypt(text) {
    if (!text || !text.includes(':'))
        return text;
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const keyBuffer = Buffer.from(ENCRYPTION_KEY.substring(0, 64), 'hex');
        const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', keyBuffer, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
    catch (e) {
        logger_1.default.error('Message decryption failed, returning unencrypted format as fallback');
        return text;
    }
}
MessageSchema.pre('save', function (next) {
    if (this.isModified('content')) {
        this.content = encrypt(this.content);
    }
    next();
});
MessageSchema.post('find', function (docs) {
    if (Array.isArray(docs)) {
        docs.forEach((doc) => {
            if (doc.content) {
                doc.content = decrypt(doc.content);
            }
        });
    }
});
MessageSchema.post('findOne', function (doc) {
    if (doc && doc.content) {
        doc.content = decrypt(doc.content);
    }
});
exports.default = mongoose_1.default.model('Message', MessageSchema);
//# sourceMappingURL=Message.js.map