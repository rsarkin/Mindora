"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
exports.config = {
    uri: process.env.DATABASE_URL || 'mongodb://localhost:27017/mental_health_chatbot',
    options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4 // Use IPv4, skip trying IPv6
    }
};
async function connectDatabase() {
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!mongoUri) {
        logger_1.logger.error('❌ CRITICAL: MongoDB URI missing.');
        throw new Error('MongoDB URI is required.');
    }
    try {
        await mongoose_1.default.connect(mongoUri, exports.config.options);
        logger_1.logger.info('✅ Database connected successfully');
        // Handle connection events
        mongoose_1.default.connection.on('error', (error) => {
            logger_1.logger.error('Database connection error:', error);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.logger.warn('Database disconnected');
        });
        mongoose_1.default.connection.on('reconnected', () => {
            logger_1.logger.info('Database reconnected');
        });
    }
    catch (error) {
        logger_1.logger.error('❌ CRITICAL: MongoDB connection failed. Server cannot start.', error);
        throw error;
    }
}
async function disconnectDatabase() {
    try {
        await mongoose_1.default.disconnect();
        logger_1.logger.info('Database disconnected successfully');
    }
    catch (error) {
        logger_1.logger.error('Error disconnecting from database:', error);
        throw error;
    }
}
//# sourceMappingURL=database.js.map