import axios from 'axios';

async function testMessagesApi() {
    try {
        const email = 'testuser' + Date.now() + '@example.com';
        const password = 'Password123!@#';
        
        console.log('Registering user...');
        const regRes = await axios.post('http://localhost:3001/api/auth/register', {
            name: 'Test Patient',
            email,
            password,
            role: 'PATIENT'
        });
        
        const token = regRes.data.token;
        console.log('Got token');
        
        console.log('Fetching appointments...');
        const appts = await axios.get('http://localhost:3001/api/appointments/my-appointments', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Appointments fetched:', appts.data.length);
        
        // check communities and pods just in case
        console.log('Fetching my pods...');
        const pods = await axios.get('http://localhost:3001/api/pods/my-pods', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Pods fetched:', pods.data.length);
        
    } catch (err: any) {
        console.log('Error:', err.response?.status, err.response?.data || err.message);
    }
}

testMessagesApi();
