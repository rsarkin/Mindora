import Appointment from '../models/Appointment';
import Therapist from '../models/Therapist';
import Payment from '../models/Payment';
import AppointmentSlot, { SlotStatus } from '../models/AppointmentSlot';
import User from '../models/User';

export const createAppointmentService = async (patientId: string, data: any) => {
    const { therapistId, date, time, type, notes, amount } = data;
    const scheduledAt = new Date(`${date}T${time}:00`);

    const appointment = await Appointment.create({
        patientId,
        therapistId,
        scheduledAt,
        type: type || 'VIDEO_CALL',
        status: 'SCHEDULED',
        durationMinutes: 60,
    });

    if (amount) {
        await Payment.create({
            userId: patientId,
            appointmentId: appointment._id,
            amountUSD: amount,
            status: 'PENDING'
        });
    }

    return appointment;
};

export const getTherapistAppointmentsService = async (userId: string) => {
    const therapist = await Therapist.findOne({ userId });
    if (!therapist) throw new Error('Therapist profile not found');

    const appointments = await Appointment.find({ therapistId: therapist._id })
        .populate('patientId', 'name email avatar')
        .sort({ scheduledAt: -1 })
        .lean();

    return appointments.map(apt => ({
        ...apt,
        patient: apt.patientId
    }));
};

export const updateAppointmentStatusService = async (appointmentId: string, userId: string, data: any) => {
    const therapist = await Therapist.findOne({ userId });
    if (!therapist) throw new Error('Not authorized');

    const existingAppt = await Appointment.findOne({
        _id: appointmentId,
        therapistId: therapist._id
    });

    if (!existingAppt) throw new Error('Appointment not found');

    const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { status: data.status, videoRoomId: data.meetingLink || `mindora-session-${appointmentId}` },
        { new: true }
    );
    return updatedAppointment;
};

export const getPatientAppointmentsService = async (patientId: string) => {
    const appointments = await Appointment.find({ patientId })
        .populate({
            path: 'therapistId',
            populate: { path: 'userId', select: 'name avatar' }
        })
        .sort({ scheduledAt: -1 })
        .lean();

    return appointments.map(apt => {
        const therapistDoc: any = apt.therapistId;
        return {
            ...apt,
            therapist: {
                ...therapistDoc,
                user: therapistDoc?.userId
            }
        };
    });
};

export const createChatConnectionService = async (patientId: string, therapistUserId: string) => {
    // 1. Resolve Therapist document from the generic user ID
    const therapist = await Therapist.findOne({ userId: therapistUserId });
    if (!therapist) {
        throw new Error('Therapist not found');
    }

    // 2. Check if any appointment/connection already exists between these two
    const existingConnection = await Appointment.findOne({
        patientId,
        therapistId: therapist._id
    });

    if (existingConnection) {
        return existingConnection;
    }

    // 3. Create a barebones CHAT_ONLY appointment
    const newConnection = await Appointment.create({
        patientId,
        therapistId: therapist._id,
        scheduledAt: new Date(),
        type: 'CHAT_ONLY',
        status: 'SCHEDULED',     // Can be considered 'active' chat
        durationMinutes: 0       // Perma-open since it's just a raw chat
    });

    return newConnection;
};

export const cancelAppointmentService = async (appointmentId: string, userId: string, reason: string) => {
    const appointment = await Appointment.findById(appointmentId).populate('therapistId');
    if (!appointment) throw new Error('Appointment not found');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const isTherapist = user.role === 'therapist';
    const therapistDoc = appointment.therapistId as any;

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
        await AppointmentSlot.findByIdAndUpdate(appointment.slotId, { status: SlotStatus.AVAILABLE });
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

export const getAppointmentByIdService = async (appointmentId: string) => {
    const appointment = await Appointment.findById(appointmentId)
        .populate('patientId', 'name email avatar')
        .populate({
            path: 'therapistId',
            populate: { path: 'userId', select: 'name avatar' }
        })
        .lean();
    if (!appointment) throw new Error('Appointment not found');
    return appointment;
};
