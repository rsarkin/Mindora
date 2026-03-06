"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const botService_1 = require("../services/botService");
const express_rate_limit_1 = require("express-rate-limit");
const router = express_1.default.Router();
const botService = new botService_1.BotService();
// Optional rate limiting for unauthenticated bot usage
const botLimiter = (0, express_rate_limit_1.rateLimit)({
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
    }
    catch (error) {
        console.error('Failed to generate bot response:', error);
        res.status(500).json({ error: 'Failed to process chat request' });
    }
});
exports.default = router;
//# sourceMappingURL=bot.js.map