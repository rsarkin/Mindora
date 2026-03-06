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
exports.cancelAppointmentService = exports.createChatConnectionService = exports.getPatientAppointmentsService = exports.updateAppointmentStatusService = exports.getTherapistAppointmentsService = exports.createAppointmentService = void 0;
const Appointment_1 = __importDefault(require("../models/Appointment"));
const Therapist_1 = __importDefault(require("../models/Therapist"));
const Payment_1 = __importDefault(require("../models/Payment"));
const AppointmentSlot_1 = __importStar(require("../models/AppointmentSlot"));
const User_1 = __importDefault(require("../models/User"));
const createAppointmentService = async (patientId, data) => {
    const { therapistId, date, time, type, notes, amount } = data;
    const scheduledAt = new Date(`${date}T${time}:00`);
    const appointment = await Appointment_1.default.create({
        patientId,
        therapistId,
        scheduledAt,
        type: type || 'VIDEO_CALL',
        status: 'SCHEDULED',
        durationMinutes: 60,
    });
    if (amount) {
        await Payment_1.default.create({
            userId: patientId,
            appointmentId: appointment._id,
            amountUSD: amount,
            status: 'PENDING'
        });
    }
    return appointment;
};
exports.createAppointmentService = createAppointmentService;
const getTherapistAppointmentsService = async (userId) => {
    const therapist = await Therapist_1.default.findOne({ userId });
    if (!therapist)
        throw new Error('Therapist profile not found');
    const appointments = await Appointment_1.default.find({ therapistId: therapist._id })
        .populate('patientId', 'name email avatar')
        .sort({ scheduledAt: -1 })
        .lean();
    return appointments.map(apt => ({
        ...apt,
        patient: apt.patientId
    }));
};
exports.getTherapistAppointmentsService = getTherapistAppointmentsService;
const updateAppointmentStatusService = async (appointmentId, userId, data) => {
    const therapist = await Therapist_1.default.findOne({ userId });
    if (!therapist)
        throw new Error('Not authorized');
    const existingAppt = await Appointment_1.default.findOne({
        _id: appointmentId,
        therapistId: therapist._id
    });
    if (!existingAppt)
        throw new Error('Appointment not found');
    const updatedAppointment = await Appointment_1.default.findByIdAndUpdate(appointmentId, { status: data.status, videoRoomId: data.meetingLink || `mindora-session-${appointmentId}` }, { new: true });
    return updatedAppointment;
};
exports.updateAppointmentStatusService = updateAppointmentStatusService;
const getPatientAppointmentsService = async (patientId) => {
    const appointments = await Appointment_1.default.find({ patientId })
        .populate({
        path: 'therapistId',
        populate: { path: 'userId', select: 'name avatar' }
    })
        .sort({ scheduledAt: -1 })
        .lean();
    return appointments.map(apt => {
        const therapistDoc = apt.therapistId;
        return {
            ...apt,
            therapist: {
                ...therapistDoc,
                user: therapistDoc?.userId
            }
        };
    });
};
exports.getPatientAppointmentsService = getPatientAppointmentsService;
const createChatConnectionService = async (patientId, therapistUserId) => {
    // 1. Resolve Therapist document from the generic user ID
    const therapist = await Therapist_1.default.findOne({ userId: therapistUserId });
    if (!therapist) {
        throw new Error('Therapist not found');
    }
    // 2. Check if any appointment/connection already exists between these two
    const existingConnection = await Appointment_1.default.findOne({
        patientId,
        therapistId: therapist._id
    });
    if (existingConnection) {
        return existingConnection;
    }
    // 3. Create a barebones CHAT_ONLY appointment
    const newConnection = await Appointment_1.default.create({
        patientId,
        therapistId: therapist._id,
        scheduledAt: new Date(),
        type: 'CHAT_ONLY',
        status: 'SCHEDULED', // Can be considered 'active' chat
        durationMinutes: 0 // Perma-open since it's just a raw chat
    });
    return newConnection;
};
exports.createChatConnectionService = createChatConnectionService;
const cancelAppointmentService = async (appointmentId, userId, reason) => {
    const appointment = await Appointment_1.default.findById(appointmentId).populate('therapistId');
    if (!appointment)
        throw new Error('Appointment not found');
    const user = await User_1.default.findById(userId);
    if (!user)
        throw new Error('User not found');
    const isTherapist = user.role === 'therapist';
    const therapistDoc = appointment.therapistId;
    // Verify ownership
    if (!isTherapist && appointment.patientId.toString() !== userId) {
        throw new Error('Not authorized to cancel this appointment');
    }
    if (isTherapist && therapistDoc.userId.toString() !== userId) {
        throw new Error('Not authorized to cancel this appointment');
    }
    appointment.status = 'CANCELLED';
    appointment.cancellationReason = reason;
    appointment.cancellationInitiator = isTherapist ? 'therapist' : 'patient';
    await appointment.save();
    // Release slot
    if (appointment.slotId) {
        await AppointmentSlot_1.default.findByIdAndUpdate(appointment.slotId, { status: AppointmentSlot_1.SlotStatus.AVAILABLE });
    }
    // Refund logic (Mocked for now)
    const refundPercentage = isTherapist ? 100 : 75;
    console.log(`Initiating ${refundPercentage}% refund for appointment ${appointmentId} via Razorpay...`);
    // In real app, call Razorpay refund API:
    // if (appointment.razorpayPaymentId) {
    //    await razorpay.payments.refund(appointment.razorpayPaymentId, { amount: originalAmount * (refundPercentage/100) });
    // }
    return { message: 'Appointment cancelled and refund initiated', refundPercentage };
};
exports.cancelAppointmentService = cancelAppointmentService;
//# sourceMappingURL=appointmentService.js.map