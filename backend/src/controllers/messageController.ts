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

        const query: any = { appointmentId };
        if (before) {
            query.createdAt = { $lt: new Date(before as string) };
        }

        // Post-find hook handles decrypting, but we need to query and sort
        const docs = await Message.find(query)
            .sort({ createdAt: -1 }) // Sort newest first to get the last N
            .limit(Number(limit));

        // Mark messages as read if the recipient opened them
        const unreadMessageIds = docs
            .filter(doc => doc.receiverId?.toString() === userId && !doc.isRead)
            .map(doc => doc._id);

        if (unreadMessageIds.length > 0) {
            await Message.updateMany(
                { _id: { $in: unreadMessageIds } },
                { $set: { isRead: true, readAt: new Date() } }
            );
            // Optionally, we could emit socket event here as well, 
            // but the client will usually emit 'mark:read' when they open the chat.
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

