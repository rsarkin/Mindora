
import axios from 'axios';

const testRegistration = async () => {
    try {
        console.log('Attempting registration on port 5000...');
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test Debugger',
            email: `debug_${Date.now()}@example.com`,
            password: 'password123',
            role: 'patient'
        });
        console.log('Success (5000):', response.status, response.data);
    } catch (error: any) {
        console.error('Error (5000):', error.response ? error.response.data : error.message);
    }
};

testRegistration();
