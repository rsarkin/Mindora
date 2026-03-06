"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMeetingEvent = exports.exchangeCodeForTokens = exports.getAuthUrl = exports.getOAuthClient = void 0;
const googleapis_1 = require("googleapis");
const google_auth_library_1 = require("google-auth-library");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback';
const getOAuthClient = () => {
    return new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);
};
exports.getOAuthClient = getOAuthClient;
const getAuthUrl = () => {
    const client = (0, exports.getOAuthClient)();
    return client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar.events'],
        prompt: 'consent'
    });
};
exports.getAuthUrl = getAuthUrl;
const exchangeCodeForTokens = async (code) => {
    const client = (0, exports.getOAuthClient)();
    const { tokens } = await client.getToken(code);
    return tokens;
};
exports.exchangeCodeForTokens = exchangeCodeForTokens;
const createMeetingEvent = async (appointment, therapist, patient) => {
    // If keys are missing, return mock link
    if (!GOOGLE_CLIENT_ID || !therapist.googleRefreshToken) {
        console.warn('Google OAuth keys or Therapist tokens missing. Returning mock Meet link.');
        return 'https://meet.google.com/mock-appointment-' + appointment._id;
    }
    try {
        const client = (0, exports.getOAuthClient)();
        client.setCredentials({
            refresh_token: therapist.googleRefreshToken
        });
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: client });
        const event = {
            summary: `Mindora Session: ${patient.name} & ${therapist.userId.name}`,
            description: 'Your scheduled therapy session on Mindora.',
            start: {
                dateTime: new Date(appointment.scheduledAt).toISOString(),
                timeZone: 'UTC',
            },
            end: {
                dateTime: new Date(new Date(appointment.scheduledAt).getTime() + (appointment.durationMinutes || 60) * 60000).toISOString(),
                timeZone: 'UTC',
            },
            attendees: [
                { email: patient.email },
                { email: therapist.userId.email },
            ],
            conferenceData: {
                createRequest: {
                    requestId: `mindora_${appointment._id}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' },
                },
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 15 },
                    { method: 'popup', minutes: 15 },
                ],
            },
        };
        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
            conferenceDataVersion: 1,
        });
        return response.data.hangoutLink || response.data.htmlLink || `https://meet.google.com/mock-appointment-${appointment._id}`;
    }
    catch (error) {
        console.error('Error creating Google Calendar event:', error);
        // Fallback to mock link so flow doesn't break
        return 'https://meet.google.com/mock-appointment-' + appointment._id;
    }
};
exports.createMeetingEvent = createMeetingEvent;
//# sourceMappingURL=googleCalendarService.js.map