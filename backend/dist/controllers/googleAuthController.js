"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleOAuthCallback = exports.initiateGoogleOAuth = void 0;
const googleCalendarService_1 = require("../services/googleCalendarService");
const initiateGoogleOAuth = (req, res) => {
    const url = (0, googleCalendarService_1.getAuthUrl)();
    res.json({ url });
};
exports.initiateGoogleOAuth = initiateGoogleOAuth;
const googleOAuthCallback = async (req, res) => {
    try {
        const { code, state } = req.query; // state could contain therapistId or userId
        if (!code)
            return res.status(400).send('No code provided');
        const tokens = await (0, googleCalendarService_1.exchangeCodeForTokens)(code);
        // In a real app, you'd use the state to find the therapist or use req.user if session exists
        // Since this is a redirect from Google, we might not have the session depending on config.
        // For simplicity, let's assume we can get therapist from session or state.
        // Mocking finding therapist for now. In real implementation, redirect home with success.
        console.log('Google OAuth successful. Tokens received:', tokens);
        // Save tokens to therapist profile
        // Find therapist using state or existing user session
        // const therapist = await Therapist.findOneAndUpdate({ userId: req.user.id }, { googleRefreshToken: tokens.refresh_token, googleAccessToken: tokens.access_token });
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