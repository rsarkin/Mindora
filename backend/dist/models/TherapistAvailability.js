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
exports.DayOfWeek = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek["MONDAY"] = "MONDAY";
    DayOfWeek["TUESDAY"] = "TUESDAY";
    DayOfWeek["WEDNESDAY"] = "WEDNESDAY";
    DayOfWeek["THURSDAY"] = "THURSDAY";
    DayOfWeek["FRIDAY"] = "FRIDAY";
    DayOfWeek["SATURDAY"] = "SATURDAY";
    DayOfWeek["SUNDAY"] = "SUNDAY";
})(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));
const TherapistAvailabilitySchema = new mongoose_1.Schema({
    therapistId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Therapist', required: true },
    dayOfWeek: { type: String, enum: Object.values(DayOfWeek), required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    timezone: { type: String, default: 'UTC' },
    isRecurring: { type: Boolean, default: true },
    exceptionDate: { type: Date }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.models.TherapistAvailability || mongoose_1.default.model('TherapistAvailability', TherapistAvailabilitySchema);
//# sourceMappingURL=TherapistAvailability.js.map