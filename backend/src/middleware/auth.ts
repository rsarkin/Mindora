import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
// import { IUser } from '../models/User';

interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authReq = req as any;
        const token = req.header('Authorization')?.replace('Bearer ', '');
        logger.info(`[AuthDebug] Token present: ${!!token} for ${req.method} ${req.url}`);

        if (!token) {
            return res.status(401).send({ error: 'Please authenticate.' });
        }

        // The JWT_SECRET check is removed as per the provided snippet,
        // assuming it's handled at application startup or via type assertion.
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        logger.info(`AuthMiddleware - Decoded: ${JSON.stringify(decoded)}`);
        authReq.user = decoded;
        next();
    } catch (error) {
        logger.error(`AuthMiddleware error: ${error}`);
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as any;
        if (!authReq.user || !authReq.user.role) {
            return res.status(403).json({ error: 'Forbidden: No role assigned.' });
        }

        if (!roles.includes(authReq.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions.' });
        }

        next();
    };
};
