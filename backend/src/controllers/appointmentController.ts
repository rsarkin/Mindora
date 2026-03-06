import { Request, Response } from 'express';
import * as AppointmentService from '../services/appointmentService';

export const createAppointment = async (req: Request, res: Response) => {
    try {
        const patientId = (req as any).user?.id;
        const appointment = await AppointmentService.createAppointmentService(patientId, req.body);
        res.status(201).json(appointment);
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating appointment', error: error.message });
    }
};

export const getTherapistAppointments = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const appts = await AppointmentService.getTherapistAppointmentsService(userId);
        res.json(appts);
    } catch (error: any) {
        if (error.message === 'Therapist profile not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const appt = await AppointmentService.updateAppointmentStatusService(req.params.id, userId, req.body);
        res.json(appt);
    } catch (error: any) {
        if (error.message === 'Not authorized') return res.status(403).json({ message: error.message });
        if (error.message === 'Appointment not found') return res.status(404).json({ message: error.message });
        res.status(500).json({ message: 'Error updating appointment', error: error.message });
    }
};

export const getPatientAppointments = async (req: Request, res: Response) => {
    try {
        const patientId = (req as any).user?.id;
        const appts = await AppointmentService.getPatientAppointmentsService(patientId);
        res.json(appts);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
};

export const createChatConnection = async (req: Request, res: Response) => {
    try {
        const patientId = (req as any).user?.id;
        const { therapistUserId } = req.body;

        if (!therapistUserId) {
            return res.status(400).json({ message: 'therapistUserId is required' });
        }

        const chatAppt = await AppointmentService.createChatConnectionService(patientId, therapistUserId);
        res.status(201).json(chatAppt);
    } catch (error: any) {
        if (error.message === 'Therapist not found') return res.status(404).json({ message: error.message });
        res.status(500).json({ message: 'Error creating chat connection', error: error.message });
    }
};

export const cancelAppointment = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { id } = req.params;
        const { reason } = req.body;

        const result = await AppointmentService.cancelAppointmentService(id, userId, reason);
        res.json(result);
    } catch (error: any) {
        console.error('Cancellation Error:', error);
        res.status(500).json({ message: error.message || 'Error cancelling appointment' });
    }
};

export const getAppointmentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const appointment = await AppointmentService.getAppointmentByIdService(id);
        res.json(appointment);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching appointment', error: error.message });
    }
};
