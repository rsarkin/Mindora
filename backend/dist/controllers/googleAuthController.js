"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleOAuthCallback = exports.initiateGoogleOAuth = void 0;
const googleCalendarService_1 = require("../services/googleCalendarService");
const Therapist_1 = __importDefault(require("../models/Therapist"));
const initiateGoogleOAuth = (req, res) => {
    // req.user is guaranteed by authMiddleware
    const therapistId = req.user.id;
    const url = (0, googleCalendarService_1.getAuthUrl)(therapistId);
    res.json({ url });
};
exports.initiateGoogleOAuth = initiateGoogleOAuth;
const googleOAuthCallback = async (req, res) => {
    try {
        const { code, state } = req.query; // state contains therapistId
        if (!code)
            return res.status(400).send('No code provided');
        if (!state)
            return res.status(400).send('No state provided (missing therapistId)');
        const tokens = await (0, googleCalendarService_1.exchangeCodeForTokens)(code);
        console.log('Google OAuth successful. Tokens received for therapist:', state);
        // Find therapist using state
        const therapist = await Therapist_1.default.findById(state);
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
    }
    catch (error) {
        console.error('Google OAuth Callback Error:', error);
        res.status(500).send('Authentication failed');
    }
};
exports.googleOAuthCallback = googleOAuthCallback;
//# sourceMappingURL=googleAuthController.js.map