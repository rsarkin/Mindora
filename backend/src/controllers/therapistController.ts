import { Request, Response } from 'express';
import { TherapistMatchingService } from '../services/therapistMatchingService';
import { logger } from '../utils/logger';
import Therapist from '../models/Therapist';
import Appointment from '../models/Appointment';
import Payment from '../models/Payment';
import User from '../models/User';

const therapistService = new TherapistMatchingService();

export const getTherapists = async (req: Request, res: Response) => {
    try {
        const therapists = await therapistService.getAllTherapists();
        res.json(therapists);
    } catch (error) {
        logger.error('Error fetching therapists:', error);
        res.status(500).json({ error: 'Failed to fetch therapists' });
    }
};

export const requestTherapist = async (req: Request, res: Response) => {
    try {
        const { preferences } = req.body;
        const userId = (req as any).user.id;
        const assignment = await therapistService.requestTherapist(userId, preferences);
        res.json(assignment);
    } catch (error) {
        logger.error('Error requesting therapist:', error);
        res.status(500).json({ error: 'Failed to request therapist' });
    }
};

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        const therapist = await Therapist.findOne({ userId });

        if (!therapist) {
            return res.status(404).json({ message: 'Therapist profile not found' });
        }

        const totalAppointments = await Appointment.countDocuments({
            therapistId: therapist._id
        });

        const completedAppointments = await Appointment.countDocuments({
            therapistId: therapist._id,
            status: 'COMPLETED'
        });

        const pendingAppointments = await Appointment.countDocuments({
            therapistId: therapist._id,
            status: 'SCHEDULED'
        });

        const earningsAggregate = await Payment.aggregate([
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

        const distinctPatients = await Appointment.distinct('patientId', { therapistId: therapist._id });

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
    } catch (error: any) {
        logger.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPatients = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const therapist = await Therapist.findOne({ userId });

        if (!therapist) {
            return res.status(404).json({ message: 'Therapist not found' });
        }

        const appointments = await Appointment.find({ therapistId: therapist._id })
            .populate('patientId', 'name email avatar')
            .sort({ scheduledAt: -1 })
            .lean();

        const patientMap = new Map();

        appointments.forEach((appt: any) => {
            if (appt.patientId && !patientMap.has(appt.patientId._id.toString())) {
                patientMap.set(appt.patientId._id.toString(), {
                    _id: appt.patientId._id,
                    name: appt.patientId.name,
                    email: appt.patientId.email,
                    avatar: appt.patientId.avatar,
                    lastSession: appt.scheduledAt,
                    totalSessions: 1
                });
            } else if (appt.patientId) {
                const patient = patientMap.get(appt.patientId._id.toString());
                patient.totalSessions += 1;
            }
        });

        res.json(Array.from(patientMap.values()));
    } catch (error: any) {
        logger.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { bio, specialization, hourlyRate, hourlyRateINR, experienceYears } = req.body;

        const updateData: any = { bio };
        if (specialization) updateData.specializations = specialization;

        // Handle rates: if either is provided, update both for consistency if needed
        // We prioritize explicit values. If only one is provided, we calculate the other as fallback.
        if (hourlyRateINR) {
            updateData.hourlyRateINR = parseFloat(hourlyRateINR);
            updateData.hourlyRateUSD = Math.round(parseFloat(hourlyRateINR) / 80);
        } else if (hourlyRate) {
            updateData.hourlyRateUSD = parseFloat(hourlyRate);
            updateData.hourlyRateINR = Math.round(parseFloat(hourlyRate) * 80);
        }

        if (experienceYears) updateData.experienceYears = parseInt(experienceYears);

        const therapist = await Therapist.findOneAndUpdate(
            { userId },
            updateData,
            { new: true }
        );

        res.json(therapist);
    } catch (error: any) {
        logger.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getTherapistProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const therapist = await Therapist.findOne({ userId })
            .populate('userId', 'name email avatar')
            .lean();

        if (!therapist) {
            return res.status(404).json({ message: 'Therapist profile not found' });
        }

        const responseData = {
            ...therapist,
            user: (therapist as any).userId
        };

        res.json(responseData);
    } catch (error: any) {
        logger.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getTherapistById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const therapist = await Therapist.findById(id)
            .populate('userId', 'name email avatar location bio')
            .lean();

        if (!therapist) {
            return res.status(404).json({ message: 'Therapist not found' });
        }

        res.json(therapist);
    } catch (error: any) {
        logger.error('Error fetching therapist by ID:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
