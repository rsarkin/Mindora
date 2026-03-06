import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://technophilia4:technophilia4@technophilia4.pcuz03q.mongodb.net/mental_health_chatbot';

async function findUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const UserSchema = new mongoose.Schema({
            email: String,
            name: String,
            role: String,
            createdAt: Date
        }, { timestamps: true });

        const User = mongoose.model('User', UserSchema);

        const users = await User.find({}).sort({ createdAt: -1 }).limit(10);

        if (users.length === 0) {
            console.log('No users found in the database');
        } else {
            console.log('Recent users:');
            users.forEach(user => {
                console.log(`Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, CreatedAt: ${user.createdAt}`);
            });
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

findUser();
