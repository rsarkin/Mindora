const axios = require('axios');

async function testML() {
    console.log('Testing ML Service Connection...');
    try {
        const response = await axios.post('http://127.0.0.1:8000/analyze/message', {
            text: "I am feeling very sad and hopeless.",
            user_id: "test-user"
        });
        console.log('ML Service Response:', response.data);
    } catch (error) {
        console.error('ML Service Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('ML Service is NOT running on port 8000.');
        }
    }
}

testML();
