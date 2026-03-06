"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const validateEnv_1 = require("./config/validateEnv");
const database_1 = require("./config/database");
const logger_1 = __importDefault(require("./utils/logger"));
const errorHandler_1 = require("./middleware/errorHandler");
const auditLogger_1 = require("./middleware/auditLogger");
const auth_1 = require("./middleware/auth");
const chatService_1 = require("./services/chatService");
const crisisDetectionService_1 = require("./services/crisisDetectionService");
const therapistMatchingService_1 = require("./services/therapistMatchingService");
const notificationService_1 = require("./services/notificationService");
const auth_2 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
const user_1 = __importDefault(require("./routes/user"));
const therapist_1 = __importDefault(require("./routes/therapist"));
const payment_1 = __importDefault(require("./routes/payment"));
const crisis_1 = __importDefault(require("./routes/crisis"));
const session_1 = __importDefault(require("./routes/session"));
const video_1 = __importDefault(require("./routes/video"));
const services_1 = __importDefault(require("./routes/services"));
const news_1 = __importDefault(require("./routes/news"));
const appointment_1 = __importDefault(require("./routes/appointment"));
const admin_1 = __importDefault(require("./routes/admin"));
const message_1 = __importDefault(require("./routes/message"));
const slots_1 = __importDefault(require("./routes/slots"));
const googleAuth_1 = __importDefault(require("./routes/googleAuth"));
const mood_1 = __importDefault(require("./routes/mood"));
const bot_1 = __importDefault(require("./routes/bot"));
// Validate ENV
(0, validateEnv_1.validateEnv)();
class MentalHealthServer {
    constructor() {
        this.app = (0, express_1.default)();
        this.server = (0, http_1.createServer)(this.app);
        this.port = Number(process.env.PORT || 3001);
        // SOCKET.IO (ALLOW ALL ORIGINS)
        this.io = new socket_io_1.Server(this.server, {
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
    initializeServices() {
        this.chatService = new chatService_1.ChatService(this.io);
        this.crisisService = new crisisDetectionService_1.CrisisDetectionService();
        this.therapistService = new therapistMatchingService_1.TherapistMatchingService();
        this.notificationService = new notificationService_1.NotificationService();
    }
    setupMiddleware() {
        // HELMET (FIXED CSP)
        this.app.use((0, helmet_1.default)({
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
        }));
        // CORS (ALLOW ALL)
        this.app.use((0, cors_1.default)({
            origin: true,
            credentials: true
        }));
        // RATE LIMIT
        this.app.use('/api', (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000,
            max: 100,
            standardHeaders: true,
            legacyHeaders: false
        }));
        // BODY PARSING
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // CUSTOM
        this.app.use(auditLogger_1.auditLogger);
        // SERVE STATIC FILES
        this.app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
        // HEALTH CHECK
        this.app.get('/health', (_, res) => {
            res.json({
                status: 'ok',
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            });
        });
    }
    setupRoutes() {
        this.app.use('/api/auth', auth_2.default);
        this.app.use('/api/chat', auth_1.authMiddleware, chat_1.default);
        this.app.use('/api/users', auth_1.authMiddleware, user_1.default);
        this.app.use('/api/therapists', auth_1.authMiddleware, therapist_1.default);
        this.app.use('/api/payments', payment_1.default);
        this.app.use('/api/crisis', auth_1.authMiddleware, crisis_1.default);
        this.app.use('/api/sessions', auth_1.authMiddleware, session_1.default);
        this.app.use('/api/video', auth_1.authMiddleware, video_1.default);
        this.app.use('/api/services', auth_1.authMiddleware, services_1.default);
        this.app.use('/api/news', auth_1.authMiddleware, news_1.default);
        this.app.use('/api/appointments', auth_1.authMiddleware, appointment_1.default);
        this.app.use('/api/admin', auth_1.authMiddleware, admin_1.default);
        this.app.use('/api/messages', auth_1.authMiddleware, message_1.default);
        this.app.use('/api/slots', slots_1.default); // note: slot routes handle their own authMiddleware
        this.app.use('/api/auth', googleAuth_1.default);
        this.app.use('/api/mood', auth_1.authMiddleware, mood_1.default);
        this.app.use('/api/bot', bot_1.default);
        // ML ANALYZE PROXY
        this.app.post('/api/analyze', auth_1.authMiddleware, async (req, res) => {
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
            }
            catch (err) {
                logger_1.default.error(err);
                res.status(502).json({ error: 'ML Service unavailable' });
            }
        });
        // 404
        this.app.use('*', (req, res) => {
            res.status(404).json({ error: 'Route not found' });
        });
    }
    setupSockets() {
        this.io.use((socket, next) => {
            if (!socket.handshake.auth?.token) {
                return next(new Error('Auth token required'));
            }
            next();
        });
        this.io.on('connection', socket => {
            logger_1.default.info(`Socket connected: ${socket.id}`);
            socket.on('join:room', (roomId) => {
                socket.join(roomId);
                logger_1.default.info(`Socket ${socket.id} joined room ${roomId}`);
            });
            socket.on('send:message', async (data) => {
                try {
                    const Message = require('./models/Message').default;
                    const msg = new Message({
                        appointmentId: data.appointmentId,
                        senderId: data.senderId,
                        receiverId: data.receiverId,
                        content: data.content
                    });
                    // msg.content gets encrypted on save
                    await msg.save();
                    this.io.to(data.appointmentId).emit('receive:message', {
                        _id: msg._id,
                        appointmentId: msg.appointmentId,
                        senderId: msg.senderId,
                        receiverId: msg.receiverId,
                        content: data.content, // unencrypted for live relay
                        isRead: false,
                        createdAt: msg.createdAt
                    });
                }
                catch (err) {
                    logger_1.default.error('Error in send:message:', err);
                }
            });
            socket.on('typing:start', data => {
                socket.to(data.appointmentId).emit('typing:start', data);
            });
            socket.on('typing:stop', data => {
                socket.to(data.appointmentId).emit('typing:stop', data);
            });
            socket.on('mark:read', async (data) => {
                try {
                    const Message = require('./models/Message').default;
                    await Message.updateMany({ appointmentId: data.appointmentId, receiverId: data.userId, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
                    socket.to(data.appointmentId).emit('messages:read', {
                        appointmentId: data.appointmentId,
                        userId: data.userId
                    });
                }
                catch (err) {
                    logger_1.default.error('Error in mark:read:', err);
                }
            });
            socket.on('disconnect', reason => {
                logger_1.default.info(`Socket disconnected ${socket.id}: ${reason}`);
            });
        });
    }
    setupErrors() {
        this.app.use(errorHandler_1.errorHandler);
        process.on('SIGTERM', () => this.shutdown());
        process.on('SIGINT', () => this.shutdown());
    }
    shutdown() {
        logger_1.default.info('Shutting down server...');
        this.server.close(() => process.exit(0));
    }
    get appInstance() {
        return this.app;
    }
    async start() {
        try {
            await (0, database_1.connectDatabase)().catch(err => logger_1.default.warn(err));
            // Only listen if not running on Vercel
            if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
                this.server.listen(this.port, () => {
                    logger_1.default.info(`🚀 Server running on port ${this.port}`);
                });
            }
        }
        catch (err) {
            logger_1.default.error(err);
            process.exit(1);
        }
    }
}
// START SERVER
const serverInstance = new MentalHealthServer();
// Start database connections
serverInstance.start();
// Export the Express app for Vercel
exports.default = serverInstance.appInstance;
//# sourceMappingURL=server.js.map