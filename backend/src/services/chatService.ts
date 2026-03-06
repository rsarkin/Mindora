import Chat, { IChat } from '../models/Chat';
import Conversation, { IConversation } from '../models/Conversation';
import { logger } from '../utils/logger';
import { Server as SocketIOServer } from 'socket.io';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

import mongoose from 'mongoose';
import User from '../models/User';

// Load bot personality configuration
const personalityConfigPath = path.join(__dirname, '../config/bot-personality.json');
const botPersonality = fs.existsSync(personalityConfigPath)
    ? JSON.parse(fs.readFileSync(personalityConfigPath, 'utf-8'))
    : null;

// In-memory storage
const localChats: any[] = [];
const localConversations: any[] = [];

export class ChatService {
    private io: SocketIOServer | null = null;
    private ML_SERVICE_URL: string;

    constructor(io?: SocketIOServer) {
        this.io = io || null;
        this.ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    }

    async getUserConversations(userId: string): Promise<any[]> {
        if (mongoose.connection.readyState !== 1) {
            return localConversations.filter(c => c.participants.includes(userId)) as any;
        }

        const conversations = await Conversation.find({ participants: userId })
            .populate({ path: 'lastMessage', select: 'content createdAt sender type' })
            .sort({ updatedAt: -1 })
            .lean()
            .exec();

        // Populate participants using Mongoose User model
        const participantIds = Array.from(new Set(conversations.flatMap(c => c.participants)))
            .filter(id => id !== 'bot');

        const users = await User.find({ _id: { $in: participantIds } })
            .select('name role')
            .lean();

        const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

        // Combine data
        return conversations.map(c => ({
            ...c,
            participants: c.participants.map(pid => {
                const u = userMap.get(pid);
                return u ? { _id: u._id, name: u.name, role: u.role } : { _id: pid, name: 'Unknown User' };
            })
        }));
    }

    async createConversation(participants: string[], type: 'direct' | 'group', groupName?: string, groupAdmin?: string): Promise<IConversation> {
        if (mongoose.connection.readyState !== 1) {
            const conv = {
                _id: 'local_conv_' + Date.now(),
                participants,
                type,
                groupName,
                groupAdmin,
                createdAt: new Date(),
                updatedAt: new Date()
            } as any;
            localConversations.push(conv);
            return conv;
        }

        // For direct chats, check if one already exists
        if (type === 'direct' && participants.length === 2) {
            const existing = await Conversation.findOne({
                participants: { $all: participants },
                type: 'direct'
            });
            if (existing) return existing;
        }

        const conversation = new Conversation({
            participants,
            type,
            groupName,
            groupAdmin
        });

        return await conversation.save();
    }



    async saveMessage(data: { conversationId: string; userId: string; content: string; type: string; timestamp: Date; metadata?: any }): Promise<IChat> {
        try {
            // ML Crisis detection removed from P2P human chat loop as requested by user.

            if (mongoose.connection.readyState !== 1) {
                const chat = {
                    _id: 'local_msg_' + Date.now(),
                    conversationId: data.conversationId,
                    sender: data.userId,
                    content: data.content,
                    type: data.type,
                    metadata: data.metadata,
                    createdAt: new Date(),
                    updatedAt: new Date()
                } as any;
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

            const chat = new Chat({
                conversationId: data.conversationId,
                sender: data.userId,
                content: data.content,
                type: data.type,
                metadata: data.metadata
            });

            await chat.save();

            // Update conversation last message
            await Conversation.findByIdAndUpdate(data.conversationId, {
                lastMessage: chat._id,
                updatedAt: new Date()
            });

            if (this.io && data.conversationId) {
                this.io.to(data.conversationId).emit('chat:message', chat);
            }

            return chat;
        } catch (error) {
            logger.error('Error saving message:', error);
            throw error;
        }
    }

    async getRecentMessages(conversationId: string, limit: number): Promise<any[]> {
        if (mongoose.connection.readyState !== 1) {
            return localChats
                .filter(c => c.conversationId === conversationId)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, limit);
        }

        const messages = await Chat.find({ conversationId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();

        // Populate sender details using Mongoose User Model
        const senderIds = Array.from(new Set(messages.map((m: any) => m.sender).filter(s => s)));
        const users = await User.find({ _id: { $in: senderIds } })
            .select('name')
            .lean();

        const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

        return messages.map((m: any) => {
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


    async processVoiceMessage(data: any): Promise<any> {
        // Placeholder for voice processing (STT)
        // In the future, we could use Gemini 1.5 Pro's audio capabilities too!
        return {
            transcription: "Voice message processing not yet implemented.",
            sentiment: "neutral"
        };
    }
}
