import { Request, Response } from 'express';
import WellnessTask, { TaskSource, TaskStatus, ApprovalStatus } from '../models/WellnessTask';
import Appointment from '../models/Appointment';
import Therapist from '../models/Therapist';
import logger from '../utils/logger';

export const getTasks = async (req: Request, res: Response) => {
    try {
        const patientId = (req as any).user.id;
        const { status, category } = req.query;

        const query: any = { 
            patientId,
            approvalStatus: { $ne: ApprovalStatus.REJECTED }
        };

        if (status) query.status = status;
        if (category) query.category = category;

        const tasks = await WellnessTask.find(query).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        logger.error('getTasks error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createTask = async (req: Request, res: Response) => {
    try {
        const patientId = (req as any).user.id;
        const { title, description, category, frequency, durationMinutes, dueDate } = req.body;

        if (!title || !category || !frequency) {
            return res.status(400).json({ error: 'Title, category, and frequency are required' });
        }

        const task = new WellnessTask({
            patientId,
            source: TaskSource.MANUAL,
            status: TaskStatus.TODO,
            approvalStatus: ApprovalStatus.APPROVED,
            title,
            description,
            category,
            frequency,
            durationMinutes,
            dueDate
        });

        await task.save();
        res.status(201).json(task);
    } catch (error) {
        logger.error('createTask error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        const patientId = (req as any).user.id;

        if (!Object.values(TaskStatus).includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const task = await WellnessTask.findOne({ _id: taskId, patientId });
        if (!task) return res.status(404).json({ error: 'Task not found' });

        task.status = status;
        if (status === TaskStatus.DONE && !task.completedAt) {
            task.completedAt = new Date();
        }

        await task.save();
        res.json(task);
    } catch (error) {
        logger.error('updateTaskStatus error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const approveOrRejectTask = async (req: Request, res: Response) => {
    try {
        const { taskId } = req.params;
        const { action } = req.body; // 'approve' or 'reject'
        const patientId = (req as any).user.id;

        const task = await WellnessTask.findOne({ _id: taskId, patientId });
        if (!task) return res.status(404).json({ error: 'Task not found' });

        if (action === 'approve') {
            task.approvalStatus = ApprovalStatus.APPROVED;
        } else if (action === 'reject') {
            task.approvalStatus = ApprovalStatus.REJECTED;
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        await task.save();
        res.json(task);
    } catch (error) {
        logger.error('approveOrRejectTask error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { taskId } = req.params;
        const patientId = (req as any).user.id;

        const task = await WellnessTask.findOne({ _id: taskId, patientId });
        if (!task) return res.status(404).json({ error: 'Task not found' });

        if (task.source === TaskSource.AI) {
            return res.status(400).json({ error: 'AI-generated tasks cannot be deleted. You can reject them instead.' });
        }

        await WellnessTask.deleteOne({ _id: taskId });
        res.json({ success: true });
    } catch (error) {
        logger.error('deleteTask error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPatientTasksForTherapist = async (req: Request, res: Response) => {
    try {
        const { patientId } = req.params;
        const therapistId = (req as any).user.id;

        const therapist = await Therapist.findOne({ userId: therapistId });
        if (!therapist) return res.status(403).json({ error: 'Forbidden' });

        const appointment = await Appointment.findOne({
            therapistId: therapist._id,
            patientId,
            status: { $in: ['CONFIRMED', 'COMPLETED', 'IN_PROGRESS'] }
        });

        if (!appointment) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const tasks = await WellnessTask.find({ 
            patientId, 
            approvalStatus: ApprovalStatus.APPROVED 
        }).sort({ createdAt: -1 });

        const total = tasks.length;
        const completed = tasks.filter(t => t.status === TaskStatus.DONE).length;
        const byCategory = {
            mental: tasks.filter(t => t.category === 'mental').length,
            physical: tasks.filter(t => t.category === 'physical').length,
            behavioral: tasks.filter(t => t.category === 'behavioral').length,
            social: tasks.filter(t => t.category === 'social').length
        };

        res.json({
            tasks,
            stats: { total, completed, byCategory }
        });
    } catch (error) {
        logger.error('getPatientTasksForTherapist error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const addTherapistNote = async (req: Request, res: Response) => {
    try {
        const { patientId, taskId } = req.params;
        const { note } = req.body;
        const therapistId = (req as any).user.id;

        const therapist = await Therapist.findOne({ userId: therapistId });
        if (!therapist) return res.status(403).json({ error: 'Forbidden' });

        const appointment = await Appointment.findOne({
            therapistId: therapist._id,
            patientId,
            status: { $in: ['CONFIRMED', 'COMPLETED', 'IN_PROGRESS'] }
        });

        if (!appointment) return res.status(403).json({ error: 'Forbidden' });

        const task = await WellnessTask.findOne({ _id: taskId, patientId });
        if (!task) return res.status(404).json({ error: 'Task not found' });

        task.therapistNote = note;
        await task.save();

        // Emit socket notification to patient
        const io = req.app.get('io');
        if (io) {
            io.to(`patient:${patientId}`).emit('tasks:therapist_note_added', { 
                taskId: task._id,
                title: task.title 
            });
        }

        res.json(task);
    } catch (error) {
        logger.error('addTherapistNote error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
