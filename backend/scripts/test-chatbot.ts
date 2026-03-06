import { CrisisDetectionService } from '../src/services/crisisDetectionService';
import { ChatService } from '../src/services/chatService';
import dotenv from 'dotenv';

dotenv.config();

async function testChatbot() {
    console.log('Starting Chatbot Logic Test...');

    const crisisService = new CrisisDetectionService();
    const chatService = new ChatService();

    const testMessages = [
        "I am feeling great today!",
        "I feel a bit sad and lonely.",
        "I want to end it all. I can't take this anymore."
    ];

    for (const msg of testMessages) {
        console.log(`\n--- Testing Message: "${msg}" ---`);

        // 1. Analyze Message
        console.log('Analyzing message...');
        const analysis = await crisisService.analyzeMessage(msg, {
            userId: 'test-user',
            conversationId: 'test-conv',
            messageHistory: []
        });

        console.log('Analysis Result:', {
            crisis_level: analysis.crisis_level,
            sentiment: analysis.sentiment_analysis?.label,
            keywords: analysis.keywords_detected
        });

        // 2. Generate Response
        console.log('Generating Bot Response...');
        const response = await chatService.generateBotResponse(msg, analysis, 'test-conv');

        console.log('Bot Response:', response.content);
        console.log('Suggestions:', response.suggestions);
    }
}

testChatbot().catch(console.error);
