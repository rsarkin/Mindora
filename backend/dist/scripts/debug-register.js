"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const testRegistration = async () => {
    try {
        console.log('Attempting registration on port 5000...');
        const response = await axios_1.default.post('http://localhost:5000/api/auth/register', {
            name: 'Test Debugger',
            email: `debug_${Date.now()}@example.com`,
            password: 'password123',
            role: 'patient'
        });
        console.log('Success (5000):', response.status, response.data);
    }
    catch (error) {
        console.error('Error (5000):', error.response ? error.response.data : error.message);
    }
};
testRegistration();
//# sourceMappingURL=debug-register.js.map