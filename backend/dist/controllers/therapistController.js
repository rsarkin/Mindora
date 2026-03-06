"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTherapistById = exports.getTherapistProfile = exports.updateProfile = exports.getPatients = exports.getDashboardStats = exports.requestTherapist = exports.getTherapists = void 0;
const therapistMatchingService_1 = require("../services/therapistMatchingService");
const logger_1 = require("../utils/logger");
const Therapist_1 = __importDefault(require("../models/Therapist"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
const Payment_1 = __importDefault(require("../models/Payment"));
const therapistService = new therapistMatchingService_1.TherapistMatchingService();
const getTherapists = async (req, res) => {
    try {
        const therapists = await therapistService.getAllTherapists();
        res.json(therapists);
    }
    catch (error) {
        logger_1.logger.error('Error fetching therapists:', error);
        res.status(500).json({ error: 'Failed to fetch therapists' });
    }
};
exports.getTherapists = getTherapists;
const requestTherapist = async (req, res) => {
    try {
        const { preferences } = req.body;
        const userId = req.user.id;
        const assignment = await therapistService.requestTherapist(userId, preferences);
        res.json(assignment);
    }
    catch (error) {
        logger_1.logger.error('Error requesting therapist:', error);
        res.status(500).json({ error: 'Failed to request therapist' });
    }
};
exports.requestTherapist = requestTherapist;
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user?.id;
        const therapist = await Therapist_1.default.findOne({ userId });
        if (!therapist) {
            return res.status(404).json({ message: 'Therapist profile not found' });
        }
        const totalAppointments = await Appointment_1.default.countDocuments({
            therapistId: therapist._id
        });
        const completedAppointments = await Appointment_1.default.countDocuments({
            therapistId: therapist._id,
            status: 'COMPLETED'
        });
        const pendingAppointments = await Appointment_1.default.countDocuments({
            therapistId: therapist._id,
            status: 'SCHEDULED'
        });
        const earningsAggregate = await Payment_1.default.aggregate([
            {
                $lookup: {
                    from: 'appointments',
                    localField: 'appointmentId',
                    foreignField: '_id',
                    as: 'appointment'
                }
            },
            { $unwind: '$appointment' },
            {
                $match: {
                    'appointment.therapistId': therapist._id,
                    status: 'COMPLETED'
                }
            },
            {
                $group: {
                    _id: null,
                    totalUSD: { $sum: '$amountUSD' }
                }
            }
        ]);
        const totalEarnings = earningsAggregate.length > 0 ? earningsAggregate[0].totalUSD : 0;
        const distinctPatients = await Appointment_1.default.distinct('patientId', { therapistId: therapist._id });
        res.json({
            metrics: {
                totalPatients: distinctPatients.length,
                appointments: totalAppointments,
                completedSessions: completedAppointments,
                pendingRequests: pendingAppointments,
                totalEarnings,
                rating: therapist.averageRating || 0
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
const getPatients = async (req, res) => {
    try {
        const userId = req.user?.id;
        const therapist = await Therapist_1.default.findOne({ userId });
        if (!therapist) {
            return res.status(404).json({ message: 'Therapist not found' });
        }
        const appointments = await Appointment_1.default.find({ therapistId: therapist._id })
            .populate('patientId', 'name email avatar')
            .sort({ scheduledAt: -1 })
            .lean();
        const patientMap = new Map();
        appointments.forEach((appt) => {
            if (appt.patientId && !patientMap.has(appt.patientId._id.toString())) {
                patientMap.set(appt.patientId._id.toString(), {
                    _id: appt.patientId._id,
                    name: appt.patientId.name,
                    email: appt.patientId.email,
                    avatar: appt.patientId.avatar,
                    lastSession: appt.scheduledAt,
                    totalSessions: 1
                });
            }
            else if (appt.patientId) {
                const patient = patientMap.get(appt.patientId._id.toString());
                patient.totalSessions += 1;
            }
        });
        res.json(Array.from(patientMap.values()));
    }
    catch (error) {
        logger_1.logger.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getPatients = getPatients;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { bio, specialization, hourlyRate, hourlyRateINR, experienceYears } = req.body;
        const updateData = { bio };
        if (specialization)
            updateData.specializations = specialization;
        // Handle rates: if either is provided, update both for consistency if needed
        // We prioritize explicit values. If only one is provided, we calculate the other as fallback.
        if (hourlyRateINR) {
            updateData.hourlyRateINR = parseFloat(hourlyRateINR);
            updateData.hourlyRateUSD = Math.round(parseFloat(hourlyRateINR) / 80);
        }
        else if (hourlyRate) {
            updateData.hourlyRateUSD = parseFloat(hourlyRate);
            updateData.hourlyRateINR = Math.round(parseFloat(hourlyRate) * 80);
        }
        if (experienceYears)
            updateData.experienceYears = parseInt(experienceYears);
        const therapist = await Therapist_1.default.findOneAndUpdate({ userId }, updateData, { new: true });
        res.json(therapist);
    }
    catch (error) {
        logger_1.logger.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateProfile = updateProfile;
const getTherapistProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const therapist = await Therapist_1.default.findOne({ userId })
            .populate('userId', 'name email avatar')
            .lean();
        if (!therapist) {
            return res.status(404).json({ message: 'Therapist profile not found' });
        }
        const responseData = {
            ...therapist,
            user: therapist.userId
        };
        res.json(responseData);
    }
    catch (error) {
        logger_1.logger.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getTherapistProfile = getTherapistProfile;
const getTherapistById = async (req, res) => {
    try {
        const { id } = req.params;
        const therapist = await Therapist_1.default.findById(id)
            .populate('userId', 'name email avatar location bio')
            .lean();
        if (!therapist) {
            return res.status(404).json({ message: 'Therapist not found' });
        }
        res.json(therapist);
    }
    catch (error) {
        logger_1.logger.error('Error fetching therapist by ID:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getTherapistById = getTherapistById;
//# sourceMappingURL=therapistController.js.map