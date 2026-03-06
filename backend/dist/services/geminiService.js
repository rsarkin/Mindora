"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const logger_1 = require("../utils/logger");
class GeminiService {
    constructor() {
        this.genAI = null;
        this.isAvailable = false;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('⚠️  GEMINI_API_KEY is missing. AI features disabled. Using fallback responses.');
            logger_1.logger.warn('GEMINI_API_KEY not found - Gemini service will use fallback mode');
            this.isAvailable = false;
            return; // Exit constructor early
        }
        try {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
            this.isAvailable = true;
            logger_1.logger.info('✅ Gemini AI service initialized successfully');
        }
        catch (error) {
            console.warn('⚠️  Failed to initialize Gemini. Using fallback mode.');
            logger_1.logger.error('Failed to initialize Gemini service:', error);
            this.isAvailable = false;
        }
    }
    fallbackResponse() {
        return "I'm here to listen and support you. While my AI features are temporarily unavailable, " +
            "I want you to know that what you're feeling is valid. If you're in crisis, please reach out " +
            "to a crisis helpline: Call Tele-MANAS at 14416 or KIRAN at 1800-599-0019. You're not alone.";
    }
    async generateResponse(prompt) {
        // Check if Gemini is available
        if (!this.isAvailable) {
            logger_1.logger.warn('Gemini unavailable - returning fallback response');
            return this.fallbackResponse();
        }
        try {
            // Configure safety settings to allow discussion of sensitive topics (like mental health)
            // but still block malicious content. We rely on the prompt to handle safety constructively.
            const safetySettings = [
                {
                    category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                // Self-harm category removed due to SDK type definition mismatch. 
                // Relying on DANGEROUS_CONTENT and prompt engineering.
            ];
            const result = await this.model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                safetySettings: safetySettings,
            });
            const response = result.response;
            const text = response.text();
            return text;
        }
        catch (error) {
            logger_1.logger.error('Error generating response from Gemini:', error);
            // Check for safety blocking
            if (error.response?.promptFeedback?.blockReason) {
                logger_1.logger.warn(`Gemini blocked content: ${error.response.promptFeedback.blockReason}`);
                return "I care about your safety. If you are in immediate danger, please call Tele-MANAS (14416) or Emergency (112). I cannot continue this specific conversation right now.";
            }
            // Return fallback on any error
            logger_1.logger.warn('Gemini error - falling back to default response');
            return this.fallbackResponse();
        }
    }
    async checkHealth() {
        if (!this.isAvailable) {
            return false;
        }
        try {
            // fast probe
            const result = await this.model.generateContent("ping");
            return !!result.response.text();
        }
        catch (error) {
            logger_1.logger.error('Gemini service health check failed:', error);
            return false;
        }
    }
}
exports.GeminiService = GeminiService;
//# sourceMappingURL=geminiService.js.map