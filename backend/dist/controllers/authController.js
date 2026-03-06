"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionStatus = exports.createAnonymousSession = exports.login = exports.register = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const AuthService = __importStar(require("../services/authService"));
const register = async (req, res) => {
    try {
        const responseData = await AuthService.registerUser(req.body, req.files);
        res.status(201).json(responseData);
    }
    catch (error) {
        logger_1.default.error('Registration error:', error);
        if (error.message === 'User already exists') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const responseData = await AuthService.loginUser(req.body);
        res.status(200).json(responseData);
    }
    catch (error) {
        logger_1.default.error('Login error:', error);
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.login = login;
const createAnonymousSession = async (req, res) => {
    try {
        const result = await AuthService.createAnonymousSessionService(req.body);
        res.status(result.status).json(result.data);
    }
    catch (error) {
        logger_1.default.error('Error creating anonymous session:', error);
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
exports.createAnonymousSession = createAnonymousSession;
const getSessionStatus = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const statusData = await AuthService.getSessionStatusService(sessionId);
        res.status(200).json(statusData);
    }
    catch (error) {
        logger_1.default.error('Error fetching session status:', error);
        if (error.status) {
            return res.status(error.status).json({ error: error.message === 'Session not found' ? 'Not Found' : 'Bad Request', message: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch session status' });
    }
};
exports.getSessionStatus = getSessionStatus;
//# sourceMappingURL=authController.js.map