import { Request, Response } from 'express';
import AppointmentSlot, { SlotStatus } from '../models/AppointmentSlot';
import Therapist from '../models/Therapist';

// Therapist specific: Open a new slot
export const createSlot = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { startTime, endTime } = req.body;

        const therapist = await Therapist.findOne({ userId });
        if (!therapist) {
            console.warn(`Therapist profile not found for userId: ${userId}`);
            return res.status(404).json({ message: 'Therapist profile not found. Please complete your profile onboarding.' });
        }

        const slot = await AppointmentSlot.create({
            therapistId: therapist._id,
            startTime,
            endTime,
            status: SlotStatus.AVAILABLE
        });

        res.status(201).json(slot);
    } catch (error: any) {
        console.error('Error creating slot:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Therapist specific: Get their own slots
export const getMySlots = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const therapist = await Therapist.findOne({ userId });

        if (!therapist) {
            console.warn(`Therapist profile not found for userId: ${userId}`);
            return res.status(404).json({ message: 'Therapist profile not found. Please complete your profile onboarding.' });
        }

        const slots = await AppointmentSlot.find({ therapistId: therapist._id }).sort({ startTime: 1 });
        res.json(slots);
    } catch (error: any) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Therapist specific: Delete or close a slot
export const deleteSlot = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const therapist = await Therapist.findOne({ userId });
        if (!therapist) {
            return res.status(404).json({ message: 'Therapist profile not found' });
        }

        const slot = await AppointmentSlot.findOne({ _id: id, therapistId: therapist._id });
        if (!slot) {
            return res.status(404).json({ message: 'Slot not found or unauthorized' });
        }

        if (slot.status === SlotStatus.BOOKED) {
            return res.status(400).json({ message: 'Cannot delete a booked slot. Please cancel the appointment.' });
        }

        await AppointmentSlot.findByIdAndDelete(id);
        res.json({ message: 'Slot removed' });
    } catch (error: any) {
        console.error('Error deleting slot:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Therapist specific: Toggle a slot (create if doesn't exist, delete if exists and available)
export const toggleSlot = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { startTime, endTime } = req.body;

        const therapist = await Therapist.findOne({ userId });
        if (!therapist) {
            console.warn(`Therapist profile not found for userId: ${userId}`);
            return res.status(404).json({ message: 'Therapist profile not found. Please complete your profile onboarding.' });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        // Check if a slot already exists for this therapist and time
        const existingSlot = await AppointmentSlot.findOne({
            therapistId: therapist._id,
            startTime: start,
            endTime: end
        });

        if (existingSlot) {
            if (existingSlot.status === SlotStatus.BOOKED) {
                return res.status(400).json({ message: 'Cannot close a booked slot' });
            }
            await AppointmentSlot.findByIdAndDelete(existingSlot._id);
            return res.json({ message: 'Slot closed', action: 'removed' });
        } else {
            const newSlot = await AppointmentSlot.create({
                therapistId: therapist._id,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                status: SlotStatus.AVAILABLE
            });
            return res.status(201).json({ message: 'Slot opened', action: 'created', slot: newSlot });
        }
    } catch (error: any) {
        console.error('Error toggling slot:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// Public/Patient: Get available slots for a specific therapist
export const getTherapistAvailableSlots = async (req: Request, res: Response) => {
    try {
        const { therapistId } = req.params;

        const slots = await AppointmentSlot.find({
            therapistId,
            status: SlotStatus.AVAILABLE,
            startTime: { $gt: new Date() } // Only future slots
        }).sort({ startTime: 1 });

        res.json(slots);
    } catch (error: any) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
