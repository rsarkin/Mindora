"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const Chat_1 = __importDefault(require("../models/Chat"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
const logger_1 = require("../utils/logger");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
// Load bot personality configuration
const personalityConfigPath = path_1.default.join(__dirname, '../config/bot-personality.json');
const botPersonality = fs_1.default.existsSync(personalityConfigPath)
    ? JSON.parse(fs_1.default.readFileSync(personalityConfigPath, 'utf-8'))
    : null;
// In-memory storage
const localChats = [];
const localConversations = [];
class ChatService {
    constructor(io) {
        this.io = null;
        this.io = io || null;
        this.ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    }
    async getUserConversations(userId) {
        if (mongoose_1.default.connection.readyState !== 1) {
            return localConversations.filter(c => c.participants.includes(userId));
        }
        const conversations = await Conversation_1.default.find({ participants: userId })
            .populate({ path: 'lastMessage', select: 'content createdAt sender type' })
            .sort({ updatedAt: -1 })
            .lean()
            .exec();
        // Populate participants using Mongoose User model
        const participantIds = Array.from(new Set(conversations.flatMap(c => c.participants)))
            .filter(id => id !== 'bot');
        const users = await User_1.default.find({ _id: { $in: participantIds } })
            .select('name role')
            .lean();
        const userMap = new Map(users.map((u) => [u._id.toString(), u]));
        // Combine data
        return conversations.map(c => ({
            ...c,
            participants: c.participants.map(pid => {
                const u = userMap.get(pid);
                return u ? { _id: u._id, name: u.name, role: u.role } : { _id: pid, name: 'Unknown User' };
            })
        }));
    }
    async createConversation(participants, type, groupName, groupAdmin) {
        if (mongoose_1.default.connection.readyState !== 1) {
            const conv = {
                _id: 'local_conv_' + Date.now(),
                participants,
                type,
                groupName,
                groupAdmin,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            localConversations.push(conv);
            return conv;
        }
        // For direct chats, check if one already exists
        if (type === 'direct' && participants.length === 2) {
            const existing = await Conversation_1.default.findOne({
                participants: { $all: participants },
                type: 'direct'
            });
            if (existing)
                return existing;
        }
        const conversation = new Conversation_1.default({
            participants,
            type,
            groupName,
            groupAdmin
        });
        return await conversation.save();
    }
    async saveMessage(data) {
        try {
            // ML Crisis detection removed from P2P human chat loop as requested by user.
            if (mongoose_1.default.connection.readyState !== 1) {
                const chat = {
                    _id: 'local_msg_' + Date.now(),
                    conversationId: data.conversationId,
                    sender: data.userId,
                    content: data.content,
                    type: data.type,
                    metadata: data.metadata,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                localChats.push(chat);
                // Update local conversation
                const convIndex = localConversations.findIndex(c => c._id === data.conversationId);
                if (convIndex !== -1) {
                    localConversations[convIndex].lastMessage = chat;
                    localConversations[convIndex].updatedAt = new Date();
                }
                if (this.io && data.conversationId) {
                    this.io.to(data.conversationId).emit('chat:message', chat);
                }
                return chat;
            }
            const chat = new Chat_1.default({
                conversationId: data.conversationId,
                sender: data.userId,
                content: data.content,
                type: data.type,
                metadata: data.metadata
            });
            await chat.save();
            // Update conversation last message
            await Conversation_1.default.findByIdAndUpdate(data.conversationId, {
                lastMessage: chat._id,
                updatedAt: new Date()
            });
            if (this.io && data.conversationId) {
                this.io.to(data.conversationId).emit('chat:message', chat);
            }
            return chat;
        }
        catch (error) {
            logger_1.logger.error('Error saving message:', error);
            throw error;
        }
    }
    async getRecentMessages(conversationId, limit) {
        if (mongoose_1.default.connection.readyState !== 1) {
            return localChats
                .filter(c => c.conversationId === conversationId)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, limit);
        }
        const messages = await Chat_1.default.find({ conversationId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();
        // Populate sender details using Mongoose User Model
        const senderIds = Array.from(new Set(messages.map((m) => m.sender).filter(s => s)));
        const users = await User_1.default.find({ _id: { $in: senderIds } })
            .select('name')
            .lean();
        const userMap = new Map(users.map((u) => [u._id.toString(), u]));
        return messages.map((m) => {
            let senderDetails = null;
            if (m.sender) {
                const u = userMap.get(m.sender.toString());
                senderDetails = u ? { _id: u._id, name: u.name } : { _id: m.sender, name: 'Unknown' };
            }
            return {
                ...m,
                sender: senderDetails
            };
        });
    }
    async processVoiceMessage(data) {
        // Placeholder for voice processing (STT)
        // In the future, we could use Gemini 1.5 Pro's audio capabilities too!
        return {
            transcription: "Voice message processing not yet implemented.",
            sentiment: "neutral"
        };
    }
}
exports.ChatService = ChatService;
//# sourceMappingURL=chatService.js.map