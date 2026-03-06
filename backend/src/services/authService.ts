import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Therapist from '../models/Therapist';
import AnonymousSession from '../models/AnonymousSession';
import logger from '../utils/logger';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_SECRET = process.env.JWT_SECRET as string;

enum UserRole {
    PATIENT = 'PATIENT',
    THERAPIST = 'THERAPIST',
    ADMIN = 'ADMIN'
}

export const registerUser = async (data: any, files?: any) => {
    const {
        name, email, password, role,
        specialization, specializations, bio, experienceYears, hourlyRate,
        licenseNumber, licenseState, phone, location
    } = data;
    const normalizedRole = role && role.toUpperCase() === 'THERAPIST' ? UserRole.THERAPIST : role && role.toUpperCase() === 'ADMIN' ? UserRole.ADMIN : UserRole.PATIENT;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Process Multer files
    const avatarPath = files?.avatar?.[0]?.filename || undefined;
    const documentPaths = files?.documents?.map((f: any) => f.filename) || [];

    const user = await User.create({
        name,
        email,
        passwordHash,
        role: normalizedRole,
        accountStatus: normalizedRole === UserRole.THERAPIST ? 'PENDING_VERIFICATION' : 'ACTIVE',
        phone,
        location,
        avatar: avatarPath
    });

    if (normalizedRole === UserRole.THERAPIST) {

        let parsedSpecs: string[] = [];
        try {
            parsedSpecs = specializations ? JSON.parse(specializations) : (specialization ? [specialization] : []);
        } catch {
            parsedSpecs = typeof specializations === 'string' ? [specializations] : (specialization ? [specialization] : []);
        }

        await Therapist.create({
            userId: user._id,
            licenseNumber: licenseNumber || `TEMP_${Date.now()}`,
            licenseState: licenseState || 'NA',
            licenseExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            specializations: parsedSpecs,
            bio: bio || '',
            experienceYears: experienceYears ? parseInt(experienceYears, 10) : 0,
            hourlyRateINR: hourlyRate ? parseFloat(hourlyRate) : 0.0,
            hourlyRateUSD: hourlyRate ? parseFloat(hourlyRate) / 80 : 0.0,
            verificationStatus: 'PENDING',
            verificationDocuments: documentPaths
        });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

    return {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role.toLowerCase() }
    };
};

export const loginUser = async (data: any) => {
    const { email, password } = data;
    const user = await User.findOne({ email });

    if (!user || !user.passwordHash) {
        const error: any = new Error('No account found with this email.');
        error.status = 404;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        const error: any = new Error('Invalid email or password. Please try again.');
        error.status = 401;
        throw error;
    }

    if (user.role === 'THERAPIST' && user.accountStatus === 'PENDING_VERIFICATION') {
        const error: any = new Error('Your account is pending admin verification.');
        error.status = 403;
        throw error;
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

    return {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role.toLowerCase() }
    };
};

export const createAnonymousSessionService = async (data: any) => {
    const { deviceFingerprint, initialEmotion, initialMessage } = data;

    if (!deviceFingerprint || typeof deviceFingerprint !== 'string') {
        const error: any = new Error('deviceFingerprint is required and must be a string');
        error.status = 400;
        throw error;
    }
    if (deviceFingerprint.length < 10 || deviceFingerprint.length > 500) {
        const error: any = new Error('deviceFingerprint must be between 10 and 500 characters');
        error.status = 400;
        throw error;
    }

    const existingSession = await AnonymousSession.findOne({ deviceFingerprint });
    if (existingSession) {
        if (existingSession.status === 'EXPIRED') {
            const error: any = new Error('This anonymous session has expired. Please start a new session.');
            error.status = 410;
            error.codeName = 'Session Expired';
            throw error;
        }
        if (existingSession.status === 'CONVERTED_TO_USER') {
            const error: any = new Error('This device is already associated with a registered account. Please log in.');
            error.status = 409;
            error.codeName = 'Session Already Converted';
            error.userId = existingSession.convertedUserId;
            throw error;
        }

        const token = jwt.sign(
            { sessionId: existingSession._id, type: 'anonymous', deviceFingerprint: existingSession.deviceFingerprint },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN as any }
        );

        return {
            status: 200,
            data: { token, sessionId: existingSession._id, messageCount: existingSession.messageCount, maxFreeMessages: existingSession.maxFreeMessages, isExisting: true }
        };
    }

    const temporaryName = `Guest_${Math.random().toString(36).substring(2, 8)}`;
    const newSession = await AnonymousSession.create({
        deviceFingerprint, temporaryName, initialMessage: initialMessage || null, detectedEmotion: initialEmotion || null, messageCount: 0, maxFreeMessages: 5, status: 'ACTIVE',
    });

    const token = jwt.sign(
        { sessionId: newSession._id, type: 'anonymous', deviceFingerprint: newSession.deviceFingerprint },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as any }
    );

    return {
        status: 201,
        data: { token, sessionId: newSession._id, temporaryName: newSession.temporaryName, messageCount: newSession.messageCount, maxFreeMessages: newSession.maxFreeMessages, isExisting: false }
    };
};

export const getSessionStatusService = async (sessionId: string) => {
    if (!sessionId) {
        const error: any = new Error('sessionId is required');
        error.status = 400;
        throw error;
    }

    const session = await AnonymousSession.findById(sessionId);
    if (!session) {
        const error: any = new Error('Session not found');
        error.status = 404;
        throw error;
    }

    return {
        sessionId: session._id,
        status: session.status,
        messageCount: session.messageCount,
        maxFreeMessages: session.maxFreeMessages,
        hasReachedLimit: session.messageCount >= session.maxFreeMessages,
        expiresAt: session.expiresAt,
        convertedUserId: session.convertedUserId
    };
};
