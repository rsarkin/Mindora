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
exports.cancelAppointment = exports.createChatConnection = exports.getPatientAppointments = exports.updateAppointmentStatus = exports.getTherapistAppointments = exports.createAppointment = void 0;
const AppointmentService = __importStar(require("../services/appointmentService"));
const createAppointment = async (req, res) => {
    try {
        const patientId = req.user?.id;
        const appointment = await AppointmentService.createAppointmentService(patientId, req.body);
        res.status(201).json(appointment);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating appointment', error: error.message });
    }
};
exports.createAppointment = createAppointment;
const getTherapistAppointments = async (req, res) => {
    try {
        const userId = req.user?.id;
        const appts = await AppointmentService.getTherapistAppointmentsService(userId);
        res.json(appts);
    }
    catch (error) {
        if (error.message === 'Therapist profile not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
};
exports.getTherapistAppointments = getTherapistAppointments;
const updateAppointmentStatus = async (req, res) => {
    try {
        const userId = req.user?.id;
        const appt = await AppointmentService.updateAppointmentStatusService(req.params.id, userId, req.body);
        res.json(appt);
    }
    catch (error) {
        if (error.message === 'Not authorized')
            return res.status(403).json({ message: error.message });
        if (error.message === 'Appointment not found')
            return res.status(404).json({ message: error.message });
        res.status(500).json({ message: 'Error updating appointment', error: error.message });
    }
};
exports.updateAppointmentStatus = updateAppointmentStatus;
const getPatientAppointments = async (req, res) => {
    try {
        const patientId = req.user?.id;
        const appts = await AppointmentService.getPatientAppointmentsService(patientId);
        res.json(appts);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
};
exports.getPatientAppointments = getPatientAppointments;
const createChatConnection = async (req, res) => {
    try {
        const patientId = req.user?.id;
        const { therapistUserId } = req.body;
        if (!therapistUserId) {
            return res.status(400).json({ message: 'therapistUserId is required' });
        }
        const chatAppt = await AppointmentService.createChatConnectionService(patientId, therapistUserId);
        res.status(201).json(chatAppt);
    }
    catch (error) {
        if (error.message === 'Therapist not found')
            return res.status(404).json({ message: error.message });
        res.status(500).json({ message: 'Error creating chat connection', error: error.message });
    }
};
exports.createChatConnection = createChatConnection;
const cancelAppointment = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { reason } = req.body;
        const result = await AppointmentService.cancelAppointmentService(id, userId, reason);
        res.json(result);
    }
    catch (error) {
        console.error('Cancellation Error:', error);
        res.status(500).json({ message: error.message || 'Error cancelling appointment' });
    }
};
exports.cancelAppointment = cancelAppointment;
//# sourceMappingURL=appointmentController.js.map