import { Request, Response } from 'express';
import Message from '../models/Message';
import Appointment from '../models/Appointment';
import logger from '../utils/logger';

export const getAppointmentMessages = async (req: Request, res: Response) => {
    try {
        const { appointmentId } = req.params;
        const userId = (req as any).user?.id;
        const { before, limit = 50 } = req.query;

        // Ensure the appointment exists and the user is part of it
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.patientId.toString() !== userId && appointment.therapistId.toString() !== userId) {
            // Admin could bypass, but we assume Patient/Therapist only for now
            const userRole = (req as any).user?.role;
            if (userRole !== 'ADMIN') {
                return res.status(403).json({ message: 'Not authorized to view these messages' });
            }
        }

        // Fetch all messages between this patient and therapist for a unified history
        const query: any = {
            $or: [
                { appointmentId }, // Keep existing for compatibility
                {
                    senderId: { $in: [appointment.patientId, appointment.therapistId.userId || appointment.therapistId] },
                    receiverId: { $in: [appointment.patientId, appointment.therapistId.userId || appointment.therapistId] }
                }
            ]
        };

        if (before) {
            query.createdAt = { $lt: new Date(before as string) };
        }

        const docs = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        const unreadMessageIds = docs
            .filter(doc => doc.receiverId?.toString() === userId && !doc.isRead)
            .map(doc => doc._id);

        if (unreadMessageIds.length > 0) {
            await Message.updateMany(
                { _id: { $in: unreadMessageIds } },
                { $set: { isRead: true, readAt: new Date() } }
            );
        }

        const decryptedMessages = docs.map(doc => {
            const obj = doc.toObject();
            if (unreadMessageIds.some(id => id.toString() === obj._id.toString())) {
                obj.isRead = true;
            }
            return obj;
        });

        // Return chronological order
        res.json(decryptedMessages.reverse());
    } catch (error: any) {
        logger.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

