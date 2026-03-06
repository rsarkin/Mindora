import express from 'express';
import Service from '../models/Service';
import TestResult from '../models/TestResult';
import { authMiddleware, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Get all available services
router.get('/', async (req, res) => {
    try {
        const services = await Service.find({ isActive: true });
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// Get services by category
router.get('/category/:category', async (req, res) => {
    try {
        const services = await Service.find({
            category: req.params.category,
            isActive: true
        });
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// Submit test result
router.post('/tests/submit', authMiddleware, authorizeRoles('PATIENT'), async (req: any, res) => {
    try {
        const { testType, score, details, interpretation } = req.body;

        const testResult = new TestResult({
            userId: req.user.id,
            testType,
            score,
            details,
            interpretation
        });

        await testResult.save();
        res.status(201).json(testResult);
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit test result' });
    }
});

// Get user test history
router.get('/tests/history', authMiddleware, authorizeRoles('PATIENT'), async (req: any, res) => {
    try {
        const history = await TestResult.find({ userId: req.user.id })
            .sort({ completedAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch test history' });
    }
});

export default router;
