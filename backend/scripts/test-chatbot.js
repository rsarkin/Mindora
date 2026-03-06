const { CrisisDetectionService } = require('../dist/services/crisisDetectionService');
const { ChatService } = require('../dist/services/chatService');
const dotenv = require('dotenv');

dotenv.config();

async function testChatbot() {
    console.log('Starting Chatbot Logic Test (JS)...');

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
        let analysis;
        try {
            analysis = await crisisService.analyzeMessage(msg, {
                userId: 'test-user',
                conversationId: 'test-conv',
                messageHistory: []
            });
        } catch (err) {
            console.error('Analysis failed:', err.message);
            analysis = { crisis_level: 1, sentiment_analysis: { label: 'neutral' } };
        }

        console.log('Analysis Result:', {
            crisis_level: analysis.crisis_level,
            sentiment: analysis.sentiment_analysis ? analysis.sentiment_analysis.label : 'unknown',
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
