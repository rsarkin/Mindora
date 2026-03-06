"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotService = void 0;
const geminiService_1 = require("./geminiService");
const crisisDetectionService_1 = require("./crisisDetectionService");
const logger_1 = require("../utils/logger");
class BotService {
    constructor() {
        this.geminiService = new geminiService_1.GeminiService();
        this.crisisService = new crisisDetectionService_1.CrisisDetectionService();
    }
    async generateResponse(message, history = []) {
        try {
            // 1. Analyze Message for Crisis
            const analysis = await this.crisisService.analyzeMessage(message, {
                userId: 'anonymous', // Not strictly needed for ML inference
                conversationId: 'rest_bot',
                messageHistory: history
            });
            const crisisLevel = analysis.crisis_level || 1;
            const sentiment = analysis.sentiment_analysis?.label || 'neutral';
            const keywords = analysis.keywords_detected || [];
            // 2. High Crisis Fallback (Force Emergency Hub)
            if (crisisLevel >= 8) {
                return {
                    content: "I am an AI, not a human doctor. I'm detecting you are going through an incredibly difficult moment. You are in a safe space, but you need immediate professional help right now. Please call Tele-MANAS at 14416 or KIRAN at 1800-599-0019 immediately. They are available 24x7 in India.",
                    type: 'bot_response',
                    suggestions: ['I need help now', 'Show emergency numbers'],
                    action: 'emergency_hub'
                };
            }
            // 3. Prompt Construction
            const formattedHistory = history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');
            const systemPrompt = `You are Mindora, a culturally sensitive, highly direct, and empathetic AI companion for users in India. 
CRITICAL ETHICAL RULES:
1. NEVER provide a clinical diagnosis.
2. **BE EXTREMELY CONCISE**: Your user is stressed. Keep responses to 1-3 short sentences MAX. Do NOT output long paragraphs of advice or lists. Get straight to the point.
3. Act like a helpful therapist fixing the core problem right now. Listen, validate, and give ONE short, actionable coping mechanism. Do not give generic "suggestions".
4. ONLY if they continue to struggle or explicitly need more help than you can provide, weave the idea of human therapy organically into conversation. (e.g., "This is heavy, and while I'm here, a human therapist on Mindora could really help you untangle this.")
5. If you naturally suggest a therapist or they ask for one, you must END YOUR MESSAGE with the precise exact phrase: [TRIGGER_BOOKING_LINK].
6. If the user mentions self-harm or suicide, you MUST include these 24x7 India helplines directly in your response: Tele-MANAS (14416) and KIRAN (1800-599-0019).

OUTPUT FORMAT:
You MUST output ONLY a valid JSON object with the following structure. Do not wrap it in markdown code blocks.
{
  "response": "Your concise 1-3 sentence response here...",
  "suggestions": ["Short context-aware reply option 1", "Short context-aware reply option 2", "Short context-aware reply option 3"]
}`;
            const prompt = `${systemPrompt}

ANALYSIS CONTEXT:
- Crisis Level: ${crisisLevel}/10
- Sentiment: ${sentiment}
- Detected Keywords: ${keywords.join(', ')}

CONVERSATION HISTORY:
${formattedHistory}

CURRENT USER MESSAGE:
"${message}"

Respond with empathy and care using the requested JSON format:
`;
            // 4. Gemini Generation
            const rawContent = await this.geminiService.generateResponse(prompt);
            let finalContent = "";
            let generatedSuggestions = [];
            try {
                // Remove markdown formatting if the model still includes it
                const cleanedContent = rawContent.replace(/```json\n?|\n?```/g, '').trim();
                const parsed = JSON.parse(cleanedContent);
                finalContent = parsed.response;
                generatedSuggestions = parsed.suggestions || [];
            }
            catch (err) {
                logger_1.logger.warn("Failed to parse Gemini JSON, falling back to raw text");
                finalContent = rawContent;
            }
            // Post-process the response for conversion flags
            let actionFlag = undefined;
            if (finalContent.includes('[TRIGGER_BOOKING_LINK]')) {
                actionFlag = 'book_therapist';
                finalContent = finalContent.replace('[TRIGGER_BOOKING_LINK]', '').trim();
            }
            let suggestions = generatedSuggestions.length >= 2 ? generatedSuggestions : ['Tell me more', 'I am listening', 'Thank you'];
            // Override or insert therapeutic actions if needed
            if (actionFlag === 'book_therapist') {
                suggestions = ['Yes, show me therapists', ...suggestions.slice(0, 2)];
            }
            else if (crisisLevel >= 7) {
                if (!actionFlag) {
                    actionFlag = 'emergency_hub';
                }
            }
            return {
                content: finalContent || "I'm here for you. Tell me more.",
                type: 'bot_response',
                suggestions: suggestions,
                action: actionFlag
            };
        }
        catch (error) {
            logger_1.logger.error('BotService Error:', error);
            return {
                content: "I'm having a little trouble connecting right now, but please know I'm here for you. If you need urgent support, please reach out to Tele-MANAS (14416).",
                type: 'bot_response',
                suggestions: ['Try again later', 'Emergency Resources']
            };
        }
    }
}
exports.BotService = BotService;
//# sourceMappingURL=botService.js.map