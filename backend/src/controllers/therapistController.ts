import { Request, Response } from 'express';
import { TherapistMatchingService } from '../services/therapistMatchingService';
import { logger } from '../utils/logger';
import Therapist from '../models/Therapist';
import Appointment from '../models/Appointment';
import Payment from '../models/Payment';
import User from '../models/User';
import Mood from '../models/Mood';
import SessionNote from '../models/SessionNote';

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

/**
 * @route   GET /api/therapists/settings
 * @desc    Get therapist account and profile settings
 * @access  Private (Therapist)
 */
export const getTherapistSettings = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const therapist = await Therapist.findOne({ userId }).populate('userId', 'name email avatar');

        if (!therapist) {
            return res.status(404).json({ error: 'Therapist profile not found' });
        }

        res.json({
            name: therapist.userId.name,
            email: therapist.userId.email,
            avatar: therapist.userId.avatar,
            professionalTitle: therapist.professionalTitle || '',
            timezone: therapist.timezone || 'UTC+05:30',
            emergencyRequests: therapist.emergencyRequests,
            publicProfile: therapist.publicProfile,
            notificationPreferences: therapist.notificationPreferences,
            bankAccount: therapist.bankAccount || {
                holderName: '',
                accountNumber: '',
                bankName: '',
                ifscCode: ''
            }
        });
    } catch (error) {
        logger.error('Error fetching therapist settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

/**
 * @route   PATCH /api/therapists/settings
 * @desc    Update therapist account and profile settings
 * @access  Private (Therapist)
 */
export const updateTherapistSettings = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const {
            name,
            professionalTitle,
            timezone,
            emergencyRequests,
            publicProfile,
            notificationPreferences,
            bankAccount
        } = req.body;

        // 1. Update User Name if provided
        if (name) {
            await User.findByIdAndUpdate(userId, { name });
        }

        // 2. Update Therapist meta
        const updatedTherapist = await Therapist.findOneAndUpdate(
            { userId },
            {
                $set: {
                    professionalTitle,
                    timezone,
                    emergencyRequests,
                    publicProfile,
                    notificationPreferences,
                    bankAccount
                }
            },
            { new: true }
        );

        if (!updatedTherapist) {
            return res.status(404).json({ error: 'Therapist profile not found' });
        }

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        logger.error('Error updating therapist settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
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

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // 1. Upcoming Sessions (future SCHEDULED/CONFIRMED)
        const upcomingSessionsCount = await Appointment.countDocuments({
            therapistId: therapist._id,
            status: { $in: ['SCHEDULED', 'CONFIRMED'] },
            scheduledAt: { $gte: now }
        });

        // 2. Monthly Earnings & Completed Sessions
        const completedThisMonth = await Appointment.countDocuments({
            therapistId: therapist._id,
            status: 'COMPLETED',
            scheduledAt: { $gte: startOfMonth }
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
            { $unwind: { path: '$appointment', preserveNullAndEmptyArrays: false } },
            {
                $match: {
                    'appointment.therapistId': therapist._id,
                    'appointment.status': 'COMPLETED',
                    'appointment.scheduledAt': { $gte: startOfMonth },
                    status: 'COMPLETED'
                }
            },
            {
                $group: {
                    _id: null,
                    totalINR: { $sum: { $ifNull: ['$amountINR', { $multiply: ['$amountUSD', 80] }] } }
                }
            }
        ]);

        const totalEarningsINR = earningsAggregate.length > 0 ? earningsAggregate[0].totalINR : 0;

        // 4. Recently scheduled appointments for list
        const appointments = await Appointment.find({
            therapistId: therapist._id,
            status: { $in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] }
        })
            .populate('patientId', 'name avatar')
            .sort({ scheduledAt: 1 })
            .limit(10)
            .lean();

        // 5. Recent Activities (Derived from multiple sources)
        const recentCompleted = await Appointment.find({ therapistId: therapist._id, status: 'COMPLETED' })
            .populate('patientId', 'name')
            .sort({ updatedAt: -1 })
            .limit(3)
            .lean();

        const recentNotes = await SessionNote.find({ therapistId: therapist._id })
            .populate('patientId', 'name')
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();

        const activities: any[] = [];

        recentCompleted.forEach((apt: any) => {
            activities.push({
                id: `appt - ${apt._id} `,
                type: 'SESSION_COMPLETED',
                description: `Completed ${apt.durationMinutes || 60}min session`,
                actor: apt.patientId?.name || 'Patient',
                timestamp: apt.updatedAt
            });
        });

        recentNotes.forEach((note: any) => {
            activities.push({
                id: `note - ${note._id} `,
                type: 'APPOINTMENT_APPROVED', // Using existing frontend type for "notes added" visual
                description: 'Added detailed clinical notes',
                actor: note.patientId?.name || 'Patient',
                timestamp: note.createdAt
            });
        });

        // Sort combined activities by timestamp
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // 6. Distinct Patients (Total)
        const distinctPatientsCount = await Appointment.distinct('patientId', { therapistId: therapist._id });

        res.json({
            metrics: {
                upcomingSessions: upcomingSessionsCount,
                totalEarningsINR,
                completedThisMonth,
                totalPatients: distinctPatientsCount.length,
                rating: therapist.averageRating || 0
            },
            appointments: appointments.map((a: any) => ({
                id: a._id,
                patientId: a.patientId?._id,
                patientName: a.patientId?.name || 'Anonymous',
                scheduledAt: a.scheduledAt,
                durationMinutes: a.durationMinutes,
                type: a.type,
                status: a.status,
                avatar: a.patientId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.patientId?.name || 'Anon')}&background=random&color=fff`,
                googleMeetLink: a.googleMeetLink
            })),
            activities: activities.slice(0, 8)
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
            .populate('patientId', 'name email avatar occupation diagnosis medications')
            .sort({ scheduledAt: -1 })
            .lean();

        const patientMap = new Map();

        for (const appt of appointments as any[]) {
            const patient = appt.patientId;
            if (!patient || !patient._id) continue;

            const patientId = patient._id.toString();

            if (!patientMap.has(patientId)) {
                // Fetch mood logs for trend calculation
                const moods = await Mood.find({ userId: appt.patientId._id })
                    .sort({ loggedAt: -1 })
                    .limit(3)
                    .lean();

                let trend: 'Stable' | 'Improving' | 'Declining' | 'Fluctuating' = 'Stable';
                if (moods.length >= 2) {
                    const latest = moods[0].intensity || 5;
                    const prev = moods[1].intensity || 5;
                    if (latest > prev + 1) trend = 'Improving';
                    else if (latest < prev - 1) trend = 'Declining';
                    else if (moods.length === 3) {
                        const oldest = moods[2].intensity || 5;
                        if ((latest > prev && prev < oldest) || (latest < prev && prev > oldest)) trend = 'Fluctuating';
                    }
                }

                patientMap.set(patientId, {
                    _id: appt.patientId._id,
                    name: appt.patientId.name,
                    email: appt.patientId.email,
                    avatar: appt.patientId.avatar,
                    occupation: appt.patientId.occupation || 'Patient',
                    moodTrend: trend,
                    lastSession: appt.scheduledAt,
                    totalSessions: 1
                });
            } else {
                const patient = patientMap.get(patientId);
                patient.totalSessions += 1;
            }
        }

        res.json(Array.from(patientMap.values()));
    } catch (error: any) {
        logger.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPatientDetailsForTherapist = async (req: Request, res: Response) => {
    try {
        const { id: patientId } = req.params;
        const therapistUserId = (req as any).user?.id;

        const therapist = await Therapist.findOne({ userId: therapistUserId });
        if (!therapist) {
            return res.status(404).json({ message: 'Therapist profile not found' });
        }

        // 1. Basic Info
        const patientUser = await User.findById(patientId).select('-passwordHash').lean() as any;
        if (!patientUser) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // 2. Mood History (Last 30 entries, latest first, then reversed for chronological chart)
        const recentMoods = await Mood.find({ userId: patientId })
            .sort({ loggedAt: -1 })
            .limit(30)
            .lean();

        const moodHistory = [...recentMoods].reverse();

        const formattedMood = moodHistory.map(m => ({
            date: new Date(m.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            score: m.intensity || 5
        }));

        // 3. Session Notes (specifically for this therapist-patient pair)
        // No .lean() here to allow Mongoose post-find hooks to decrypt the content
        const notes = await SessionNote.find({ patientId, therapistId: therapist._id })
            .sort({ createdAt: -1 });

        // 4. Appointments (Next session and past history)
        const allAppointments = await Appointment.find({
            patientId,
            therapistId: therapist._id
        })
            .sort({ scheduledAt: -1 })
            .lean();

        // 5. Calculate Mood Trend for Profile
        let trend: 'Stable' | 'Improving' | 'Declining' | 'Fluctuating' = 'Stable';
        if (recentMoods.length >= 2) {
            const latest = recentMoods[0].intensity || 5;
            const prev = recentMoods[1].intensity || 5;
            if (latest > prev + 1) trend = 'Improving';
            else if (latest < prev - 1) trend = 'Declining';
            else if (recentMoods.length === 3) {
                const oldest = recentMoods[2].intensity || 5;
                if ((latest > prev && prev < oldest) || (latest < prev && prev > oldest)) trend = 'Fluctuating';
            }
        }

        const now = new Date();
        const futureAppointments = allAppointments
            .filter(a => new Date(a.scheduledAt) > now && ['SCHEDULED', 'CONFIRMED'].includes(a.status))
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

        const nextAppointment = futureAppointments.length > 0 ? futureAppointments[0] : null;

        res.json({
            id: patientUser._id,
            name: patientUser.name,
            email: patientUser.email,
            phone: patientUser.phone || 'Not provided',
            age: patientUser.dateOfBirth ? Math.floor((now.getTime() - new Date(patientUser.dateOfBirth).getTime()) / 31557600000) : 0,
            gender: patientUser.gender || 'Not specified',
            occupation: patientUser.occupation || 'Not provided',
            address: patientUser.location || 'Not provided',
            avatar: patientUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(patientUser.name)}&background=random&color=fff`,
            joinDate: patientUser.createdAt,
            status: patientUser.accountStatus === 'ACTIVE' ? 'Active' : 'Inactive',
            moodTrend: trend,
            diagnosis: patientUser.diagnosis || [],
            medications: patientUser.medications || [],
            nextAppointment: nextAppointment?.scheduledAt || null,
            notes: notes.map((n: any) => ({
                id: n._id,
                date: n.createdAt,
                content: n.content,
                author: 'Me' // Since notes are filtered by current therapist
            })),
            moodHistory: formattedMood
        });
    } catch (error: any) {
        logger.error('Error fetching patient details:', error);
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

export const getEarningsStats = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const therapist = await Therapist.findOne({ userId });

        if (!therapist) {
            return res.status(404).json({ message: 'Therapist profile not found' });
        }

        const now = new Date();
        const currentYear = now.getFullYear();
        const sevenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

        // 1. Total Balance (YTD) - Optimized: Start from Appointment (indexed by therapistId)
        const ytdEarnings = await Appointment.aggregate([
            {
                $match: {
                    therapistId: therapist._id,
                    status: 'COMPLETED',
                    scheduledAt: { $gte: new Date(currentYear, 0, 1) }
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'appointmentId',
                    as: 'payment'
                }
            },
            { $unwind: '$payment' },
            { $match: { 'payment.status': 'COMPLETED' } },
            {
                $group: {
                    _id: null,
                    total: { $sum: { $ifNull: ['$payment.amountINR', { $multiply: ['$payment.amountUSD', 80] }] } }
                }
            }
        ]);

        // 2. Next Payout (PENDING/PROCESSING payments)
        const nextPayout = await Appointment.aggregate([
            {
                $match: {
                    therapistId: therapist._id,
                    status: 'COMPLETED'
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'appointmentId',
                    as: 'payment'
                }
            },
            { $unwind: '$payment' },
            {
                $match: {
                    'payment.status': { $in: ['PENDING', 'PROCESSING'] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: { $ifNull: ['$payment.amountINR', { $multiply: ['$payment.amountUSD', 80] }] } }
                }
            }
        ]);

        // 3. Monthly Revenue (Last 6-7 months)
        const monthlyEarnings = await Appointment.aggregate([
            {
                $match: {
                    therapistId: therapist._id,
                    status: 'COMPLETED',
                    scheduledAt: { $gte: sevenMonthsAgo }
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'appointmentId',
                    as: 'payment'
                }
            },
            { $unwind: '$payment' },
            { $match: { 'payment.status': 'COMPLETED' } },
            {
                $group: {
                    _id: {
                        month: { $month: '$payment.paidAt' },
                        year: { $year: '$payment.paidAt' }
                    },
                    amount: { $sum: { $ifNull: ['$payment.amountINR', { $multiply: ['$payment.amountUSD', 80] }] } }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const chartData = monthlyEarnings.map(m => ({
            month: monthNames[m._id.month - 1],
            amount: m.amount
        }));

        // 4. Billable Hours (Total COMPLETED)
        const billableHours = await Appointment.aggregate([
            {
                $match: {
                    therapistId: therapist._id,
                    status: 'COMPLETED'
                }
            },
            {
                $group: {
                    _id: null,
                    totalMinutes: { $sum: '$durationMinutes' }
                }
            }
        ]);

        const totalHours = billableHours.length > 0 ? Math.round(billableHours[0].totalMinutes / 60) : 0;

        // 5. Recent Transactions
        const recentSuccessfulAppointments = await Appointment.find({
            therapistId: therapist._id,
            status: 'COMPLETED'
        })
            .sort({ scheduledAt: -1 })
            .limit(10)
            .populate('patientId', 'name')
            .lean();

        // Get corresponding payments
        const apptIds = recentSuccessfulAppointments.map(a => a._id);
        const payments = await Payment.find({
            appointmentId: { $in: apptIds },
            status: 'COMPLETED'
        }).lean();

        const transactions = recentSuccessfulAppointments.map(appt => {
            const payment = payments.find(p => p.appointmentId.toString() === appt._id.toString());
            return {
                id: appt._id,
                date: new Date(payment?.paidAt || appt.scheduledAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }),
                client: (appt.patientId as any)?.name || 'Anonymous',
                type: appt.type || 'Session',
                duration: `${appt.durationMinutes || 60} min`,
                amount: payment ? (payment.amountINR || (payment.amountUSD * 80)) : 0,
                status: 'Paid'
            };
        }).filter(t => t.amount > 0);

        res.json({
            metrics: {
                totalBalanceYTD: ytdEarnings.length > 0 ? ytdEarnings[0].total : 0,
                nextPayout: nextPayout.length > 0 ? nextPayout[0].total : 0,
                billableHours: totalHours
            },
            chartData,
            transactions
        });

    } catch (error: any) {
        logger.error('Error fetching earnings stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
