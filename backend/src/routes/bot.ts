import express from 'express';
import { BotService } from '../services/botService';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();
const botService = new BotService();

// Optional rate limiting for unauthenticated bot usage
const botLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per window
    message: { error: 'Too many requests, please take a breath and try again later.' }
});

router.post('/chat', botLimiter, async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const response = await botService.generateResponse(message, history || []);
        res.json(response);
    } catch (error) {
        console.error('Failed to generate bot response:', error);
        res.status(500).json({ error: 'Failed to process chat request' });
    }
});

export default router;
