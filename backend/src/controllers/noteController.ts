import { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import SessionNote, { NoteStatus } from '../models/SessionNote';
import logger from '../utils/logger';

// @route   POST /api/sessions/notes/:appointmentId
// @desc    Upsert a session note
// @access  Private (Therapist only)
export const saveNote = async (req: Request, res: Response): Promise<any> => {
    try {
        const { appointmentId } = req.params;
        const { content, status } = req.body;
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.role;

        if (userRole !== 'therapist') {
            return res.status(403).json({ error: 'Only therapists can save session notes' });
        }

        // Validate appointment exists and belongs to this therapist
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        if (appointment.therapistId.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized for this appointment' });
        }

        let note = await SessionNote.findOne({ appointmentId });

        if (note) {
            // Update existing note
            note = await SessionNote.findOneAndUpdate(
                { appointmentId },
                { content, status: status || NoteStatus.DRAFT },
                { new: true }
            );
        } else {
             // Create new note
             note = await SessionNote.create({
                 appointmentId: appointment._id,
                 therapistId: appointment.therapistId,
                 patientId: appointment.patientId,
                 content,
                 status: status || NoteStatus.DRAFT
             });

             // Update appointment with note reference
             appointment.sessionNotesId = note._id as string;
             await appointment.save();
        }

        res.json({ success: true, note });
    } catch (error) {
        logger.error('Error saving session note:', error);
        res.status(500).json({ error: 'Server error saving note' });
    }
};

// @route   GET /api/sessions/notes/history/:patientId
// @desc    Get note history for a specific patient
// @access  Private (Therapist only)
export const getNoteHistory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { patientId } = req.params;
        const therapistId = (req as any).user?.id;
        const userRole = (req as any).user?.role;

        if (userRole !== 'therapist') {
            return res.status(403).json({ error: 'Only therapists can view session notes' });
        }

        // We only return notes written by THIS therapist for THIS patient
        const notes = await SessionNote.find({ patientId, therapistId })
            .sort({ createdAt: -1 })
            .populate('appointmentId', 'scheduledAt type');

        res.json(notes);
    } catch (error) {
        logger.error('Error fetching note history:', error);
        res.status(500).json({ error: 'Server error fetching history' });
    }
};

// @route   GET /api/sessions/notes/:appointmentId
// @desc    Get current session note
// @access  Private (Therapist only)
export const getNote = async (req: Request, res: Response): Promise<any> => {
    try {
        const { appointmentId } = req.params;
         const userId = (req as any).user?.id;
         const userRole = (req as any).user?.role;

         if (userRole !== 'therapist') {
            return res.status(403).json({ error: 'Only therapists can view session notes' });
        }

        const note = await SessionNote.findOne({ appointmentId, therapistId: userId });
        
        if (!note) {
            return res.json({ content: '', status: NoteStatus.DRAFT });
        }

        res.json(note);
    } catch (error) {
        logger.error('Error fetching note:', error);
        res.status(500).json({ error: 'Server error fetching note' });
    }
};
