"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatService_1 = require("../services/chatService");
const crisisDetectionService_1 = require("../services/crisisDetectionService");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const chatService = new chatService_1.ChatService();
const crisisService = new crisisDetectionService_1.CrisisDetectionService(); // Instantiate Crisis Service
// Apply role authorization to all chat routes
router.use((0, auth_1.authorizeRoles)('PATIENT', 'THERAPIST'));
// Get user conversations
router.get('/conversations', async (req, res) => {
    try {
        const conversations = await chatService.getUserConversations(req.user.id);
        res.json(conversations);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});
// Create new conversation
router.post('/conversations', async (req, res) => {
    try {
        const { participants, type, groupName } = req.body;
        // Ensure creator is in participants
        if (!participants.includes(req.user.id)) {
            participants.push(req.user.id);
        }
        const conversation = await chatService.createConversation(participants, type, groupName, type === 'group' ? req.user.id : undefined);
        res.json(conversation);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});
// Send a message
router.post('/conversations/:id/messages', async (req, res) => {
    console.log(`[DEBUG] Received message for conversation ${req.params.id}`);
    try {
        const { content } = req.body;
        const conversationId = req.params.id;
        const userId = req.user.id;
        // 1. Save User Message
        console.log('[DEBUG] Saving user message...');
        const userMessage = await chatService.saveMessage({
            conversationId,
            userId,
            content,
            type: 'text',
            timestamp: new Date()
        });
        console.log('[DEBUG] User message saved:', userMessage._id);
        res.json(userMessage);
    }
    catch (error) {
        console.error('Failed to send message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});
// Get messages for a conversation
router.get('/conversations/:id/messages', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const messages = await chatService.getRecentMessages(req.params.id, limit);
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
exports.default = router;
//# sourceMappingURL=chat.js.map