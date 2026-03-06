import { Request, Response } from 'express';
import { getAuthUrl, exchangeCodeForTokens } from '../services/googleCalendarService';
import Therapist from '../models/Therapist';

export const initiateGoogleOAuth = (req: Request, res: Response) => {
    // req.user is guaranteed by authMiddleware
    const therapistId = (req as any).user.id;
    const url = getAuthUrl(therapistId);
    res.json({ url });
};

export const googleOAuthCallback = async (req: Request, res: Response) => {
    try {
        const { code, state } = req.query; // state contains therapistId

        if (!code) return res.status(400).send('No code provided');
        if (!state) return res.status(400).send('No state provided (missing therapistId)');

        const tokens = await exchangeCodeForTokens(code as string);

        console.log('Google OAuth successful. Tokens received for therapist:', state);

        // Find therapist using state
        const therapist = await Therapist.findById(state);

        if (!therapist) {
            return res.status(404).send('Therapist not found for OAuth linking');
        }

        // Save tokens to therapist profile
        therapist.googleRefreshToken = tokens.refresh_token || therapist.googleRefreshToken;
        therapist.googleAccessToken = tokens.access_token || therapist.googleAccessToken;
        await therapist.save();

        // Redirect back to frontend
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/therapist/dashboard?google_success=true`);
    } catch (error) {
        console.error('Google OAuth Callback Error:', error);
        res.status(500).send('Authentication failed');
    }
};
