import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { logger } from '../utils/logger';

export class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any;
    private isAvailable: boolean = false;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('⚠️  GEMINI_API_KEY is missing. AI features disabled. Using fallback responses.');
            logger.warn('GEMINI_API_KEY not found - Gemini service will use fallback mode');
            this.isAvailable = false;
            return; // Exit constructor early
        }

        try {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
            this.isAvailable = true;
            logger.info('✅ Gemini AI service initialized successfully');
        } catch (error) {
            console.warn('⚠️  Failed to initialize Gemini. Using fallback mode.');
            logger.error('Failed to initialize Gemini service:', error);
            this.isAvailable = false;
        }
    }

    private fallbackResponse(): string {
        return "I'm here to listen and support you. While my AI features are temporarily unavailable, " +
            "I want you to know that what you're feeling is valid. If you're in crisis, please reach out " +
            "to a crisis helpline: Call Tele-MANAS at 14416 or KIRAN at 1800-599-0019. You're not alone.";
    }

    async generateResponse(prompt: string): Promise<string> {
        // Check if Gemini is available
        if (!this.isAvailable) {
            logger.warn('Gemini unavailable - returning fallback response');
            return this.fallbackResponse();
        }

        try {
            // Configure safety settings to allow discussion of sensitive topics (like mental health)
            // but still block malicious content. We rely on the prompt to handle safety constructively.
            const safetySettings = [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
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
        } catch (error: any) {
            logger.error('Error generating response from Gemini:', error);
            // Check for safety blocking
            if (error.response?.promptFeedback?.blockReason) {
                logger.warn(`Gemini blocked content: ${error.response.promptFeedback.blockReason}`);
                return "I care about your safety. If you are in immediate danger, please call Tele-MANAS (14416) or Emergency (112). I cannot continue this specific conversation right now.";
            }
            // Return fallback on any error
            logger.warn('Gemini error - falling back to default response');
            return this.fallbackResponse();
        }
    }

    async checkHealth(): Promise<boolean> {
        if (!this.isAvailable) {
            return false;
        }

        try {
            // fast probe
            const result = await this.model.generateContent("ping");
            return !!result.response.text();
        } catch (error) {
            logger.error('Gemini service health check failed:', error);
            return false;
        }
    }
}
