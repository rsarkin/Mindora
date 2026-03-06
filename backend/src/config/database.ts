import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export interface DatabaseConfig {
    uri: string;
    options: mongoose.ConnectOptions;
}

export const config: DatabaseConfig = {
    uri: process.env.DATABASE_URL || 'mongodb://localhost:27017/mental_health_chatbot',
    options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4 // Use IPv4, skip trying IPv6
    }
};

export async function connectDatabase(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;

    if (!mongoUri) {
        logger.error('❌ CRITICAL: MongoDB URI missing.');
        throw new Error('MongoDB URI is required.');
    }

    try {
        await mongoose.connect(mongoUri, config.options);
        logger.info('✅ Database connected successfully');

        // Handle connection events
        mongoose.connection.on('error', (error) => {
            logger.error('Database connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('Database disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('Database reconnected');
        });

    } catch (error) {
        logger.error('❌ CRITICAL: MongoDB connection failed. Server cannot start.', error);
        throw error;
    }
}

export async function disconnectDatabase(): Promise<void> {
    try {
        await mongoose.disconnect();
        logger.info('Database disconnected successfully');
    } catch (error) {
        logger.error('Error disconnecting from database:', error);
        throw error;
    }
}