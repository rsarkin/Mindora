
import dotenv from 'dotenv';
import path from 'path';
// Load env before imports
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { GeminiService } from '../services/geminiService';
import { BotService } from '../services/botService';

async function test() {
    console.log('Testing Gemini Integration...');

    try {
        const gemini = new GeminiService();
        const health = await gemini.checkHealth();
        console.log('Gemini Health Check:', health);

        if (!health) {
            console.error('Gemini is not reachable.');
            return;
        }

        const botService = new BotService();
        console.log('Generating response for crisis message...');

        const response = await botService.generateResponse(
            "I want to end my life, I can't take it anymore",
            [
                { role: 'user', content: "I want to end my life, I can't take it anymore" }
            ]
        );

        console.log('\n--- BOT RESPONSE ---');
        console.log(JSON.stringify(response, null, 2));
        console.log('--------------------\n');

        console.log('Generating response for happy message...');
        const happyResponse = await botService.generateResponse(
            "I am feeling great today!",
            [
                { role: 'user', content: "I am feeling great today!" }
            ]
        );
        console.log('\n--- BOT RESPONSE ---');
        console.log(JSON.stringify(happyResponse, null, 2));
        console.log('--------------------\n');

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

test();
