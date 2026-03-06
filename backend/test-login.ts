import axios from 'axios';

async function testLogin() {
    try {
        const email = 'testuser' + Date.now() + '@example.com';
        const password = 'Password123!@#';
        
        console.log('Registering user:', email);
        const regRes = await axios.post('http://localhost:3001/api/auth/register', {
            name: 'Test User',
            email,
            password,
            role: 'PATIENT'
        });
        
        console.log('Registration success:', regRes.data.user.email);
        
        console.log('Logging in user...');
        const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
            email,
            password
        });
        
        console.log('Login success! Token:', loginRes.data.token ? 'exists' : 'missing');
    } catch (err: any) {
        console.log('Error:', err.response?.status, err.response?.data || err.message);
    }
}

testLogin();
