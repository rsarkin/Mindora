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
exports.AppointmentType = exports.AppointmentStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["SCHEDULED"] = "SCHEDULED";
    AppointmentStatus["CONFIRMED"] = "CONFIRMED";
    AppointmentStatus["IN_PROGRESS"] = "IN_PROGRESS";
    AppointmentStatus["COMPLETED"] = "COMPLETED";
    AppointmentStatus["CANCELLED_BY_PATIENT"] = "CANCELLED_BY_PATIENT";
    AppointmentStatus["CANCELLED_BY_THERAPIST"] = "CANCELLED_BY_THERAPIST";
    AppointmentStatus["NO_SHOW"] = "NO_SHOW";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
var AppointmentType;
(function (AppointmentType) {
    AppointmentType["VIDEO_CALL"] = "VIDEO_CALL";
    AppointmentType["AUDIO_CALL"] = "AUDIO_CALL";
    AppointmentType["CHAT_ONLY"] = "CHAT_ONLY";
    AppointmentType["IN_PERSON"] = "IN_PERSON";
})(AppointmentType || (exports.AppointmentType = AppointmentType = {}));
const AppointmentSchema = new mongoose_1.Schema({
    patientId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    therapistId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Therapist', required: true },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    timezone: { type: String, default: 'UTC' },
    status: { type: String, enum: Object.values(AppointmentStatus), default: AppointmentStatus.SCHEDULED },
    type: { type: String, enum: Object.values(AppointmentType), default: AppointmentType.VIDEO_CALL },
    videoRoomId: { type: String, unique: true, sparse: true },
    videoCallStartedAt: { type: Date },
    videoCallEndedAt: { type: Date },
    sessionNotesId: { type: String },
    isCrisisSession: { type: Boolean, default: false },
    crisisLevel: { type: Number },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    patientRating: { type: Number },
    therapistRating: { type: Number },
    patientFeedback: { type: String },
    slotId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AppointmentSlot' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    googleMeetLink: { type: String },
    cancellationInitiator: { type: String, enum: ['patient', 'therapist'] }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.models.Appointment || mongoose_1.default.model('Appointment', AppointmentSchema);
//# sourceMappingURL=Appointment.js.map