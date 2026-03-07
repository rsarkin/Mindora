// Backend Server Starting...
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { validateEnv } from './config/validateEnv';
import { connectDatabase } from './config/database';

import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { auditLogger } from './middleware/auditLogger';
import { authMiddleware } from './middleware/auth';

import { ChatService } from './services/chatService';
import { CrisisDetectionService } from './services/crisisDetectionService';
import { TherapistMatchingService } from './services/therapistMatchingService';
import { NotificationService } from './services/notificationService';
import { AIPlanService } from './services/aiPlanService';

import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import userRoutes from './routes/user';
import therapistRoutes from './routes/therapist';
import paymentRoutes from './routes/payment';
import crisisRoutes from './routes/crisis';
import sessionRoutes from './routes/session';
import videoRoutes from './routes/video';
import servicesRoutes from './routes/services';
import newsRoutes from './routes/news';
import appointmentRoutes from './routes/appointment';
import adminRoutes from './routes/admin';
import messageRoutes from './routes/message';
import slotRoutes from './routes/slots';
import googleAuthRoutes from './routes/googleAuth';
import moodRoutes from './routes/mood';
import botRoutes from './routes/bot';
import notesRoutes from './routes/notes';
import communityRoutes from './routes/community';
import resourcesRoutes from './routes/resources';
import descriptionRoutes from './routes/descriptionRoutes';
import taskRoutes from './routes/taskRoutes';

// Validate ENV
validateEnv();

class MentalHealthServer {
    private app: express.Application;
    private server: any;
    private io: SocketIOServer;
    private port: number;

    private chatService!: ChatService;
    private crisisService!: CrisisDetectionService;
    private therapistService!: TherapistMatchingService;
    private notificationService!: NotificationService;
    public aiPlanService!: AIPlanService;

    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.port = Number(process.env.PORT || 3001);

        // SOCKET.IO (ALLOW ALL ORIGINS)
        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: true,
                credentials: true,
                methods: ['GET', 'POST']
            },
            transports: ['websocket', 'polling']
        });

        this.initializeServices();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSockets();
        this.setupErrors();
    }

    private initializeServices() {
        this.chatService = new ChatService(this.io);
        this.crisisService = new CrisisDetectionService();
        this.therapistService = new TherapistMatchingService();
        this.notificationService = new NotificationService();
        this.aiPlanService = new AIPlanService(this.io);

        // Expose services for controllers
        this.app.set('io', this.io);
        this.app.set('aiPlanService', this.aiPlanService);
    }

    private setupMiddleware() {
        // HELMET (FIXED CSP)
        this.app.use(
            helmet({
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ["'self'"],
                        scriptSrc: ["'self'", "'unsafe-inline'", "*"],
                        styleSrc: ["'self'", "'unsafe-inline'", "*"],
                        imgSrc: ["'self'", "data:", "https:", "*"],
                        connectSrc: ["'self'", "*", "ws:", "wss:"],
                        fontSrc: ["'self'", "data:", "*"],
                        frameSrc: ["'self'", "*"],
                        mediaSrc: ["'self'", "blob:", "*"],
                        objectSrc: ["'none'"]
                    }
                },
                crossOriginEmbedderPolicy: false
            })
        );

        // CORS (ALLOW ALL)
        this.app.use(
            cors({
                origin: true,
                credentials: true
            })
        );

        // RATE LIMIT
        this.app.use(
            '/api',
            rateLimit({
                windowMs: 15 * 60 * 1000,
                max: 1000,
                standardHeaders: true,
                legacyHeaders: false
            })
        );

        // BODY PARSING
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // CUSTOM
        this.app.use(auditLogger);

        // SERVE STATIC FILES
        this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

        // HEALTH CHECK
        this.app.get('/health', (_, res) => {
            res.json({
                status: 'ok',
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            });
        });
    }

    private setupRoutes() {
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/chat', authMiddleware, chatRoutes);
        this.app.use('/api/users', authMiddleware, userRoutes);
        this.app.use('/api/therapists', authMiddleware, therapistRoutes);
        this.app.use('/api/payments', paymentRoutes);
        this.app.use('/api/crisis', authMiddleware, crisisRoutes);
        this.app.use('/api/sessions', authMiddleware, sessionRoutes);
        this.app.use('/api/video', authMiddleware, videoRoutes);
        this.app.use('/api/services', authMiddleware, servicesRoutes);
        this.app.use('/api/news', authMiddleware, newsRoutes);
        this.app.use('/api/appointments', authMiddleware, appointmentRoutes);
        this.app.use('/api/admin', authMiddleware, adminRoutes);
        this.app.use('/api/messages', authMiddleware, messageRoutes);
        this.app.use('/api/slots', slotRoutes); // note: slot routes handle their own authMiddleware
        this.app.use('/api/auth', googleAuthRoutes);
        this.app.use('/api/mood', authMiddleware, moodRoutes);
        this.app.use('/api/bot', botRoutes);
        this.app.use('/api/notes', notesRoutes);
        this.app.use('/api', communityRoutes);
        this.app.use('/api/resources', authMiddleware, resourcesRoutes);
        this.app.use('/api/public-resources', resourcesRoutes);
        this.app.use('/api', descriptionRoutes);
        this.app.use('/api', taskRoutes);

        // ML ANALYZE PROXY
        this.app.post('/api/analyze', authMiddleware, async (req, res) => {
            try {
                const mlUrl = `${process.env.ML_SERVICE_URL}/analyze/message`;
                const response = await fetch(mlUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: req.headers.authorization || ''
                    },
                    body: JSON.stringify(req.body)
                });

                const data = await response.json();
                res.status(response.status).json(data);
            } catch (err) {
                logger.error(err);
                res.status(502).json({ error: 'ML Service unavailable' });
            }
        });

        // 404
        this.app.use('*', (req, res) => {
            res.status(404).json({ error: 'Route not found' });
        });
    }

    private setupSockets() {
        this.io.use((socket, next) => {
            if (!socket.handshake.auth?.token) {
                return next(new Error('Auth token required'));
            }
            
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET as string);
                (socket as any).user = decoded;
                
                // User always joins their personal room
                socket.join(`user:${decoded.id}`);
                
                // Backwards compatibility for some routes
                socket.join(`patient:${decoded.id}`);
                
                logger.info(`Socket ${socket.id} (User: ${decoded.id}) joined personal rooms.`);
            } catch (err) {
                logger.error('Socket auth error:', err);
            }
            
            next();
        });

        this.io.on('connection', socket => {
            logger.info(`Socket connected: ${socket.id}`);

            socket.on('join:room', (roomId: string) => {
                socket.join(roomId);
                logger.info(`Socket ${socket.id} joined room ${roomId}`);
            });

            socket.on('send:message', async data => {
                try {
                    const Message = require('./models/Message').default;
                    const Appointment = require('./models/Appointment').default;

                    // 1. Resolve true Receiver User ID if missing or profile ID provided
                    let receiverUserId = data.receiverId;
                    
                    // 2. Persistent room ID - ensures cross-appointment delivery
                    const appt = await Appointment.findById(data.appointmentId).populate('therapistId');
                    if (appt) {
                        const therapistUserId = appt.therapistId?.userId?.toString() || appt.therapistId?.toString();
                        const patientId = appt.patientId.toString();
                        
                        // Receiver is the other party in the appointment
                        if (!receiverUserId) {
                            receiverUserId = ((socket as any).user.id === patientId) ? therapistUserId : patientId;
                        }
                    }

                    const msg = new Message({
                        appointmentId: data.appointmentId,
                        senderId: (socket as any).user.id,
                        receiverId: receiverUserId,
                        content: data.content
                    });

                    await msg.save();

                    const payload = {
                        _id: msg._id.toString(),
                        appointmentId: msg.appointmentId.toString(),
                        senderId: msg.senderId.toString(),
                        receiverId: receiverUserId ? receiverUserId.toString() : '',
                        content: data.content,
                        isRead: false,
                        createdAt: msg.createdAt
                    };

                    // Emit to the specific appointment room (active session)
                    this.io.to(data.appointmentId.toString()).emit('receive:message', payload);
                    
                    // ALSO emit to receiver's personal user room for global notification/update
                    if (receiverUserId) {
                        this.io.to(`user:${receiverUserId}`).emit('receive:message', payload);
                        this.io.to(`patient:${receiverUserId}`).emit('receive:message', payload);
                    }
                } catch (err) {
                    logger.error('Error in send:message:', err);
                }
            });

            socket.on('typing:start', data => {
                socket.to(data.appointmentId).emit('typing:start', data);
            });

            socket.on('typing:stop', data => {
                socket.to(data.appointmentId).emit('typing:stop', data);
            });

            socket.on('mark:read', async data => {
                try {
                    const Message = require('./models/Message').default;
                    await Message.updateMany(
                        { appointmentId: data.appointmentId, receiverId: data.userId, isRead: false },
                        { $set: { isRead: true, readAt: new Date() } }
                    );
                    socket.to(data.appointmentId).emit('messages:read', {
                        appointmentId: data.appointmentId,
                        userId: data.userId
                    });
                } catch (err) {
                    logger.error('Error in mark:read:', err);
                }
            });

            socket.on('disconnect', reason => {
                logger.info(`Socket disconnected ${socket.id}: ${reason}`);
            });
        });
    }

    private setupErrors() {
        this.app.use(errorHandler);

        process.on('SIGTERM', () => this.shutdown());
        process.on('SIGINT', () => this.shutdown());
    }

    private shutdown() {
        logger.info('Shutting down server...');
        this.server.close(() => process.exit(0));
    }

    public get appInstance(): express.Application {
        return this.app;
    }

    public async start() {
        try {
            await connectDatabase().catch(err => logger.warn(err));

            // Always listen — Render requires a bound port
            // Render injects process.env.PORT automatically
            this.server.listen(this.port, () => {
                logger.info(`🚀 Server running on port ${this.port}`);
            });
        } catch (err) {
            logger.error(err);
            process.exit(1);
        }
    }
}

// START SERVER
const serverInstance = new MentalHealthServer();

// Start database connections
serverInstance.start();

// Export the Express app for Vercel
export default serverInstance.appInstance;
