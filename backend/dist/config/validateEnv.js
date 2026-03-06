"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = void 0;
const logger_1 = require("../utils/logger");
const validateEnv = () => {
    const requiredEnvVars = [
        'JWT_SECRET',
        'MONGODB_URI',
        'DATABASE_URL'
    ];
    const missingVars = [];
    requiredEnvVars.forEach((envVar) => {
        if (!process.env[envVar]) {
            missingVars.push(envVar);
        }
    });
    if (missingVars.length > 0) {
        const errorMsg = `❌ CRITICAL: Missing required environment variables: ${missingVars.join(', ')}`;
        logger_1.logger.error(errorMsg);
        throw new Error(errorMsg);
    }
    // Warn if using default unsafe dev secrets (if we were to allow them, but we aren't anymore)
    if (process.env.JWT_SECRET === 'your_jwt_secret' || process.env.JWT_SECRET === 'your_jwt_secret_fallback_dev_only') {
        logger_1.logger.warn('⚠️ WARNING: You are using a default/insecure JWT_SECRET. This is unsafe for production.');
    }
    logger_1.logger.info('✅ Environment variables validated successfully.');
};
exports.validateEnv = validateEnv;
//# sourceMappingURL=validateEnv.js.map