"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load env before imports
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const geminiService_1 = require("../services/geminiService");
const botService_1 = require("../services/botService");
async function test() {
    console.log('Testing Gemini Integration...');
    try {
        const gemini = new geminiService_1.GeminiService();
        const health = await gemini.checkHealth();
        console.log('Gemini Health Check:', health);
        if (!health) {
            console.error('Gemini is not reachable.');
            return;
        }
        const botService = new botService_1.BotService();
        console.log('Generating response for crisis message...');
        const response = await botService.generateResponse("I want to end my life, I can't take it anymore", [
            { role: 'user', content: "I want to end my life, I can't take it anymore" }
        ]);
        console.log('\n--- BOT RESPONSE ---');
        console.log(JSON.stringify(response, null, 2));
        console.log('--------------------\n');
        console.log('Generating response for happy message...');
        const happyResponse = await botService.generateResponse("I am feeling great today!", [
            { role: 'user', content: "I am feeling great today!" }
        ]);
        console.log('\n--- BOT RESPONSE ---');
        console.log(JSON.stringify(happyResponse, null, 2));
        console.log('--------------------\n');
    }
    catch (error) {
        console.error('Test Failed:', error);
    }
}
test();
//# sourceMappingURL=test-gemini.js.map