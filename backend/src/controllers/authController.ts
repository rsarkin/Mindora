import { Request, Response } from 'express';
import logger from '../utils/logger';
import * as AuthService from '../services/authService';

export const register = async (req: Request, res: Response) => {
    try {
        const responseData = await AuthService.registerUser(req.body, req.files);
        res.status(201).json(responseData);
    } catch (error: any) {
        logger.error('Registration error:', error);
        if (error.message === 'User already exists') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const responseData = await AuthService.loginUser(req.body);
        res.status(200).json(responseData);
    } catch (error: any) {
        logger.error('Login error:', error);
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createAnonymousSession = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.createAnonymousSessionService(req.body);
        res.status(result.status).json(result.data);
    } catch (error: any) {
        logger.error('Error creating anonymous session:', error);
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Conflict', message: 'A session with this device fingerprint already exists.' });
        }
        if (error.status) {
            return res.status(error.status).json({
                error: error.codeName || 'Bad Request',
                message: error.message,
                ...(error.userId && { userId: error.userId })
            });
        }
        res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred. Please try again later.' });
    }
};

export const getSessionStatus = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const statusData = await AuthService.getSessionStatusService(sessionId);
        res.status(200).json(statusData);
    } catch (error: any) {
        logger.error('Error fetching session status:', error);
        if (error.status) {
            return res.status(error.status).json({ error: error.message === 'Session not found' ? 'Not Found' : 'Bad Request', message: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch session status' });
    }
};
