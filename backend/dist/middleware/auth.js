"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../utils/logger"));
const authMiddleware = async (req, res, next) => {
    try {
        const authReq = req;
        const token = req.header('Authorization')?.replace('Bearer ', '');
        logger_1.default.info(`AuthMiddleware - Token present: ${!!token}`);
        if (!token) {
            return res.status(401).send({ error: 'Please authenticate.' });
        }
        // The JWT_SECRET check is removed as per the provided snippet,
        // assuming it's handled at application startup or via type assertion.
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        logger_1.default.info(`AuthMiddleware - Decoded: ${JSON.stringify(decoded)}`);
        authReq.user = decoded;
        next();
    }
    catch (error) {
        logger_1.default.error(`AuthMiddleware error: ${error}`);
        res.status(401).send({ error: 'Please authenticate.' });
    }
};
exports.authMiddleware = authMiddleware;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        const authReq = req;
        if (!authReq.user || !authReq.user.role) {
            return res.status(403).json({ error: 'Forbidden: No role assigned.' });
        }
        if (!roles.includes(authReq.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions.' });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
//# sourceMappingURL=auth.js.map