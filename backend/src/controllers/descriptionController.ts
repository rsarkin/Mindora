import { Request, Response } from 'express';
import ProblemDescription from '../models/ProblemDescription';
import Appointment from '../models/Appointment';
import Therapist from '../models/Therapist';
import CrisisEvent from '../models/CrisisEvent';
import { CrisisDetectionService } from '../services/crisisDetectionService';
import logger from '../utils/logger';
import { AIPlanService } from '../services/aiPlanService';

// AIPlanService instance will be accessed from the server if initialized there, 
// but for the controller, we'll need a handle to it.
// In server.ts, we made it public on the server instance.
// However, a cleaner way is to use the request object if we attach it, 
// or import the class and use it if it's stateless enough.
// The instruction implies calling generateAIPlan directly.

const crisisService = new CrisisDetectionService();

export const createOrUpdateDescription = async (req: Request, res: Response) => {
    try {
        const { content, triggerAIPlan } = req.body;
        const patientId = (req as any).user.id;

        if (!content || content.length > 2000) {
            return res.status(400).json({ error: 'Content is required and must be under 2000 characters' });
        }

        // Deactivate existing descriptions
        await ProblemDescription.updateMany({ patientId, isActive: true }, { isActive: false });

        // Get next version
        const lastDesc = await ProblemDescription.findOne({ patientId }).sort({ version: -1 });
        const nextVersion = lastDesc ? lastDesc.version + 1 : 1;

        const description = new ProblemDescription({
            patientId,
            content,
            version: nextVersion,
            isActive: true
        });

        // Crisis Detection
        const analysis = await crisisService.analyzeMessage(content, { userId: patientId });
        if (analysis.crisis_level >= 5 || analysis.requires_immediate_escalation) {
            description.crisisFlag = true;
            const event = await crisisService.createEscalation({
                userId: patientId,
                crisis_level: analysis.crisis_level,
                sentiment_analysis: analysis.sentiment_analysis,
                keywords_detected: analysis.keywords_detected,
                urgency: analysis.urgency,
                requires_immediate_escalation: analysis.requires_immediate_escalation
            });
            description.crisisEventId = event._id;
            
            // Emit to admins via socket (requires io)
            // We'll assume the io instance is available via req.app.get('io') if we set it up
            const io = req.app.get('io');
            if (io) {
                io.to('admins').emit('crisis:alert', {
                    userId: patientId,
                    eventId: event._id,
                    level: analysis.crisis_level
                });
            }
        }

        await description.save();

        if (triggerAIPlan !== false) {
            const aiPlanService: AIPlanService = req.app.get('aiPlanService');
            if (aiPlanService) {
                aiPlanService.generateAIPlan(patientId, description._id as string, content).catch(err => {
                    logger.error('Background AI Plan generation failed:', err);
                });
            }
        }

        res.status(201).json({
            success: true,
            descriptionId: description._id,
            version: description.version
        });
    } catch (error) {
        logger.error('createOrUpdateDescription error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getActiveDescription = async (req: Request, res: Response) => {
    try {
        const patientId = (req as any).user.id;
        const description = await ProblemDescription.findOne({ patientId, isActive: true });
        
        if (!description) {
            return res.json({ description: null });
        }

        res.json(description);
    } catch (error) {
        logger.error('getActiveDescription error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getDescriptionHistory = async (req: Request, res: Response) => {
    try {
        const patientId = (req as any).user.id;
        const history = await ProblemDescription.find({ patientId }).sort({ version: -1 });
        res.json(history);
    } catch (error) {
        logger.error('getDescriptionHistory error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPatientDescriptionForTherapist = async (req: Request, res: Response) => {
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
            return res.status(403).json({ error: 'Forbidden: No active or past appointment found with this patient.' });
        }

        const description = await ProblemDescription.findOne({ patientId, isActive: true });
        res.json(description || { description: null });
    } catch (error) {
        logger.error('getPatientDescriptionForTherapist error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const regenerateAIPlan = async (req: Request, res: Response) => {
    try {
        const patientId = (req as any).user.id;
        const description = await ProblemDescription.findOne({ patientId, isActive: true });
        
        if (!description) {
            return res.status(404).json({ error: 'No active description found. Please create one first.' });
        }

        const aiPlanService: AIPlanService = req.app.get('aiPlanService');
        if (aiPlanService) {
            // Trigger generation (fire and forget as per constraints)
            aiPlanService.generateAIPlan(patientId, description._id as string, description.content).catch(err => {
                logger.error('Background AI Plan regeneration failed:', err);
            });
            return res.json({ success: true, message: 'AI plan regeneration triggered.' });
        } else {
            return res.status(503).json({ error: 'AI Plan Service unavailable' });
        }
    } catch (error) {
        logger.error('regenerateAIPlan error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
