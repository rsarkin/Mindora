"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = connectRedis;
exports.getRedisClient = getRedisClient;
exports.disconnectRedis = disconnectRedis;
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
let client = null;
async function connectRedis() {
    const useRedis = process.env.USE_REDIS !== 'false';
    const redisUrl = process.env.REDIS_URL;
    if (!useRedis || !redisUrl) {
        logger_1.logger.warn('⚠️ Redis disabled or URL missing. Caching turned off (Demo Mode).');
        // Create a mock client that does nothing but doesn't crash
        client = {
            connect: async () => { },
            quit: async () => { },
            get: async () => null,
            set: async () => 'OK',
            del: async () => 1,
            on: () => { },
            isOpen: true
        };
        return;
    }
    try {
        client = (0, redis_1.createClient)({ url: redisUrl });
        client.on('error', (err) => logger_1.logger.warn(`Redis client error: ${String(err)}`));
        await client.connect();
        logger_1.logger.info('✅ Redis connected successfully');
    }
    catch (error) {
        logger_1.logger.warn('⚠️ Redis connection failed; continuing without cache (Mock Mode)');
        // Fallback to mock if connection fails
        client = {
            connect: async () => { },
            quit: async () => { },
            get: async () => null,
            set: async () => 'OK',
            del: async () => 1,
            on: () => { },
            isOpen: true
        };
    }
}
function getRedisClient() {
    return client;
}
async function disconnectRedis() {
    try {
        if (client) {
            await client.quit();
            logger_1.logger.info('Redis disconnected successfully');
        }
    }
    catch (error) {
        logger_1.logger.warn('Error disconnecting Redis');
    }
}
//# sourceMappingURL=redis.js.map