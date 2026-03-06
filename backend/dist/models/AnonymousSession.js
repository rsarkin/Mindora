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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonymousSessionStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var AnonymousSessionStatus;
(function (AnonymousSessionStatus) {
    AnonymousSessionStatus["ACTIVE"] = "ACTIVE";
    AnonymousSessionStatus["CONVERTED_TO_USER"] = "CONVERTED_TO_USER";
    AnonymousSessionStatus["EXPIRED"] = "EXPIRED";
})(AnonymousSessionStatus || (exports.AnonymousSessionStatus = AnonymousSessionStatus = {}));
const AnonymousSessionSchema = new mongoose_1.Schema({
    deviceFingerprint: { type: String, required: true, unique: true },
    temporaryName: { type: String },
    messageCount: { type: Number, default: 0 },
    maxFreeMessages: { type: Number, default: 5 },
    status: { type: String, enum: Object.values(AnonymousSessionStatus), default: AnonymousSessionStatus.ACTIVE },
    convertedUserId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    convertedAt: { type: Date },
    initialMessage: { type: String },
    detectedLanguage: { type: String },
    detectedEmotion: { type: String },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.models.AnonymousSession || mongoose_1.default.model('AnonymousSession', AnonymousSessionSchema);
//# sourceMappingURL=AnonymousSession.js.map