import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack);

    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large', message: 'The uploaded file exceeds the 20MB limit.' });
        }
        return res.status(400).json({ error: 'Upload failed', message: err.message });
    }

    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
    });
};
